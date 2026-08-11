"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Post, Series } from "@/app/data";
import { useLanguage } from "@/app/components/LanguageProvider";
import HeroRecentWritingSection from "@/app/components/HeroRecentWritingSection";
import SeriesRow from "@/app/components/SeriesRow";
import MeetTheTeamSection from "@/app/components/MeetTheTeamSection";
import NewsletterSection from "@/app/components/NewsletterSection";

interface HomePageProps {
  initialPosts: Post[];
  seriesItems: Series[];
}

export default function HomePage({ initialPosts, seriesItems }: HomePageProps) {
  const { t, localePath } = useLanguage();

  return (
    <div className="theme-page min-h-screen overflow-x-clip bg-[#fdfcf9] dark:bg-[#0c1524]">
      {/* SECTION 1 — Hero + Recent Writing (~100vh) */}
      <HeroRecentWritingSection initialPosts={initialPosts} />

      {/* SECTION 2 — Popular Series (~50vh) */}
      <section className="theme-surface border-t theme-border py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4 border-b theme-border pb-4">
            <div>
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-emerald-300">
                <span className="h-px w-9 bg-current" />
                {t("collectionsLabel")}
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {t("exploreBySeries")}
              </h2>
            </div>
            <Link
              href={localePath("/blog/series")}
              className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 transition-colors hover:text-teal-900 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {seriesItems.map((item) => (
              <SeriesRow key={item.slug} item={item} compact />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — Meet the Team (~40vh) */}
      <MeetTheTeamSection />

      <NewsletterSection />

    </div>
  );
}
