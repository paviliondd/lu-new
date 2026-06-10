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

function certClassName(cert: string) {
  if (cert.includes("DOP")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300";
  }

  return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-300";
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
      className={`group flex gap-4 px-2 py-5 transition hover:bg-gray-50 dark:hover:bg-gray-900/50 sm:px-3 ${
        isLast ? "" : "border-b border-gray-200 dark:border-gray-800"
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
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            {post.category}
          </span>
          {post.certs.map((cert) => (
            <span
              key={cert}
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${certClassName(cert)}`}
            >
              {cert}
            </span>
          ))}
        </div>

        <h3 className="mt-2 text-base font-medium leading-snug text-gray-950 transition group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
          {language === "vi" ? post.title : post.title_en}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {language === "vi" ? post.description : post.description_en}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            {author?.avatar || "A"}
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {(author?.name || "Admin").split(" (")[0]}
          </span>
          <span>{displayDate}</span>
          <span className="ml-auto">{language === "vi" ? post.readTime : post.readTime_en}</span>
        </div>
      </div>
    </Link>
  );
}
