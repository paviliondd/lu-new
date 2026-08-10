"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { Series } from "@/app/data";
import { useLanguage } from "@/app/components/LanguageProvider";

interface PopularSeriesSectionProps {
  seriesItems: Series[];
}

export default function PopularSeriesSection({ seriesItems }: PopularSeriesSectionProps) {
  const { t, language, localePath } = useLanguage();
  const displaySeries = seriesItems.slice(0, 3);

  return (
    <section className="py-12 sm:py-16 border-b theme-border bg-slate-50/40 dark:bg-slate-900/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4 border-b theme-border pb-4">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-emerald-300">
              <span className="h-px w-9 bg-current" />
              {t("collectionsLabel")}
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Popular Series
            </h2>
          </div>
          <Link
            href={localePath("/blog/series")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 transition hover:text-teal-900 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            {t("viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 3 Series Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {displaySeries.map((item) => {
            const title = language === "vi" ? item.title : item.title_en || item.title;
            // Simulated progress percentage for visual layout based on partsCount
            const publishedCount = item.partsCount || 5;
            const totalCount = Math.max(publishedCount, 10);
            const progressPercent = Math.min(Math.round((publishedCount / totalCount) * 100), 100);

            return (
              <Link
                key={item.slug}
                href={localePath(`/blog/series/${item.slug}`)}
                className="theme-card group flex flex-col overflow-hidden rounded-xl border theme-border transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-teal-500/50 dark:hover:border-teal-400/50"
              >
                {/* Series Cover Placeholder / Image area */}
                <div
                  className="relative flex aspect-[16/9] w-full items-center justify-center p-6 text-white overflow-hidden"
                  style={{
                    background: item.color
                      ? `linear-gradient(135deg, ${item.color} 0%, #0f172a 100%)`
                      : "linear-gradient(135deg, #0f9c98 0%, #0f172a 100%)",
                  }}
                >
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <BookOpen className="h-10 w-10 mb-2 opacity-90 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-xs uppercase tracking-widest font-extrabold opacity-80">
                      {item.tag || "Series"}
                    </span>
                  </div>
                </div>

                {/* Series Info */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold text-slate-950 dark:text-white line-clamp-1 group-hover:text-teal-700 dark:group-hover:text-emerald-300 transition">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {language === "vi"
                      ? `${publishedCount}/${totalCount} bài đã xuất bản`
                      : `${publishedCount}/${totalCount} published parts`}
                  </p>

                  {/* Visual Progress Bar */}
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500 dark:bg-teal-400"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
