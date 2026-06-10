"use client";

// TODO: Refactor search/filter state so this page can move back to a Server Component later.
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Calendar, Tag, ChevronRight } from "lucide-react";
import { posts as initialPosts, series, team } from "../data";
import { useLanguage } from "../components/LanguageProvider";
import { usePublishedPosts } from "../components/usePublishedPosts";
import PostListRow from "../components/PostListRow";

export default function BlogList() {
  const { t, language } = useLanguage();
  const posts = usePublishedPosts(initialPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get all unique categories
  const categories = useMemo(() => {
    const cats = new Set(posts.map((p) => p.category));
    return ["All", ...Array.from(cats)];
  }, [posts]);

  // Filter posts based on search query and category
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-white text-gray-950 transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
      <section className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-18">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-300">
            <Tag className="h-3.5 w-3.5" />
            DVA-C02 & DOP-C02 Study Path
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-5xl">
            Cloud DevOps notes
            <span className="block text-blue-600 dark:text-blue-400">
              theo exam domain AWS
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400">
            Một thư viện bài viết ngắn gọn, có thứ tự, tập trung vào AWS Developer
            Associate và DevOps Professional để học, ôn tập và triển khai thực tế.
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="block text-2xl font-semibold text-gray-950 dark:text-white">
                {posts.length}
              </span>
              bài viết
            </div>
            <div>
              <span className="block text-2xl font-semibold text-gray-950 dark:text-white">
                {series.length}
              </span>
              Chuỗi chủ đề
            </div>
            <div>
              <span className="flex items-center gap-1 text-2xl font-semibold text-gray-950 dark:text-white">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />2
              </span>
              Chứng chỉ AWS
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-5 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                {cat === "All" ? t("all") : cat}
              </button>
            ))}
          </div>

          <div className="relative w-64 max-w-full">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-full border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex gap-12">
          <main className="min-w-0 flex-1">
            {filteredPosts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("noPosts")}</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {t("resetFilter")}
                </button>
              </div>
            ) : (
              <div>
                {filteredPosts.map((post, index) => (
                  <PostListRow
                    key={post.slug}
                    post={post}
                    author={team[post.author]}
                    index={index}
                    language={language}
                    isLast={index === filteredPosts.length - 1}
                  />
                ))}
              </div>
            )}
          </main>

          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 space-y-10">
              <section>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Chuỗi bài viết
                </h2>
                <div className="mt-4 space-y-3">
                  {series.slice(0, 4).map((item, index) => {
                    const count =
                      posts.filter((post) => post.seriesSlug === item.slug).length ||
                      item.partsCount;

                    return (
                      <Link
                        key={item.slug}
                        href={`/blog/series/${item.slug}`}
                        className="block rounded-lg border border-gray-200 p-3 transition hover:border-blue-300 dark:border-gray-800 dark:hover:border-blue-700"
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Chuỗi {index + 1}
                        </div>
                        <div className="mt-1 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.title}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {count} bài viết
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Chứng chỉ mục tiêu
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    DVA-C02 · Developer
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    DOP-C02 · DevOps Pro
                  </span>
                </div>
              </section>

              <section className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/70">
                <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                  Xem lộ trình học đầy đủ 26 bài theo thứ tự exam domain
                </p>
                <Link
                  href="/roadmap"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
                >
                  Mở roadmap
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
