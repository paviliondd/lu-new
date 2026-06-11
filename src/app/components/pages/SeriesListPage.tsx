"use client";

import Link from "next/link";
import { ChevronRight, Layers, Zap, GitPullRequest, Bookmark, PlayCircle } from "lucide-react";
import { series, team, type Post } from "@/app/data";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePublishedPosts } from "@/app/components/usePublishedPosts";

interface SeriesListPageProps {
  initialPosts: Post[];
}

export default function SeriesListPage({ initialPosts }: SeriesListPageProps) {
  const { t, language, localePath } = useLanguage();
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
    <div className="min-h-screen w-full bg-[#0F172A] py-12 text-slate-100">
      <div className="mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-6">
          <Link href={localePath("/")} className="transition hover:text-emerald-300">{t("home")}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-200">{t("series")}</span>
        </div>

        {/* Title area */}
        <div className="mb-12 max-w-3xl">
          <h1 className="mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            {t("linuxUnitySeries")}
          </h1>
          <p className="text-sm leading-relaxed text-slate-400">
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
                className="group rounded-2xl border border-slate-700 bg-slate-900/70 p-6 transition hover:-translate-y-0.5 hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-950/30 sm:p-8"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Left: Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-cyan-300">
                        {renderSeriesIcon(item.icon)}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white transition group-hover:text-emerald-300 sm:text-xl">
                          {language === "vi" ? item.title : item.title_en}
                        </h2>
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300">
                          <Bookmark className="h-3.5 w-3.5" />
                          {item.partsCount} {t("parts")}
                        </span>
                      </div>
                    </div>
                    <p className="max-w-3xl text-xs leading-relaxed text-slate-400 sm:text-sm">
                      {language === "vi" ? item.description : item.description_en}
                    </p>
                  </div>
                </div>

                {/* Chapters List */}
                {seriesPosts.length > 0 && (
                  <div className="mt-8 border-t border-slate-700 pt-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-450 mb-4">
                      {t("chapters")} ({seriesPosts.length})
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {seriesPosts.map((post, index) => {
                        const authorInfo = team[post.author];
                        return (
                          <Link
                            key={post.slug}
                            href={localePath(`/blog/${post.slug}`)}
                            className="flex items-start gap-3 rounded-xl border border-slate-700 bg-[#0B132B]/70 p-3 transition hover:border-cyan-400/50 hover:bg-cyan-400/5"
                          >
                            <PlayCircle className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-gray-400 block mb-0.5">
                                {t("part")} {index + 1}
                              </span>
                              <span className="line-clamp-1 text-xs font-semibold text-slate-200">
                                {post.title}
                              </span>
                              <span className="text-[10px] text-gray-450 block mt-1">
                                {t("writtenBy")} {authorInfo?.name.split(" (")[0]} · {post.readTime}
                              </span>
                            </div>
                          </Link>
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
