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
  followingPosts: Post[];
}

function formatDate(value: string, locale: "vi" | "en") {
  return new Date(value).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function FeaturedPostsCarousel({
  posts,
  followingPosts,
}: FeaturedPostsCarouselProps) {
  const { language, localePath } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const featuredPosts = posts
    .filter((post) => post.status === "published")
    .sort((left, right) => new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime())
    .slice(0, 3);
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

  const changeSlide = (offset: number) => {
    setIsManuallyPaused(true);
    setActiveIndex((current) => (current + offset + featuredPosts.length) % featuredPosts.length);
  };

  const selectSlide = (index: number) => {
    setIsManuallyPaused(true);
    setActiveIndex(index);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-emerald-300">
          Featured
        </span>
      </div>
      <div
        className="group relative overflow-hidden rounded-xl border theme-border bg-slate-900 shadow-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${safeActiveIndex * 100}%)` }}
        >
          {featuredPosts.map((post, index) => {
            const postAuthor = team[post.author];
            const postDisplayAuthor = getAuthorDisplay(postAuthor, post);
            const postCover = post.seo.ogImage || post.thumbnail;

            return (
              <article
                key={post.slug}
                className="grid min-h-[26rem] w-full shrink-0 lg:grid-cols-[1.05fr_.95fr]"
                aria-hidden={index !== safeActiveIndex}
              >
                <div className="relative min-h-64 bg-slate-950 lg:min-h-full">
                  {postCover ? (
                    <CustomImage
                      src={postCover}
                      alt=""
                      fill
                      priority={index === 0}
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-8 text-center text-2xl font-bold text-slate-200">
                      {post.title}
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-col justify-between bg-slate-800 p-6 text-white sm:p-9 lg:p-11">
                  <div>
                    <span className="mb-3 inline-flex self-start rounded-full bg-teal-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-300 backdrop-blur-md">
                      Featured
                    </span>
                    <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">{post.title}</h1>
                    <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-300 sm:text-base">{post.description}</p>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-slate-300">
                      <span className="inline-flex items-center gap-2 font-semibold text-white">
                        <AuthorAvatar author={postAuthor} post={post} className="h-8 w-8 border-white/15 bg-slate-700 text-white" />
                        {postDisplayAuthor.name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.date, language)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <Link
                      href={localePath(`/blog/${post.slug}`)}
                      className="ml-auto inline-flex items-center gap-2 text-sm font-bold text-teal-200 transition hover:text-white"
                    >
                      Read
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
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

      {followingPosts.length > 0 && (
        <div className="featured-following-grid mt-4 grid gap-4 sm:grid-cols-3">
          {followingPosts.map((post) => {
            const thumbnail = post.seo.ogImage || post.thumbnail;
            return (
              <Link
                key={post.slug}
                href={localePath(`/blog/${post.slug}`)}
                className="theme-card group/next relative aspect-[16/10] min-h-[11.5rem] overflow-hidden rounded-xl border transition hover:-translate-y-0.5 hover:border-teal-500 dark:hover:border-emerald-400"
                aria-label={post.title}
              >
                {thumbnail ? (
                  <CustomImage
                    src={thumbnail}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 24rem, (min-width: 640px) 33vw, 100vw"
                    className="object-cover transition duration-300 group-hover/next:scale-[1.03]"
                  />
                ) : (
                  <span className="absolute inset-0 bg-slate-800" />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/20" />
                <span className="absolute inset-0 flex flex-col justify-between p-4.5 text-left">
                  <span className="line-clamp-2 text-sm font-bold leading-snug text-white drop-shadow-sm">
                    {post.title}
                  </span>
                  <span className="mt-2 flex items-center justify-end">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-200 transition group-hover/next:text-white">
                      Read <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
