"use client";

import { useMemo } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import type { Post } from "@/app/data";
import { team } from "@/app/data";
import PostCard from "@/app/components/PostCard";
import FeaturedPostsCarousel from "@/app/components/FeaturedPostsCarousel";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePublishedPosts } from "@/app/components/usePublishedPosts";

interface BlogListPageProps {
  initialPosts: Post[];
  initialPage?: number;
  initialTag?: string;
}

const pageSize = 9;

export default function BlogListPage({
  initialPosts,
  initialPage = 1,
  initialTag = "",
}: BlogListPageProps) {
  const { t, language, localePath } = useLanguage();
  const posts = usePublishedPosts(initialPosts);
  const selectedTag = initialTag;
  const currentPage = Math.max(1, initialPage);

  const filteredPosts = useMemo(() => {
    const sortedPosts = [...posts]
      .filter((post) => post.status === "published")
      .sort((left, right) => new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime());
    if (!selectedTag) return sortedPosts;
    return sortedPosts.filter((post) => post.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()));
  }, [posts, selectedTag]);

  const featuredPosts = selectedTag ? [] : filteredPosts.slice(0, 3);
  const featuredSlugs = new Set(featuredPosts.map((post) => post.slug));
  const listPosts = selectedTag ? filteredPosts : filteredPosts.filter((post) => !featuredSlugs.has(post.slug));
  const totalPages = Math.max(1, Math.ceil(listPosts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = listPosts.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (selectedTag) params.set("tag", selectedTag);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `${localePath("/blog")}?${query}` : localePath("/blog");
  };

  return (
    <div className="theme-page min-h-screen overflow-x-clip">
      <section className="theme-surface relative overflow-hidden border-b theme-border">
        <div className="theme-hero absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border theme-border bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-teal-700 shadow-sm dark:bg-slate-900/70 dark:text-emerald-300 sm:text-xs sm:tracking-[0.18em]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t("studyPath")}
          </span>
          <h1 className="mt-6 max-w-4xl break-words text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            {t("blogTitlePart1")}
            <span className="block text-teal-700 dark:text-emerald-300">
              {t("blogTitlePart2")}
            </span>
          </h1>
          <p className="theme-muted mt-5 max-w-2xl text-base leading-7">
            {t("blogDescription")}
          </p>
        </div>
      </section>

      {!selectedTag && <FeaturedPostsCarousel posts={featuredPosts} />}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {selectedTag && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b theme-border pb-5">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {selectedTag}
            </p>
            <Link href={localePath("/blog")} className="text-sm font-bold text-teal-700 hover:text-teal-900 dark:text-emerald-300 dark:hover:text-emerald-200">
              {t("resetFilter")}
            </Link>
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="theme-card rounded-xl border border-dashed py-20 text-center">
            <p className="text-sm theme-muted">{t("noPosts")}</p>
            <Link href={localePath("/blog")} className="mt-4 inline-block text-sm font-bold text-teal-700 hover:text-teal-900 dark:text-emerald-300 dark:hover:text-emerald-200">
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
