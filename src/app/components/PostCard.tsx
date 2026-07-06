"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, Eye } from "lucide-react";
import type { Author, Post } from "@/app/data";
import type { Locale } from "@/i18n/config";
import CustomImage from "./CustomImage";
import { useLanguage } from "./LanguageProvider";
import AuthorAvatar, { getAuthorDisplay } from "./AuthorAvatar";

interface PostCardProps {
  post: Post;
  author?: Author;
  locale: Locale;
  featured?: boolean;
}

function formatCompactViews(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function PostCard({
  post,
  author,
  locale,
  featured = false,
}: PostCardProps) {
  const { localePath } = useLanguage();
  const href = localePath(`/blog/${post.slug}`);
  const displayAuthor = getAuthorDisplay(author, post);
  const coverTags = post.tags.slice(0, 3);
  const hiddenTagCount = Math.max(0, post.tags.length - coverTags.length);
  const displayDate = post.date
    ? new Date(post.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <article
      className={`theme-card group relative isolate min-w-0 overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-emerald-950/30 ${
        featured ? "min-h-[26rem] sm:min-h-[30rem]" : "min-h-[21rem] sm:min-h-[23rem]"
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
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/78 to-white/15 dark:from-[#0B132B] dark:via-[#0B132B]/75 dark:to-slate-950/10" />
      </div>

      <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end p-6 sm:p-7">
        {coverTags.length > 0 && (
          <div className="absolute left-5 top-5 z-30 flex max-w-[calc(100%-2.5rem)] flex-wrap gap-2">
            {coverTags.map((tag) => (
              <Link
                key={tag}
                href={localePath(`/blog?tag=${encodeURIComponent(tag)}`)}
                className="rounded-full bg-slate-950/70 px-2.5 py-1 text-[11px] font-extrabold text-cyan-100 ring-1 ring-white/15 backdrop-blur transition hover:bg-cyan-300 hover:text-slate-950"
              >
                {tag}
              </Link>
            ))}
            {hiddenTagCount > 0 && (
              <span className="rounded-full bg-slate-950/70 px-2.5 py-1 text-[11px] font-extrabold text-slate-200 ring-1 ring-white/15 backdrop-blur">
                +{hiddenTagCount}
              </span>
            )}
          </div>
        )}

        <div className="mb-4 flex items-center justify-end">
          <ArrowUpRight className="h-5 w-5 text-cyan-700 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-cyan-300" />
        </div>

        <h3
          className={`line-clamp-2 break-words font-bold leading-tight text-slate-950 dark:text-white ${
            featured ? "max-w-3xl text-2xl sm:text-4xl" : "text-xl"
          }`}
        >
          {post.title}
        </h3>

        {post.description && (
          <p
            className={`theme-muted mt-3 line-clamp-2 leading-6 ${
              featured ? "max-w-2xl text-base" : "text-sm"
            }`}
          >
            {post.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <AuthorAvatar author={author} post={post} className="h-6 w-6" />
            {displayAuthor.name}
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
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {formatCompactViews(post.views || 0, locale)} {locale === "vi" ? "lượt xem" : "views"}
          </span>
        </div>
      </div>
    </article>
  );
}
