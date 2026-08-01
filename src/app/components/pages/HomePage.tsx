"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Post, Series } from "@/app/data";
import { useLanguage } from "@/app/components/LanguageProvider";
import RecentWritingSection from "@/app/components/RecentWritingSection";
import SeriesRow from "@/app/components/SeriesRow";

interface HomePageProps {
  initialPosts: Post[];
  seriesItems: Series[];
}

function ProgressFlow() {
  // 1-way Ocean Wave Sequence:
  // Step 0: explore active
  // Step 1: line 1 fills down -> learn active
  // Step 2: line 2 fills down -> share active (all 3 active)
  // Step 3: hold full state (all 3 active)
  // Step 4: wave dissolves (fade out opacity-0, reset to 0) -> repeat
  const [activeStep, setActiveStep] = useState(0);
  const [isDissolving, setIsDissolving] = useState(false);

  useEffect(() => {
    let current = 0;
    
    // Smooth 2.0s per step
    const interval = setInterval(() => {
      current = (current + 1) % 4;

      if (current === 0) {
        // Wave dissolves like ocean water receding, then new wave rises from top
        setIsDissolving(true);
        setTimeout(() => {
          setActiveStep(0);
          setIsDissolving(false);
        }, 450);
      } else {
        setActiveStep(current);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const items = [
    { label: "explore", id: 0 },
    { label: "learn", id: 1 },
    { label: "share", id: 2 },
  ];

  return (
    <div className="w-full">
      {/* Desktop Vertical Flow / Mobile Horizontal Flow */}
      <div className="flex items-center justify-between sm:justify-start gap-4 lg:flex-col lg:items-start lg:gap-0">
        {items.map((item, idx) => {
          const isPassed = activeStep >= idx;
          const isActive = activeStep === idx;
          
          return (
            <React.Fragment key={item.label}>
              <div className="flex items-center gap-3.5 py-1">
                {/* Node dot container - fixed size for pixel-perfect line alignment */}
                <div className="relative flex h-5 w-5 items-center justify-center">
                  <div
                    className={`rounded-full transition-all duration-500 ease-out ${
                      isDissolving
                        ? "h-1.5 w-1.5 bg-slate-300 opacity-30 dark:bg-slate-700"
                        : isActive
                        ? "h-2.5 w-2.5 bg-[#0f9c98] ring-4 ring-[#0f9c98]/20 dark:bg-teal-400 dark:ring-teal-400/20"
                        : isPassed
                        ? "h-1.5 w-1.5 bg-[#0f9c98] dark:bg-teal-400"
                        : "h-1.5 w-1.5 bg-slate-300 dark:bg-slate-700"
                    }`}
                  />
                </div>

                {/* Label text */}
                <span
                  className={`text-[15px] tracking-wide transition-all duration-300 lowercase ${
                    isDissolving
                      ? "font-normal text-slate-400 dark:text-slate-500"
                      : isActive
                      ? "font-semibold text-[#0f9c98] dark:text-teal-400"
                      : isPassed
                      ? "font-medium text-[#0f9c98]/90 dark:text-teal-400/90"
                      : "font-normal text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {/* Connecting line (vertical on desktop, horizontal on mobile/tablet) */}
              {idx < items.length - 1 && (
                <>
                  {/* Desktop Vertical Line */}
                  <div className="hidden lg:block my-1 ml-[9.5px] h-12 w-px overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <div
                      className={`w-full bg-[#0f9c98] transition-all ease-in-out dark:bg-teal-400 ${
                        isDissolving
                          ? "opacity-0 duration-400"
                          : "opacity-100 duration-700"
                      }`}
                      style={{
                        height: activeStep > idx && !isDissolving ? "100%" : "0%",
                      }}
                    />
                  </div>

                  {/* Mobile/Tablet Horizontal Line */}
                  <div className="block lg:hidden h-px w-6 sm:w-10 overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <div
                      className={`h-full bg-[#0f9c98] transition-all ease-in-out dark:bg-teal-400 ${
                        isDissolving
                          ? "opacity-0 duration-400"
                          : "opacity-100 duration-700"
                      }`}
                      style={{
                        width: activeStep > idx && !isDissolving ? "100%" : "0%",
                      }}
                    />
                  </div>
                </>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage({ initialPosts, seriesItems }: HomePageProps) {
  const { t, localePath } = useLanguage();

  return (
    <div className="theme-page min-h-screen overflow-x-clip bg-[#fdfcf9] dark:bg-[#0c1524]">
      {/* Editorial Hero Section (Asymmetric 70% / 30% ratio) */}
      <section className="relative isolate flex min-h-[600px] flex-col justify-center overflow-hidden border-b border-[#dfe5ea] dark:border-slate-800/80 py-16 px-6 sm:py-20 lg:min-h-[660px] lg:py-24 lg:px-20">
        {/* Organic Ambient Floating Sea-Bubble Glow Effect */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-[6%] h-[360px] w-[360px] rounded-full bg-teal-400/30 blur-3xl dark:bg-teal-400/25 animate-live-bubble-1" />
          <div className="absolute top-20 left-[20%] h-[420px] w-[420px] rounded-full bg-emerald-400/25 blur-3xl dark:bg-teal-500/25 animate-live-bubble-2" />
          <div className="absolute top-32 left-[2%] h-[320px] w-[320px] rounded-full bg-cyan-400/25 blur-3xl dark:bg-cyan-500/25 animate-live-bubble-3" />
        </div>

        <div className="mx-auto grid w-full max-w-[1320px] items-center gap-10 lg:grid-cols-[1fr_240px] lg:gap-16">
          {/* Left Zone: Title, Brand Description & Action Button */}
          <div className="flex flex-col items-start text-left">
            <h1 className="flex flex-wrap items-baseline gap-x-3 text-[clamp(44px,4.5vw,72px)] leading-none tracking-[-0.04em]">
              <span className="font-extrabold text-[#111a29] dark:text-white">
                {t("heroTitleUnity")}
              </span>
              <span className="font-serif italic font-normal text-[#0f9c98] dark:text-teal-400 tracking-[-0.03em]">
                {t("heroTitleJourney")}
              </span>
            </h1>

            <p className="mt-5 sm:mt-6 max-w-[780px] text-base leading-[1.6] text-[#42526b] dark:text-slate-300 sm:text-lg">
              {t("heroDesc")}
            </p>

            <div className="mt-7 sm:mt-8">
              <Link
                href={localePath("/blog")}
                className="group inline-flex h-[46px] items-center justify-center rounded-lg bg-[#111a29] px-6 text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1a2638] dark:bg-[#0f9c98] dark:hover:bg-teal-500 dark:border dark:border-teal-400/40 dark:shadow-[0_4px_20px_rgba(15,156,152,0.35)]"
              >
                {t("startExploring")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Zone: Animated Progress Flow */}
          <div className="flex flex-col items-center lg:items-start lg:justify-center border-t border-slate-200/60 dark:border-slate-800/60 pt-8 lg:border-t-0 lg:pt-0">
            <ProgressFlow />
          </div>
        </div>
      </section>

      <RecentWritingSection initialPosts={initialPosts} />

      <section className="theme-surface border-t theme-border py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
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
          <div className="grid gap-4">
            {seriesItems.map((item) => <SeriesRow key={item.slug} item={item} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
