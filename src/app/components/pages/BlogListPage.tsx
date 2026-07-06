"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Post } from "@/app/data";
import { team } from "@/app/data";
import PostCard from "@/app/components/PostCard";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePublishedPosts } from "@/app/components/usePublishedPosts";

interface BlogListPageProps {
  initialPosts: Post[];
}

export default function BlogListPage({ initialPosts }: BlogListPageProps) {
  const { t, language } = useLanguage();
  const posts = usePublishedPosts(initialPosts);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query);
      return matchesSearch;
    });
  }, [posts, searchQuery]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0F172A] text-slate-100">
      <section className="relative overflow-hidden border-b border-slate-800 bg-[#0B132B]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(52,211,153,0.14),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_28%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:py-20">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-300 sm:text-xs sm:tracking-[0.18em]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t("studyPath")}
          </span>
          <h1 className="mt-6 max-w-4xl break-words text-3xl font-bold tracking-tight text-white sm:text-6xl">
            {t("blogTitlePart1")}
            <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t("blogTitlePart2")}
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            {t("blogDescription")}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:py-14">
        <div className="mb-10 rounded-2xl border border-slate-700 bg-slate-900/65 p-4 shadow-lg shadow-slate-950/20">
          <div className="flex justify-end">
            <label className="relative block w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-11 w-full rounded-full border border-slate-700 bg-[#0B132B] pl-10 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15"
              />
            </label>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 py-20 text-center">
            <p className="text-sm text-slate-400">{t("noPosts")}</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
              }}
              className="mt-4 text-sm font-bold text-cyan-300 hover:text-emerald-300"
            >
              {t("resetFilter")}
            </button>
          </div>
        ) : (
          <div className="grid min-w-0 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <PostCard
                key={post.slug}
                post={post}
                author={team[post.author]}
                locale={language}
                featured={index === 0 && filteredPosts.length > 3}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
