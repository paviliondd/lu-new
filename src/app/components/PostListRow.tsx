"use client";

import Link from "next/link";
import type { Author, Post } from "../data";
import { useLanguage } from "./LanguageProvider";
import AuthorAvatar, { getAuthorDisplay } from "./AuthorAvatar";
import CustomImage from "./CustomImage";
import { formatReadTime } from "@/lib/utils/formatReadTime";

interface PostListRowProps {
  post: Post;
  author?: Author;
  index: number;
  language: string;
  isLast?: boolean;
}

export default function PostListRow({
  post,
  author,
  index,
  language,
  isLast = false,
}: PostListRowProps) {
  const { localePath } = useLanguage();
  const displayAuthor = getAuthorDisplay(author, post);
  const serviceLabel = post.category.split(/[\s/&-]+/)[0] || "AWS";
  const coverImage = post.heroImage?.src || post.seo?.ogImage || post.thumbnail;
  const displayDate = post.date
    ? new Date(post.date).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Draft";

  return (
    <Link
      href={localePath(`/blog/${post.slug}`)}
      className={`group flex min-w-0 gap-3 rounded-lg px-2 py-5 transition hover:bg-slate-100/70 dark:hover:bg-slate-900/70 sm:gap-4 sm:px-3 ${
        isLast ? "" : "border-b theme-border"
      }`}
    >
      <span className="mt-1 w-5 shrink-0 text-xs font-medium text-gray-400 sm:w-6">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border theme-border bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300 sm:h-20 sm:w-32">
        {coverImage ? (
          <CustomImage
            src={coverImage}
            alt={post.title}
            fill
            sizes="(min-width: 640px) 128px, 96px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="px-1 text-center text-xs font-bold uppercase tracking-wide">
            {serviceLabel}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold leading-snug text-slate-950 transition group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-emerald-300">
          {post.title}
        </h3>

        <p className="theme-muted mt-1 line-clamp-2 text-sm leading-6">
          {post.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <AuthorAvatar author={author} post={post} className="h-6 w-6" />
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {displayAuthor.name}
          </span>
          <span>{displayDate}</span>
          <span className="sm:ml-auto">{formatReadTime(post.readTime)}</span>
        </div>
      </div>
    </Link>
  );
}
