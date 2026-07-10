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
  const { localePath, t } = useLanguage();
  const href = localePath(`/blog/${post.slug}`);
  const displayAuthor = getAuthorDisplay(author, post);
  const coverTags = post.tags.slice(0, 3);
  const placeholderLabel = post.category.split(/[\s/&-]+/)[0] || "LinuxUnity";
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
      className={`theme-card group flex min-w-0 flex-col overflow-hidden rounded-xl border transition duration-200 hover:-translate-y-0.5 hover:border-teal-500 dark:hover:border-emerald-400 ${
        featured ? "min-h-[24rem]" : "min-h-[20rem]"
      }`}
    >
      <Link
        href={href}
        className={`relative block overflow-hidden border-b theme-border bg-slate-100 dark:bg-slate-900 ${
          featured ? "aspect-[16/8]" : "aspect-[16/9]"
        }`}
        aria-label={post.title}
      >
        {post.seo.ogImage ? (
          <CustomImage
            src={post.seo.ogImage}
            alt=""
            fill
            sizes={featured ? "(min-width: 768px) 64vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <span className="rounded-full border theme-border bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] dark:bg-slate-950">
              {placeholderLabel}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {coverTags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {coverTags.map((tag) => (
              <Link
                key={tag}
                href={localePath(`/blog?tag=${encodeURIComponent(tag)}`)}
                className="rounded-full border theme-border bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-teal-500 hover:text-teal-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
              >
                {tag}
              </Link>
            ))}
            {hiddenTagCount > 0 && (
              <span className="rounded-full border theme-border px-2.5 py-1 text-[11px] font-bold theme-muted">
                +{hiddenTagCount}
              </span>
            )}
          </div>
        )}

        <h3
          className={`line-clamp-2 break-words font-bold leading-tight text-slate-950 dark:text-white ${
            featured ? "text-2xl sm:text-3xl" : "text-xl"
          }`}
        >
          <Link href={href} className="transition hover:text-teal-700 dark:hover:text-emerald-300">
            {post.title}
          </Link>
        </h3>

        {post.description && (
          <p className={`theme-muted mt-3 line-clamp-2 leading-6 ${featured ? "text-base" : "text-sm"}`}>
            {post.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-5 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex min-w-0 items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <AuthorAvatar author={author} post={post} className="h-6 w-6" />
            <span className="truncate">{displayAuthor.name}</span>
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
            {formatCompactViews(post.views || 0, locale)} {t("views")}
          </span>
          <ArrowUpRight className="ml-auto h-4 w-4 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-700 dark:group-hover:text-emerald-300" />
        </div>
      </div>
    </article>
  );
}
