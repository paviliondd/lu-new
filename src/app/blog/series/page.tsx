"use client";

import Link from "next/link";
import { ChevronRight, Layers, Zap, GitPullRequest, Bookmark, PlayCircle } from "lucide-react";
import { series, posts as initialPosts, team } from "../../data";
import { useLanguage } from "../../components/LanguageProvider";
import { usePublishedPosts } from "../../components/usePublishedPosts";

export default function SeriesListPage() {
  const { t } = useLanguage();
  const posts = usePublishedPosts(initialPosts);

  const renderSeriesIcon = (iconName: string) => {
    switch (iconName) {
      case "layers":
        return <Layers className="h-6 w-6 text-brand-600 dark:text-brand-400" />;
      case "zap":
        return <Zap className="h-6 w-6 text-brand-600 dark:text-brand-400" />;
      case "git-pull-request":
        return <GitPullRequest className="h-6 w-6 text-brand-600 dark:text-brand-400" />;
      default:
        return <Layers className="h-6 w-6 text-brand-600 dark:text-brand-400" />;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-950 min-h-screen py-12 transition-colors duration-200">
      <div className="mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-650 transition">{t("home")}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">{t("series")}</span>
        </div>

        {/* Title area */}
        <div className="mb-12 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            {t("series")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("logoSubtitle")}
          </p>
        </div>

        {/* Series Stack */}
        <div className="space-y-12">
          {series.map((item) => {
            // Get all posts in this series, sorted by date asc (chapters)
            const seriesPosts = posts
              .filter((p) => p.seriesSlug === item.slug)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            return (
              <div
                key={item.slug}
                className="group rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-900 transition hover:shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Left: Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                        {renderSeriesIcon(item.icon)}
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                          {item.title}
                        </h2>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                          <Bookmark className="h-3.5 w-3.5" />
                          {item.partsCount} {t("parts")}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-400 max-w-3xl">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Chapters List */}
                {seriesPosts.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-150 dark:border-gray-800/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-450 mb-4">
                      {t("chapters")} ({seriesPosts.length})
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {seriesPosts.map((post, index) => {
                        const authorInfo = team[post.author];
                        return (
                          <a
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-gray-800/60 bg-gray-50/20 dark:bg-gray-900/50 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700 transition cursor-pointer"
                          >
                            <PlayCircle className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-gray-400 block mb-0.5">
                                {t("part")} {index + 1}
                              </span>
                              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-brand-600 line-clamp-1">
                                {post.title}
                              </span>
                              <span className="text-[10px] text-gray-450 block mt-1">
                                {t("writtenBy")} {authorInfo?.name.split(" (")[0]} · {post.readTime}
                              </span>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
