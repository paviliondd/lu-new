"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import type { Post } from "@/app/data";
import { team } from "@/app/data";
import AuthorAvatar, { getAuthorDisplay } from "@/app/components/AuthorAvatar";
import CustomImage from "@/app/components/CustomImage";
import { useLanguage } from "@/app/components/LanguageProvider";
import { formatReadTime } from "@/lib/utils/formatReadTime";

interface FeaturedPostsCarouselProps {
  posts: Post[];
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
}: FeaturedPostsCarouselProps) {
  const { language, localePath } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const featuredPosts = posts
    .filter((post) => post.status === "published")
    .sort((left, right) => new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime())
    .slice(0, 3);
  const safeActiveIndex = featuredPosts.length ? activeIndex % featuredPosts.length : 0;
  const activePost = featuredPosts[safeActiveIndex];

  if (!activePost) return null;

  const changeSlide = (offset: number) => {
    setActiveIndex((current) => (current + offset + featuredPosts.length) % featuredPosts.length);
  };

  const selectSlide = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <div
        className="group relative overflow-hidden rounded-xl border theme-border bg-slate-900 shadow-sm"
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
                className="w-full shrink-0"
                aria-hidden={index !== safeActiveIndex}
              >
                <Link
                  href={localePath(`/blog/${post.slug}`)}
                  className="group/slide grid min-h-[26rem] w-full cursor-pointer lg:grid-cols-[1.05fr_.95fr]"
                  aria-label={post.title}
                >
                  <div className="relative min-h-64 overflow-hidden bg-slate-950 lg:min-h-full">
                    {postCover ? (
                      <CustomImage
                        src={postCover}
                        alt=""
                        fill
                        priority={index === 0}
                        sizes="(min-width: 1024px) 55vw, 100vw"
                        className="object-cover transition duration-500 group-hover/slide:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-8 text-center text-2xl font-bold text-slate-200">
                        {post.title}
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col justify-between bg-slate-800 p-6 text-white sm:p-9 lg:p-11">
                    <div>
                      <h1 className="text-2xl font-bold leading-tight transition group-hover/slide:text-teal-200 sm:text-3xl lg:text-4xl">{post.title}</h1>
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
                          {formatReadTime(post.readTime)}
                        </span>
                      </div>
                      <span
                        className="ml-auto inline-flex items-center gap-2 text-sm font-bold text-teal-200 transition group-hover/slide:text-white group-hover/slide:translate-x-0.5"
                      >
                        Read
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        {featuredPosts.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                changeSlide(-1);
              }}
              aria-label="Previous featured post"
              className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-800 shadow-sm transition hover:bg-white lg:left-4 lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                changeSlide(1);
              }}
              aria-label="Next featured post"
              className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-800 shadow-sm transition hover:bg-white lg:right-4 lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-1 left-1/2 z-10 flex -translate-x-1/2 items-center">
              {featuredPosts.map((post, index) => (
                <button
                  key={post.slug}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    selectSlide(index);
                  }}
                  aria-label={`Show featured post ${index + 1}`}
                  aria-current={index === safeActiveIndex}
                  className="grid h-11 w-11 cursor-pointer place-items-center"
                >
                  <span className={`h-2 rounded-full transition ${index === safeActiveIndex ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
