"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Post } from "@/app/data";
import { team } from "@/app/data";
import PostCard from "@/app/components/PostCard";
import FeaturedPostsCarousel from "@/app/components/FeaturedPostsCarousel";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePublishedPosts } from "@/app/components/usePublishedPosts";
import { formatTopicLabel } from "@/lib/utils/formatTopic";

interface BlogListPageProps {
  initialPosts: Post[];
  initialPage?: number;
  initialTag?: string;
  initialTopic?: string;
}

const pageSize = 9;

export default function BlogListPage({
  initialPosts,
  initialPage = 1,
  initialTag = "",
  initialTopic = "",
}: BlogListPageProps) {
  const { t, language, localePath } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const posts = usePublishedPosts(initialPosts);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [currentPage, setCurrentPage] = useState(Math.max(1, initialPage));

  const updateTopic = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentPage(1);
    const href = pageHrefWithFilters(1, selectedTag, topic);
    window.history.replaceState(null, "", href);
  };

  const availableTopics = useMemo(() => {
    const topicSet = new Set<string>();
    posts.forEach((post) => {
      if (post.category && post.category.trim()) {
        topicSet.add(post.category.trim());
      }
    });
    return Array.from(topicSet).sort();
  }, [posts]);

  const allPublishedPosts = useMemo(() => {
    return [...posts]
      .filter((post) => post.status !== "draft")
      .sort((left, right) => new Date(right.date || right.publishDate || 0).getTime() - new Date(left.date || left.publishDate || 0).getTime());
  }, [posts]);

  const featuredPosts = useMemo(
    () => allPublishedPosts.filter((post) => post.status === "published").slice(0, 3),
    [allPublishedPosts],
  );

  const filteredPosts = useMemo(() => {
    let sortedPosts = allPublishedPosts;
    if (selectedTopic) {
      sortedPosts = sortedPosts.filter(
        (post) => post.category && post.category.toLowerCase() === selectedTopic.toLowerCase()
      );
    }
    if (selectedTag) {
      sortedPosts = sortedPosts.filter((post) =>
        post.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      sortedPosts = sortedPosts.filter(
        (post) =>
          (post.title && post.title.toLowerCase().includes(q)) ||
          (post.description && post.description.toLowerCase().includes(q)) ||
          (post.category && post.category.toLowerCase().includes(q)) ||
          post.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return sortedPosts;
  }, [allPublishedPosts, searchQuery, selectedTag, selectedTopic]);

  const reservedSlugs = new Set(featuredPosts.map((post) => post.slug));
  const listPosts = selectedTag || selectedTopic || searchQuery.trim()
    ? filteredPosts
    : filteredPosts.filter((post) => !reservedSlugs.has(post.slug));
  const totalPages = Math.max(1, Math.ceil(listPosts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = listPosts.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pageHrefWithFilters = (page: number, tag = selectedTag, topic = selectedTopic) => {
    const params = new URLSearchParams();
    if (topic) params.set("topic", topic);
    if (tag) params.set("tag", tag);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `${localePath("/blog")}?${query}` : localePath("/blog");
  };

  const pageHref = (page: number) => pageHrefWithFilters(page);

  return (
    <div className="theme-page min-h-screen overflow-x-clip">
      <section className="theme-surface relative overflow-hidden border-b theme-border">
        <div className="theme-hero absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border theme-border bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-teal-700 shadow-sm dark:bg-slate-900/70 dark:text-emerald-300 sm:text-xs sm:tracking-[0.18em]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t("studyPath")}
          </span>
        </div>
      </section>

      <FeaturedPostsCarousel posts={featuredPosts} />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Inline Search Bar - direct input without popup modal */}
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, topic, or keyword..."
            className="w-full rounded-xl border border-slate-300 bg-white/90 py-3 pl-11 pr-10 text-sm font-medium text-slate-900 placeholder-slate-400 shadow-xs transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-white dark:placeholder-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Topic Filter Bar */}
        {availableTopics.length > 0 && (
          <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="shrink-0 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider pr-1">
                Topic:
              </span>
              <button
                type="button"
                onClick={() => updateTopic("")}
                className={`shrink-0 rounded-full px-3.5 py-1.5 transition cursor-pointer ${
                  !selectedTopic
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold shadow-sm"
                    : "border theme-border bg-white text-slate-700 hover:border-teal-500 hover:text-teal-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-400"
                }`}
              >
                All
              </button>
              {availableTopics.map((topic) => {
                const isActive = selectedTopic.toLowerCase() === topic.toLowerCase();
                return (
                  <button
                    type="button"
                    key={topic}
                    onClick={() => updateTopic(topic)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 transition cursor-pointer ${
                      isActive
                        ? "bg-teal-700 text-white dark:bg-emerald-400 dark:text-slate-950 font-bold shadow-sm"
                        : "border theme-border bg-white text-slate-700 hover:border-teal-500 hover:text-teal-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-400"
                    }`}
                  >
                    {formatTopicLabel(topic)}
                  </button>
                );
              })}
            </div>
          </div>
        )}



        {filteredPosts.length === 0 ? (
          <div className="theme-card rounded-xl border border-dashed py-20 text-center">
            <p className="text-sm theme-muted">{t("noPosts")}</p>
            <button
              type="button"
              onClick={() => {
                setSelectedTopic("");
                setSelectedTag("");
                setSearchQuery("");
                setCurrentPage(1);
                window.history.replaceState(null, "", localePath("/blog"));
              }}
              className="mt-4 inline-block text-sm font-bold text-teal-700 hover:text-teal-900 dark:text-emerald-300 dark:hover:text-emerald-200 cursor-pointer"
            >
              {t("resetFilter")}
            </button>
          </div>
        ) : listPosts.length > 0 ? (
          <>
            <div className="grid min-w-0 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedPosts.map((post) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  author={team[post.author]}
                  locale={language}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold" aria-label="Blog pagination">
                <Link
                  href={pageHref(Math.max(1, safePage - 1))}
                  scroll={false}
                  onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                  aria-disabled={safePage === 1}
                  className={`inline-flex h-10 items-center justify-center rounded-lg border px-3.5 leading-none ${
                    safePage === 1
                      ? "pointer-events-none border-slate-300 bg-slate-200 text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                      : "border-slate-300 text-slate-700 hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                  }`}
                >
                  ← Newer
                </Link>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  const isVisible = page === 1 || page === totalPages || Math.abs(page - safePage) <= 1;
                  const previousVisible =
                    index > 0 &&
                    (index === 1 || Math.abs(index - safePage) <= 1 || index + 1 === totalPages);
                  if (!isVisible) {
                    return previousVisible ? (
                      <span key={page} className="inline-flex h-10 items-center px-2 text-slate-500">
                        ...
                      </span>
                    ) : null;
                  }
                  return (
                    <Link
                      key={page}
                      href={pageHref(page)}
                      scroll={false}
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 leading-none ${
                        page === safePage
                          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                          : "border border-slate-300 text-slate-700 hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                      }`}
                    >
                      {page}
                    </Link>
                  );
                })}
                <Link
                  href={pageHref(Math.min(totalPages, safePage + 1))}
                  scroll={false}
                  onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                  aria-disabled={safePage === totalPages}
                  className={`inline-flex h-10 items-center justify-center rounded-lg border px-3.5 leading-none ${
                    safePage === totalPages
                      ? "pointer-events-none border-slate-300 bg-slate-200 text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                      : "border-slate-300 text-slate-700 hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                  }`}
                >
                  Older →
                </Link>
              </nav>
            )}
          </>
        ) : null}
      </section>
    </div>
  );
}
