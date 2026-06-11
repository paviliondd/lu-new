"use client";

import Link from "next/link";
import type { Author, Post } from "../data";
import { useLanguage } from "./LanguageProvider";

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
  const serviceLabel = post.category.split(/[\s/&-]+/)[0] || "AWS";
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
      className={`group flex gap-4 px-2 py-5 transition hover:bg-cyan-400/5 sm:px-3 ${
        isLast ? "" : "border-b border-slate-700"
      }`}
    >
      <span className="mt-1 w-6 shrink-0 text-xs font-medium text-gray-400">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${post.gradient}`}
      >
        <span className="px-1 text-center text-xs font-bold uppercase tracking-wide text-white">
          {serviceLabel}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-medium leading-snug text-slate-100 transition group-hover:text-cyan-300">
          {post.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
          {post.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            {author?.avatar || "A"}
          </span>
          <span className="font-medium text-slate-300">
            {(author?.name || "Admin").split(" (")[0]}
          </span>
          <span>{displayDate}</span>
          <span className="ml-auto">{post.readTime}</span>
        </div>
      </div>
    </Link>
  );
}
