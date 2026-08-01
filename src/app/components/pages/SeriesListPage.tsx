"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Series } from "@/app/data";
import { useLanguage } from "@/app/components/LanguageProvider";
import SeriesRow from "@/app/components/SeriesRow";

interface SeriesListPageProps {
  seriesItems: Series[];
}

export default function SeriesListPage({ seriesItems }: SeriesListPageProps) {
  const { t, localePath } = useLanguage();

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

        <div className="mb-10 max-w-4xl border-b border-slate-200 pb-8 dark:border-slate-800">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-emerald-300">
            <span className="h-px w-10 bg-current" />
            {t("collectionsLabel")}
          </p>
          <h1 className="mt-4 break-words text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            {t("exploreBySeries")}
          </h1>
        </div>

        <div className="grid max-w-5xl gap-4">
          {seriesItems.map((item) => <SeriesRow key={item.slug} item={item} />)}
        </div>
      </div>
    </div>
  );
}
