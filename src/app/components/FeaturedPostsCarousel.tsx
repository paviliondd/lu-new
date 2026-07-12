"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import type { Post } from "@/app/data";
import { team } from "@/app/data";
import AuthorAvatar, { getAuthorDisplay } from "@/app/components/AuthorAvatar";
import CustomImage from "@/app/components/CustomImage";
import { useLanguage } from "@/app/components/LanguageProvider";

interface FeaturedPostsCarouselProps {
  posts: Post[];
}

function topicsFor(post: Post) {
  return Array.from(new Set([post.category, ...post.tags].filter(Boolean))).slice(0, 4);
}

function formatDate(value: string, locale: "vi" | "en") {
  return new Date(value).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function FeaturedPostsCarousel({ posts }: FeaturedPostsCarouselProps) {
  const { language, localePath } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const featuredPosts = posts.slice(0, 3);
  const safeActiveIndex = featuredPosts.length ? activeIndex % featuredPosts.length : 0;
  const activePost = featuredPosts[safeActiveIndex];

  useEffect(() => {
    if (featuredPosts.length < 2 || isHovered || isManuallyPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredPosts.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [featuredPosts.length, isHovered, isManuallyPaused]);

  useEffect(() => {
    if (!isManuallyPaused) return;
    const timer = window.setTimeout(() => setIsManuallyPaused(false), 6000);
    return () => window.clearTimeout(timer);
  }, [isManuallyPaused]);

  if (!activePost) return null;

  const author = team[activePost.author];
  const displayAuthor = getAuthorDisplay(author, activePost);
  const cover = activePost.seo.ogImage || activePost.thumbnail;
  const changeSlide = (offset: number) => {
    setIsManuallyPaused(true);
    setActiveIndex((current) => (current + offset + featuredPosts.length) % featuredPosts.length);
  };

  const selectSlide = (index: number) => {
    setIsManuallyPaused(true);
    setActiveIndex(index);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14">
      <div
        className="group relative overflow-hidden rounded-xl border theme-border bg-slate-900 shadow-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="grid min-h-[30rem] lg:grid-cols-[1.08fr_.92fr]">
          <div className="relative min-h-64 bg-slate-950 lg:min-h-full">
            {cover ? (
              <CustomImage
                key={activePost.slug}
                src={cover}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-8 text-center text-2xl font-bold text-slate-200">
                {activePost.title}
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col justify-center bg-slate-800 p-6 text-white sm:p-9 lg:p-11">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-teal-400/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-teal-200">
                Featured
              </span>
              {topicsFor(activePost).map((topic) => (
                <span key={topic} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/90">
                  {topic}
                </span>
              ))}
            </div>
            <h1 className="mt-6 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">{activePost.title}</h1>
            <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-300 sm:text-base">{activePost.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 font-semibold text-white">
                <AuthorAvatar author={author} post={activePost} className="h-8 w-8 border-white/15 bg-slate-700 text-white" />
                {displayAuthor.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(activePost.date, language)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {activePost.readTime}
              </span>
            </div>
            <Link
              href={localePath(`/blog/${activePost.slug}`)}
              className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold text-teal-200 transition hover:text-white"
            >
              Read
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {featuredPosts.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => changeSlide(-1)}
              aria-label="Previous featured post"
              className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-800 opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100 focus:opacity-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => changeSlide(1)}
              aria-label="Next featured post"
              className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-800 opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100 focus:opacity-100"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {featuredPosts.map((post, index) => (
                <button
                  key={post.slug}
                  type="button"
                  onClick={() => selectSlide(index)}
                  aria-label={`Show featured post ${index + 1}`}
                  aria-current={index === safeActiveIndex}
                  className={`h-2 rounded-full transition ${index === safeActiveIndex ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {featuredPosts.length > 1 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {featuredPosts.map((post, index) => {
            const thumbnail = post.seo.ogImage || post.thumbnail;
            return (
              <button
                key={post.slug}
                type="button"
                onClick={() => selectSlide(index)}
                aria-label={`Show ${post.title}`}
                aria-pressed={index === activeIndex}
                className={`relative aspect-[16/8] overflow-hidden rounded-lg border text-left transition ${
                  index === safeActiveIndex
                    ? "border-teal-500 ring-1 ring-teal-500 dark:border-emerald-400 dark:ring-emerald-400"
                    : "theme-border opacity-70 hover:opacity-100"
                }`}
              >
                {thumbnail ? (
                  <CustomImage src={thumbnail} alt="" fill sizes="(min-width: 768px) 20vw, 30vw" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center bg-slate-800 px-3 text-center text-xs font-bold text-white">
                    {post.title}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
