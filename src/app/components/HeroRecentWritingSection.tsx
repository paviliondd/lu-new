"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Compass, BookOpen, Share2 } from "lucide-react";
import type { Post } from "@/app/data";
import { team } from "@/app/data";
import AuthorAvatar, { getAuthorDisplay } from "@/app/components/AuthorAvatar";
import CustomImage from "@/app/components/CustomImage";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePublishedPosts } from "@/app/components/usePublishedPosts";
import { formatTopicLabel } from "@/lib/utils/formatTopic";

interface HeroRecentWritingSectionProps {
  initialPosts: Post[];
}

function formatDate(value: string, locale: "vi" | "en") {
  if (!value) return "";
  return new Date(value).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "numeric",
  });
}

function FeatureColumns() {
  const features = [
    { id: 0, label: "explore", icon: Compass },
    { id: 1, label: "learn", icon: BookOpen },
    { id: 2, label: "share", icon: Share2 },
  ];

  return (
    <div className="pt-6 mt-6 border-t theme-border w-full">
      <div className="pipeline-sequence flex items-start justify-between">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.label}>
              {/* Node Item */}
              <div className="flex flex-col items-center justify-start text-center shrink-0">
                <div className={`pipeline-node pipeline-node--${idx} relative flex h-9 w-9 items-center justify-center rounded-full border sm:h-10 sm:w-10`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                <span
                  className="mt-2 text-xs font-bold lowercase tracking-wide text-slate-700 dark:text-slate-300 sm:text-sm"
                >
                  {item.label}
                </span>
              </div>

              {/* Connecting Pipeline Line aligned with badge center */}
              {idx < features.length - 1 && (
                <div className="pipeline-track relative mx-2 my-4 flex-1 sm:my-5">
                  <span aria-hidden="true" className={`pipeline-connector pipeline-connector--${idx}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function HeroRecentWritingSection({ initialPosts }: HeroRecentWritingSectionProps) {
  const { language, localePath, t } = useLanguage();
  const fetchedPosts = usePublishedPosts(initialPosts, 6);
  
  // Prefer published posts; fallback to initialPosts to always guarantee 3 cards
  let availablePosts = fetchedPosts.filter((post) => post.status === "published");
  if (availablePosts.length < 3) {
    const existingSlugs = new Set(availablePosts.map((p) => p.slug));
    const fallbackList = (initialPosts || []).filter((p) => !existingSlugs.has(p.slug));
    availablePosts = [...availablePosts, ...fallbackList];
  }

  const posts = availablePosts
    .sort((left, right) => new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime())
    .slice(0, 3); // Exactly 3 posts

  const featuredPost = posts[0];
  const subPosts = posts.slice(1, 3);
  const heroUnityTitle = t("heroTitleUnity");

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center border-b theme-border px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Background ambient light */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[5%] h-[280px] w-[280px] rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-400/15" />
        <div className="absolute bottom-10 right-[5%] h-[280px] w-[280px] rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/15" />
      </div>

      {/* Grid Layout */}
      <div className="mx-auto grid w-full max-w-7xl gap-6 py-2 xl:grid-cols-[minmax(21rem,0.9fr)_minmax(0,1.35fr)] xl:items-stretch">
        {/* Left Column: Hero Brand & Connecting Feature Pipeline */}
        <div className="flex flex-col justify-between items-start text-left p-6 sm:p-8 rounded-2xl border theme-border theme-surface h-full">
          <div className="w-full text-left my-auto">
            <h1 className="hero-unity-lockup text-4xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-none text-left text-slate-950 dark:text-white">
              <span>{heroUnityTitle}</span>
              <span className="hero-journey-word">{t("heroTitleJourney")}</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed theme-muted max-w-md">
              {t("heroDesc")}
            </p>

            <div className="mt-5 flex justify-end max-w-md">
              <Link
                href={localePath("/blog")}
                className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-950 dark:text-teal-400 hover:text-teal-600 dark:hover:text-emerald-300 transition-colors"
              >
                <span>{t("startExploring")}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Bottom Nodes with connecting pipeline lines */}
          <FeatureColumns />
        </div>

        {/* Right Column: Section Header Bar + Recent Writing Grid */}
        <div className="flex flex-col justify-between h-full space-y-4">
          {/* Header Bar: "Latest" + "View All →" */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Latest
            </h2>

            <Link
              href={localePath("/blog")}
              className="group inline-flex items-center gap-1 text-sm font-bold text-teal-700 transition-colors hover:text-teal-900 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              <span>{t("viewAll")}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Main Featured Post */}
          {featuredPost && (() => {
            const authorKey = featuredPost.author in team ? featuredPost.author : "peterparker";
            const author = team[authorKey] || team.peterparker;
            const displayAuthor = getAuthorDisplay(author, featuredPost);
            const cover = featuredPost.seo.ogImage || featuredPost.thumbnail;
            const category = featuredPost.category || "DevOps";

            return (
              <article className="theme-card group flex flex-col overflow-hidden rounded-2xl border theme-border transition-all duration-300 hover:shadow-lg hover:border-teal-500/50">
                <Link
                  href={localePath(`/blog/${featuredPost.slug}`)}
                  className="relative block aspect-[16/8.5] max-h-[220px] sm:max-h-[250px] w-full overflow-hidden bg-slate-100 dark:bg-slate-900"
                >
                  {cover ? (
                    <CustomImage
                      src={cover}
                      alt={featuredPost.title}
                      fill
                      sizes="(min-width: 1024px) 67vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-4 text-center">
                      <span className="text-sm font-bold text-teal-300 tracking-wide">
                        {featuredPost.title}
                      </span>
                    </div>
                  )}

                  <div className="absolute left-3 top-3">
                    <span className="rounded-md bg-slate-950/85 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                      {formatTopicLabel(category)}
                    </span>
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                    <Link href={localePath(`/blog/${featuredPost.slug}`)}>
                      {featuredPost.title}
                    </Link>
                  </h3>
                  {featuredPost.description && (
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {featuredPost.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-2.5 border-t theme-border pt-3 text-xs theme-muted">
                    <AuthorAvatar author={author} post={featuredPost} className="h-6 w-6" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {displayAuthor.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(featuredPost.date, language)}
                    </span>

                  </div>
                </div>
              </article>
            );
          })()}

          {/* Bottom Sub-cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {subPosts.map((post, idx) => {
              const authorKey = post.author in team ? post.author : (idx % 2 === 0 ? "huynhminhthai" : "peterparker");
              const author = team[authorKey] || (idx % 2 === 0 ? team.huynhminhthai : team.peterparker);
              const displayAuthor = getAuthorDisplay(author, post);
              const cover = post.seo.ogImage || post.thumbnail;
              const category = post.category || "Ansible";

              return (
                <article
                  key={post.slug}
                  className="theme-card group flex flex-col overflow-hidden rounded-2xl border theme-border transition duration-300 hover:shadow-md hover:border-teal-500/50"
                >
                  <Link
                    href={localePath(`/blog/${post.slug}`)}
                    className="relative block aspect-[16/8.5] max-h-[130px] sm:max-h-[145px] w-full overflow-hidden bg-slate-100 dark:bg-slate-900"
                  >
                    {cover ? (
                      <CustomImage
                        src={cover}
                        alt={post.title}
                        fill
                        sizes="(min-width: 640px) 33vw, 50vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-2 text-center">
                        <span className="text-[11px] font-bold text-teal-300 line-clamp-2">
                          {post.title}
                        </span>
                      </div>
                    )}
                    <div className="absolute left-2 top-2">
                      <span className="rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-white">
                        {formatTopicLabel(category)}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-3.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                      <Link href={localePath(`/blog/${post.slug}`)}>
                        {post.title}
                      </Link>
                    </h4>

                    <div className="mt-auto pt-2.5 text-[11px] theme-muted flex items-center gap-1.5 truncate">
                      <span>{displayAuthor.name}</span>
                      <span>•</span>
                      <span>{formatDate(post.date, language)}</span>

                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
