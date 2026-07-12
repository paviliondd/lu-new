"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Eye } from "lucide-react";
import type { Post } from "@/app/data";
import { team } from "@/app/data";
import AuthorAvatar, { getAuthorDisplay } from "@/app/components/AuthorAvatar";
import CustomImage from "@/app/components/CustomImage";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePublishedPosts } from "@/app/components/usePublishedPosts";

interface RecentWritingSectionProps {
  excludeSlugs?: string[];
  initialPosts: Post[];
}

function formatDate(value: string, locale: "vi" | "en") {
  return new Date(value).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function postTopics(post: Post) {
  return Array.from(new Set([post.category, ...post.tags].filter(Boolean))).slice(0, 2);
}

export default function RecentWritingSection({ excludeSlugs = [], initialPosts }: RecentWritingSectionProps) {
  const { language, localePath, t } = useLanguage();
  const excluded = new Set(excludeSlugs);
  const posts = usePublishedPosts(initialPosts)
    .filter((post) => post.status === "published" && !excluded.has(post.slug))
    .sort((left, right) => new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime())
    .slice(0, 3);

  if (!posts.length) return null;

  return (
    <section className="border-b theme-border py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-emerald-300">
              <span className="h-px w-9 bg-current" />
              From the blog
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {t("recentWriting")}
            </h2>
          </div>
          <Link
            href={localePath("/blog")}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-teal-700 transition hover:text-teal-900 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            {t("viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, index) => {
            const author = team[post.author];
            const displayAuthor = getAuthorDisplay(author, post);
            const cover = post.seo.ogImage || post.thumbnail;
            const topics = postTopics(post);

            return (
              <article
                key={post.slug}
                className={`theme-card group flex min-w-0 flex-col overflow-hidden rounded-xl border transition duration-200 hover:-translate-y-0.5 hover:border-teal-500 dark:hover:border-emerald-400 ${
                  index === 2 ? "md:border-teal-500/50 dark:md:border-emerald-400/40" : ""
                }`}
              >
                <Link
                  href={localePath(`/blog/${post.slug}`)}
                  className="relative block aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900"
                  aria-label={post.title}
                >
                  {cover ? (
                    <CustomImage
                      src={cover}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-800 px-6 text-center text-lg font-bold text-white dark:bg-slate-950">
                      {post.title}
                    </div>
                  )}
                  {topics.length > 0 && (
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      {topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 text-lg font-bold leading-6 text-slate-950 dark:text-white">
                    <Link href={localePath(`/blog/${post.slug}`)} className="transition hover:text-teal-700 dark:hover:text-emerald-300">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="theme-muted mt-3 line-clamp-2 text-sm leading-6">{post.description}</p>
                  <div className="mt-auto flex items-center gap-3 border-t theme-border pt-4 text-xs theme-muted">
                    <AuthorAvatar author={author} post={post} className="h-7 w-7" />
                    <span className="min-w-0 flex-1 truncate font-semibold text-slate-800 dark:text-slate-200">
                      {displayAuthor.name}
                    </span>
                    <span className="hidden items-center gap-1.5 sm:flex">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.date, language)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      {post.views || 0}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
