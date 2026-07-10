"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, GitPullRequest, Layers, Zap } from "lucide-react";
import type { Post, Series } from "@/app/data";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePublishedPosts } from "@/app/components/usePublishedPosts";

interface SeriesListPageProps {
  initialPosts: Post[];
  seriesItems: Series[];
}

export default function SeriesListPage({ initialPosts, seriesItems }: SeriesListPageProps) {
  const { t, language, localePath } = useLanguage();
  const posts = usePublishedPosts(initialPosts);

  const renderSeriesIcon = (iconName: string) => {
    switch (iconName) {
      case "zap":
        return <Zap className="h-4 w-4" />;
      case "git-pull-request":
        return <GitPullRequest className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  return (
    <div className="theme-page min-h-screen w-full overflow-x-clip py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-center gap-1 text-xs theme-muted">
          <Link href={localePath("/")} className="transition hover:text-teal-700 dark:hover:text-emerald-300">
            {t("home")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-800 dark:text-slate-200">{t("series")}</span>
        </div>

        <div className="mb-12 max-w-3xl min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-emerald-300">
            LinuxUnity
          </p>
          <h1 className="mt-4 break-words text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            {t("linuxUnitySeries")}
          </h1>
          <p className="mt-4 max-w-2xl break-words text-base leading-7 theme-muted">{t("logoSubtitle")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {seriesItems.map((item) => {
            const seriesPostsCount = posts.filter((post) => post.seriesSlug === item.slug).length;

            return (
              <Link
                key={item.slug}
                href={localePath(`/blog/series/${item.slug}`)}
                className="theme-card group flex min-h-48 min-w-0 flex-col overflow-hidden rounded-xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:border-teal-500/50 hover:shadow-lg dark:hover:border-emerald-400/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border theme-border bg-white text-teal-700 transition group-hover:border-teal-500 dark:bg-slate-900 dark:text-emerald-300 dark:group-hover:border-emerald-400">
                  {renderSeriesIcon(item.icon)}
                </div>

                <h2 className="mt-4 line-clamp-2 break-words text-base font-bold leading-snug text-slate-950 transition [overflow-wrap:anywhere] group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300">
                  {language === "vi" ? item.title : item.title_en}
                </h2>
                <p className="theme-muted mt-3 line-clamp-3 break-words text-sm leading-6 [overflow-wrap:anywhere]">
                  {language === "vi" ? item.description : item.description_en}
                </p>

                <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                  <span className="text-xs font-bold text-teal-700 dark:text-emerald-300">
                    {seriesPostsCount || item.partsCount} {t("parts")}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border theme-border text-slate-500 transition group-hover:border-teal-500 group-hover:text-teal-700 dark:text-slate-400 dark:group-hover:border-emerald-400 dark:group-hover:text-emerald-300">
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
