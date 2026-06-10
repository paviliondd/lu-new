"use client";

import Link from "next/link";
import { ArrowRight, Eye, Calendar, Layers, Zap, GitPullRequest } from "lucide-react";
import { posts as initialPosts, series, team } from "./data";
import { useLanguage } from "./components/LanguageProvider";
import { usePublishedPosts } from "./components/usePublishedPosts";
import PostListRow from "./components/PostListRow";

export default function Home() {
  const { t, language } = useLanguage();
  const posts = usePublishedPosts(initialPosts);

  // Get 3 recent posts
  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Get 3 most read posts
  const mostReadPosts = [...posts]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  // Map icon strings to Lucide components
  const renderSeriesIcon = (iconName: string) => {
    switch (iconName) {
      case "layers":
        return <Layers className="h-5 w-5" />;
      case "zap":
        return <Zap className="h-5 w-5" />;
      case "git-pull-request":
        return <GitPullRequest className="h-5 w-5" />;
      default:
        return <Layers className="h-5 w-5" />;
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] sm:min-h-[85vh] items-center overflow-hidden bg-gradient-to-br from-white via-brand-50/40 to-blue-50/70 dark:from-gray-950 dark:via-gray-900 dark:to-brand-950/10 transition-colors duration-200">
        {/* Animated Glow Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-blob absolute -left-40 top-0 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-900/20"></div>
          <div className="animate-blob animation-delay-2000 absolute -right-40 top-40 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/20"></div>
          <div className="animate-blob animation-delay-4000 absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-900/10"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:py-32">
          {/* Pill Badge */}
          <span className="mb-6 inline-flex rounded-full bg-brand-100/80 dark:bg-brand-900/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400 backdrop-blur-sm">
            {t("exploreBuildShare")}
          </span>
          {/* Title */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15]">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent dark:from-gray-100 dark:via-gray-200 dark:to-gray-100">
              {t("heroTitlePart1")}
            </span>
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-blue-500 bg-clip-text text-transparent dark:from-brand-400 dark:via-brand-300 dark:to-blue-400">
              {t("heroTitlePart2")}
            </span>
          </h1>
          {/* Subtext */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {t("heroDesc")}
          </p>
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/blog"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl bg-brand-600 px-7 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 hover:bg-brand-700 transition cursor-pointer"
            >
              {t("readBlog")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Writing Section */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-16 sm:py-20 transition-colors duration-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Bài viết mới nhất
            </h2>
            <Link
              href="/blog"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
            >
              → Xem tất cả
            </Link>
          </div>

          <div>
            {recentPosts.map((post, index) => (
              <PostListRow
                key={post.slug}
                post={post}
                author={team[post.author]}
                index={index}
                language={language}
                isLast={index === recentPosts.length - 1}
              />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400"
            >
              {t("allPosts")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Most Read Section */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-16 sm:py-20 transition-colors duration-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px w-8 bg-brand-500"></div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Most Read
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("mostRead")}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {mostReadPosts.map((post) => {
              const authorInfo = team[post.author];
              return (
                <article
                  key={post.slug + "-popular"}
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
                    <h3 className="mb-2 line-clamp-2 font-bold text-base leading-snug text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {post.description}
                    </p>

                    <div className="mt-auto flex items-center gap-2 pt-3.5 border-t border-gray-100 dark:border-gray-800/80">
                      <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-[10px] font-bold text-brand-700 dark:text-brand-400">
                        {authorInfo?.avatar || "A"}
                      </div>
                      <span className="text-xs font-semibold text-gray-750 dark:text-gray-300">
                        {authorInfo?.name.split(" (")[0]}
                      </span>
                      <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {post.views} {t("views")}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Series Section */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 py-16 sm:py-20 transition-colors duration-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-8 bg-brand-500"></div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Collections
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("series")}
              </h2>
            </div>
            <Link
              href="/blog/series"
              className="hidden text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition sm:flex items-center gap-1 cursor-pointer"
            >
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {series.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/series/${item.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10 dark:border-gray-800 dark:bg-gray-900 cursor-pointer"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 group-hover:scale-110 transition duration-200">
                  {renderSeriesIcon(item.icon)}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition text-base leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
                  {item.description}
                </p>
                <p className="mt-4 text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                  {item.partsCount} {t("parts")}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition duration-200" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
