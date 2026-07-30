"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Post } from "@/app/data";
import { team } from "@/app/data";
import PostCard from "@/app/components/PostCard";
import FeaturedPostsCarousel from "@/app/components/FeaturedPostsCarousel";
import SearchModal from "@/app/components/SearchModal";
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const posts = usePublishedPosts(initialPosts);
  const selectedTag = initialTag;
  const selectedTopic = initialTopic;
  const currentPage = Math.max(1, initialPage);

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
      .filter((post) => post.status === "published")
      .sort((left, right) => new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime());
  }, [posts]);

  const featuredPosts = useMemo(() => allPublishedPosts.slice(0, 3), [allPublishedPosts]);
  const followingPosts = useMemo(() => allPublishedPosts.slice(3, 6), [allPublishedPosts]);

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
    return sortedPosts;
  }, [allPublishedPosts, selectedTag, selectedTopic]);

  const isFiltered = Boolean(selectedTag || selectedTopic);
  const reservedSlugs = new Set(
    [...featuredPosts, ...followingPosts].map((post) => post.slug),
  );
  const listPosts = selectedTag || selectedTopic
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

      {/* Featured Slide Carousel - Always visible */}
      <FeaturedPostsCarousel posts={featuredPosts} followingPosts={followingPosts} />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Search Bar - matching exact requested UI */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-left shadow-xs transition hover:border-teal-500 hover:shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80 dark:hover:border-emerald-400 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-teal-600 dark:group-hover:text-emerald-400" />
              <span className="truncate text-sm font-medium text-slate-400 dark:text-slate-500">
                Search
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-slate-500 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">Ctrl</kbd>
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-slate-500 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">K</kbd>
            </div>
          </button>
        </div>

        {/* Topic Filter Bar */}
        {availableTopics.length > 0 && (
          <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="shrink-0 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider pr-1">
                Topic:
              </span>
              <Link
                href={pageHrefWithFilters(1, selectedTag, "")}
                scroll={false}
                className={`shrink-0 rounded-full px-3.5 py-1.5 transition ${
                  !selectedTopic
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold shadow-sm"
                    : "border theme-border bg-white text-slate-700 hover:border-teal-500 hover:text-teal-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-400"
                }`}
              >
                All
              </Link>
              {availableTopics.map((topic) => {
                const isActive = selectedTopic.toLowerCase() === topic.toLowerCase();
                return (
                  <Link
                    key={topic}
                    href={pageHrefWithFilters(1, selectedTag, topic)}
                    scroll={false}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 transition ${
                      isActive
                        ? "bg-teal-700 text-white dark:bg-emerald-400 dark:text-slate-950 font-bold shadow-sm"
                        : "border theme-border bg-white text-slate-700 hover:border-teal-500 hover:text-teal-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-400"
                    }`}
                  >
                    {formatTopicLabel(topic)}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {isFiltered && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border theme-border bg-slate-50/80 p-3.5 dark:bg-slate-900/60">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600 dark:text-emerald-400" />
                Filter:
              </span>
              {selectedTopic && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100/90 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-emerald-950 dark:text-emerald-300 border border-teal-200 dark:border-emerald-800/60 shadow-xs">
                  Topic: {formatTopicLabel(selectedTopic)}
                  <Link
                    href={pageHrefWithFilters(1, selectedTag, "")}
                    scroll={false}
                    className="ml-0.5 rounded-full p-0.5 text-teal-700 hover:bg-teal-200 hover:text-teal-950 dark:text-emerald-400 dark:hover:bg-emerald-900 dark:hover:text-white transition"
                    aria-label="Remove topic filter"
                  >
                    <X className="h-3 w-3" />
                  </Link>
                </span>
              )}
              {selectedTag && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-3 py-1 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200 border theme-border shadow-xs">
                  Tag: {selectedTag}
                  <Link
                    href={pageHrefWithFilters(1, "", selectedTopic)}
                    scroll={false}
                    className="ml-0.5 rounded-full p-0.5 text-slate-600 hover:bg-slate-300 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition"
                    aria-label="Remove tag filter"
                  >
                    <X className="h-3 w-3" />
                  </Link>
                </span>
              )}
            </div>
            <Link
              href={localePath("/blog")}
              scroll={false}
              className="text-xs font-bold uppercase tracking-wider text-teal-700 hover:text-teal-900 dark:text-emerald-300 dark:hover:text-emerald-200 transition"
            >
              {t("resetFilter")}
            </Link>
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="theme-card rounded-xl border border-dashed py-20 text-center">
            <p className="text-sm theme-muted">{t("noPosts")}</p>
            <Link href={localePath("/blog")} scroll={false} className="mt-4 inline-block text-sm font-bold text-teal-700 hover:text-teal-900 dark:text-emerald-300 dark:hover:text-emerald-200">
              {t("resetFilter")}
            </Link>
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

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
