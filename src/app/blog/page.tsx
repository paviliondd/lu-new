"use client";

// TODO: Refactor search/filter state so this page can move back to a Server Component later.
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Calendar, Tag, ChevronRight } from "lucide-react";
import { posts as initialPosts, team } from "../data";
import { useLanguage } from "../components/LanguageProvider";
import { usePublishedPosts } from "../components/usePublishedPosts";

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
    <div className="w-full bg-white dark:bg-gray-950 min-h-screen py-12 transition-colors duration-200">
      <div className="mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-650 transition">{t("home")}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">{t("blog")}</span>
        </div>

        {/* Title area */}
        <div className="mb-10 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            {t("allPosts")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("logoSubtitle")}
          </p>
        </div>

        {/* Filters and Search Bar Row */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          {/* Categories Tab list */}
          <div className="flex flex-wrap items-center gap-1.5 order-2 md:order-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-brand-600 text-white shadow-sm shadow-brand-500/20"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-655 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {cat === "All" ? t("all") : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:max-w-sm order-1 md:order-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 rounded-xl border border-gray-200 bg-white placeholder-gray-400 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-brand-400"
            />
          </div>
        </div>

        {/* Blog Post Grid */}
        {filteredPosts.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("noPosts")}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {t("resetFilter")}
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const authorInfo = team[post.author];
              return (
                <article
                  key={post.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/60 bg-white dark:border-gray-800 dark:bg-gray-900 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10 transition duration-300"
                >
                  <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] w-full overflow-hidden">
                    <div className={`flex h-full w-full items-center justify-center p-6 bg-gradient-to-br ${post.gradient} group-hover:scale-105 transition duration-300`}>
                      <span className="max-w-[85%] text-center text-lg font-extrabold leading-snug text-white drop-shadow-md line-clamp-2">
                        {post.title}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="mb-2 line-clamp-2 font-bold text-base leading-snug text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {post.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          onClick={(e) => {
                            e.preventDefault();
                            setSearchQuery(tag);
                          }}
                          className="inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[9px] font-semibold text-gray-655 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 transition cursor-pointer"
                        >
                          <Tag className="h-2 w-2" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Author Footer */}
                    <div className="mt-auto flex items-center gap-2.5 pt-3.5 border-t border-gray-100 dark:border-gray-800/80">
                      <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-[10px] font-bold text-brand-700 dark:text-brand-400">
                        {authorInfo?.avatar || "A"}
                      </div>
                      <span className="text-xs font-semibold text-gray-750 dark:text-gray-300">
                        {authorInfo?.name.split(" (")[0]}
                      </span>
                      <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.date).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
