"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import type { Author, Post } from "@/app/data";
import type { Locale } from "@/i18n/config";
import CustomImage from "./CustomImage";
import { useLanguage } from "./LanguageProvider";

interface PostCardProps {
  post: Post;
  author?: Author;
  locale: Locale;
  featured?: boolean;
}

export default function PostCard({
  post,
  author,
  locale,
  featured = false,
}: PostCardProps) {
  const { localePath } = useLanguage();
  const href = localePath(`/blog/${post.slug}`);
  const displayDate = post.date
    ? new Date(post.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <article
      className={`group relative isolate overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/80 shadow-xl shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-emerald-950/30 ${
        featured ? "min-h-[30rem]" : "min-h-[23rem]"
      }`}
    >
      <Link href={href} className="absolute inset-0 z-20" aria-label={post.title} />

      <div className="absolute inset-0">
        {post.seo.ogImage ? (
          <CustomImage
            src={post.seo.ogImage}
            alt=""
            fill
            sizes={featured ? "(min-width: 768px) 70vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${post.gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/75 to-slate-950/10" />
      </div>

      <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end p-6 sm:p-7">
        <div className="mb-4 flex items-center justify-end">
          <ArrowUpRight className="h-5 w-5 text-cyan-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>

        <h3
          className={`line-clamp-2 font-bold leading-tight text-white ${
            featured ? "max-w-3xl text-3xl sm:text-4xl" : "text-xl"
          }`}
        >
          {post.title}
        </h3>

        {post.description && (
          <p
            className={`mt-3 line-clamp-2 leading-6 text-slate-300 ${
              featured ? "max-w-2xl text-base" : "text-sm"
            }`}
          >
            {post.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">
            {(author?.name || "LinuxUnity").split(" (")[0]}
          </span>
          {displayDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {displayDate}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>
      </div>
    </article>
  );
}
