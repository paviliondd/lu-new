"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, GitPullRequest, Layers, Zap } from "lucide-react";
import { series, type Post } from "@/app/data";
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
      case "zap":
        return <Zap className="h-6 w-6" />;
      case "git-pull-request":
        return <GitPullRequest className="h-6 w-6" />;
      default:
        return <Layers className="h-6 w-6" />;
    }
  };

  return (
    <div className="theme-page min-h-screen w-full overflow-x-clip py-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-6 flex items-center gap-1 text-xs text-gray-500">
          <Link href={localePath("/")} className="transition hover:text-emerald-300">
            {t("home")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-800 dark:text-slate-200">{t("series")}</span>
        </div>

        <div className="mb-12 max-w-3xl">
          <h1 className="mb-4 break-words bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            {t("linuxUnitySeries")}
          </h1>
          <p className="theme-muted text-sm leading-relaxed">{t("logoSubtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {series.map((item) => {
            const seriesPostsCount = posts.filter((post) => post.seriesSlug === item.slug).length;

            return (
              <Link
                key={item.slug}
                href={localePath(`/blog/series/${item.slug}`)}
                className="theme-card group flex min-h-72 min-w-0 flex-col rounded-2xl border p-6 transition hover:-translate-y-0.5 hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-950/30 sm:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-cyan-300">
                  {renderSeriesIcon(item.icon)}
                </div>

                <h2 className="mt-6 break-words text-lg font-bold text-slate-950 transition group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300 sm:text-xl">
                  {language === "vi" ? item.title : item.title_en}
                </h2>
                <p className="theme-muted mt-4 line-clamp-3 text-sm leading-6">
                  {language === "vi" ? item.description : item.description_en}
                </p>

                <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                  <span className="text-sm font-bold text-cyan-300">
                    {seriesPostsCount || item.partsCount} {t("parts")}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-cyan-300 transition group-hover:border-emerald-400 group-hover:text-emerald-300">
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
