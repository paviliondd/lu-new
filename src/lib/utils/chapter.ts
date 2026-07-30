import type { Post } from "@/app/data";
import { formatTopicLabel } from "@/lib/utils/formatTopic";

export function parseChapterNumber(title: string): number | null {
  if (!title) return null;

  // Match: "Phần 1", "Chapter 2", "Chap 3", "Chương 4", "Bài 5", "Part 6", "Tập 7", "Lab 8", "P9", "#10"
  const matchExplicit = title.match(/(?:Phần|Chapter|Chap|Chương|Bài|Part|Tập|Lab|Volume|Vol|P|#)\s*:?\s*(\d+)/i);
  if (matchExplicit && matchExplicit[1]) {
    const num = parseInt(matchExplicit[1], 10);
    if (!Number.isNaN(num)) return num;
  }

  // Match prefix numbers: "[Ansible] 1. Intro" or "Ansible 1: Intro" or "1. Intro"
  const matchPrefix = title.match(/(?:^|\]\s*|:\s*|\s+)(\d+)[\.\s:-]/);
  if (matchPrefix && matchPrefix[1]) {
    const num = parseInt(matchPrefix[1], 10);
    if (!Number.isNaN(num)) return num;
  }

  return null;
}

export function sortPostsByChapter(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const orderA = a.chapterOrder ?? null;
    const orderB = b.chapterOrder ?? null;

    if (orderA !== null && orderB !== null && orderA !== orderB) {
      return orderA - orderB;
    }
    if (orderA !== null && orderB === null) return -1;
    if (orderA === null && orderB !== null) return 1;

    const chapA = parseChapterNumber(a.title);
    const chapB = parseChapterNumber(b.title);

    if (chapA !== null && chapB !== null && chapA !== chapB) {
      return chapA - chapB;
    }
    if (chapA !== null && chapB === null) return -1;
    if (chapA === null && chapB !== null) return 1;

    if (a.roadmapOrder && b.roadmapOrder && a.roadmapOrder !== b.roadmapOrder) {
      return a.roadmapOrder - b.roadmapOrder;
    }

    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeA - timeB;
  });
}

export interface ChapterNavigationResult {
  prevPost: Post | null;
  nextPost: Post | null;
  groupTitle: string;
  relatedPosts: Post[];
}

export function getChapterNavigation(
  currentPost: Post,
  allPosts: Post[]
): ChapterNavigationResult {
  const isSeries = Boolean(currentPost.seriesSlug || currentPost.series?.slug);
  const targetSeriesSlug = currentPost.seriesSlug || currentPost.series?.slug;

  const groupPosts = allPosts.filter((item) => {
    if (isSeries && targetSeriesSlug) {
      const itemSeriesSlug = item.seriesSlug || item.series?.slug;
      return itemSeriesSlug === targetSeriesSlug;
    }
    return item.category && item.category.toLowerCase() === (currentPost.category || "").toLowerCase();
  });

  const sortedGroupPosts = sortPostsByChapter(groupPosts);
  const currentIndex = sortedGroupPosts.findIndex((item) => item.slug === currentPost.slug);

  const prevPost = currentIndex > 0 ? sortedGroupPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < sortedGroupPosts.length - 1
      ? sortedGroupPosts[currentIndex + 1]
      : null;

  let groupTitle = "";
  if (isSeries && currentPost.series?.title) {
    groupTitle = currentPost.series.title;
  } else if (currentPost.category) {
    groupTitle = formatTopicLabel(currentPost.category);
  } else {
    groupTitle = "Posts";
  }

  const relatedPosts = sortedGroupPosts
    .filter((item) => item.slug !== currentPost.slug)
    .slice(0, 3);

  return {
    prevPost,
    nextPost,
    groupTitle,
    relatedPosts,
  };
}
