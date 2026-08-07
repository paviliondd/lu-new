"use client";

import Link from "next/link";
import { ArrowRight, GitPullRequest, Layers, Zap } from "lucide-react";
import type { Series } from "@/app/data";
import { useLanguage } from "@/app/components/LanguageProvider";

function SeriesIcon({ name }: { name: string }) {
  switch (name) {
    case "zap":
      return <Zap className="h-5 w-5" aria-hidden="true" />;
    case "git-pull-request":
      return <GitPullRequest className="h-5 w-5" aria-hidden="true" />;
    default:
      return <Layers className="h-5 w-5" aria-hidden="true" />;
  }
}

export default function SeriesRow({ item, compact = false }: { item: Series; compact?: boolean }) {
  const { t, language, localePath } = useLanguage();
  const title = language === "vi" ? item.title : item.title_en;

  return (
    <Link
      href={localePath(`/blog/series/${item.slug}`)}
      className={`group relative flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-emerald-400/70 dark:hover:shadow-emerald-950/30 dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-slate-950 ${compact ? "min-h-32 gap-3 p-4" : "min-h-28 gap-4 p-4 sm:gap-5 sm:p-5"}`}
    >
      <span className="pointer-events-none absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-cyan-100/90 via-teal-50/45 to-transparent opacity-90 transition group-hover:opacity-100 dark:from-emerald-400/20 dark:via-teal-500/10" />
      <span className="pointer-events-none absolute -right-12 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-teal-400/25 blur-2xl transition group-hover:bg-teal-400/35 dark:bg-emerald-400/25 dark:group-hover:bg-emerald-400/35" />

      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-teal-700 transition group-hover:border-teal-400 group-hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-950 dark:text-emerald-300 dark:group-hover:border-emerald-400/70 dark:group-hover:bg-emerald-400/10">
        <SeriesIcon name={item.icon} />
      </span>

      <span className="relative min-w-0 flex-1">
        <span className="block truncate text-base font-bold text-slate-950 transition group-hover:text-teal-800 dark:text-white dark:group-hover:text-emerald-200 sm:text-lg">
          {title}
        </span>
        <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 dark:bg-emerald-400" />
          {item.partsCount} {t("parts")}
        </span>
      </span>

      {compact ? (
        <span className="relative ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-200/80 bg-white/80 text-teal-700 shadow-sm transition group-hover:border-teal-400 dark:border-emerald-400/25 dark:bg-slate-950/80 dark:text-emerald-300 dark:group-hover:border-emerald-400">
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      ) : (
        <span className="relative ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition group-hover:border-teal-400 group-hover:text-teal-700 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-300 dark:group-hover:border-emerald-400 dark:group-hover:text-emerald-300">
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      )}
    </Link>
  );
}
