"use client";

import Link from "next/link";
import { ArrowRight, Eye, Calendar, Layers, Zap, GitPullRequest } from "lucide-react";
import { posts as initialPosts, series, team } from "@/app/data";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePublishedPosts } from "@/app/components/usePublishedPosts";
import PostListRow from "@/app/components/PostListRow";

export default function Home() {
  const { t, language, localePath } = useLanguage();
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
      <section className="relative flex min-h-[62vh] items-center overflow-hidden border-b border-gray-200 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_34%),linear-gradient(180deg,#ffffff,rgba(239,246,255,0.55))] transition-colors duration-200 dark:border-gray-800 dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_34%),linear-gradient(180deg,#020617,#030712)]">
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          {/* Pill Badge */}
          <span className="mb-6 inline-flex rounded-full border border-cyan-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-700 shadow-sm backdrop-blur-sm dark:border-cyan-900/60 dark:bg-cyan-950/20 dark:text-cyan-300">
            {t("exploreBuildShare")}
          </span>
          {/* Title */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            <span className="block text-gray-950 dark:text-white">
              {t("heroTitlePart1").trim()}
            </span>
            <span className="block bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 bg-clip-text text-transparent dark:from-cyan-300 dark:via-sky-400 dark:to-blue-500">
              {t("heroTitlePart2")}
            </span>
          </h1>
          {/* Subtext */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400 sm:text-lg">
            {t("heroDesc")}
          </p>
          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={localePath("/blog")}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 sm:w-auto"
            >
              {t("readBlog")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href={localePath("/blog/series")}
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-gray-300 bg-white/60 px-7 text-sm font-semibold text-gray-800 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-950/40 dark:text-gray-200 dark:hover:border-cyan-500 dark:hover:text-cyan-300 sm:w-auto"
            >
              {t("series")}
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
              {t("recentWriting")}
            </h2>
            <Link
              href={localePath("/blog")}
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
            >
              → {t("viewAll")}
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
              href={localePath("/blog")}
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
                {t("mostRead")}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("mostRead")}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {mostReadPosts.map((post) => {
              const authorInfo = team[post.author];
              const title = language === "vi" ? post.title : post.title_en;
              const description =
                language === "vi" ? post.description : post.description_en;
              return (
                <article
                  key={post.slug + "-popular"}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/60 bg-white dark:border-gray-800 dark:bg-gray-900 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10 transition duration-300"
                >
                  <Link href={localePath(`/blog/${post.slug}`)} className="block relative aspect-[16/10] w-full overflow-hidden">
                    <div className={`flex h-full w-full items-center justify-center p-6 bg-gradient-to-br ${post.gradient} group-hover:scale-105 transition duration-300`}>
                      <span className="max-w-[85%] text-center text-lg font-extrabold leading-snug text-white drop-shadow-md line-clamp-2">
                        {title}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 line-clamp-2 font-bold text-base leading-snug text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                      <Link href={localePath(`/blog/${post.slug}`)}>{title}</Link>
                    </h3>
                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {description}
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
                  {t("collections")}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("series")}
              </h2>
            </div>
            <Link
              href={localePath("/blog/series")}
              className="hidden text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition sm:flex items-center gap-1 cursor-pointer"
            >
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {series.map((item) => (
              <Link
                key={item.slug}
                href={localePath(`/blog/series/${item.slug}`)}
                className="group flex min-h-[220px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-2xl hover:shadow-cyan-500/10 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-cyan-800 dark:hover:shadow-cyan-950/30 cursor-pointer"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 transition duration-200 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:text-white dark:bg-cyan-950/40 dark:text-cyan-300">
                  {renderSeriesIcon(item.icon)}
                </div>
                <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-900 transition group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                  {language === "vi" ? item.title : item.title_en}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {language === "vi" ? item.description : item.description_en}
                </p>
                <p className="mt-auto flex items-center gap-1 pt-5 text-xs font-bold text-cyan-700 dark:text-cyan-300">
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
