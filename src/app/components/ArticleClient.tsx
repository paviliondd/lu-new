"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Clock, Link2, ChevronRight } from "lucide-react";
import { Post, Author, team } from "../data";
import { useLanguage } from "./LanguageProvider";
import ArticleImageEnhancer from "./ArticleImageEnhancer";
import CodeBlockEnhancer from "./CodeBlockEnhancer";
import PostListRow from "./PostListRow";
import TableOfContents, { TocHeading } from "./TableOfContents";
import CustomImage from "./CustomImage";
import AuthorAvatar from "./AuthorAvatar";

interface ArticleClientProps {
  post: Post;
  author: Author;
  headings: TocHeading[];
  relatedPosts: Post[];
  assetBase?: string;
  legacyAssetOrigins?: string[];
}

function formatPostDate(value: string, language: string) {
  if (!value) return language === "vi" ? "Chua xuat ban" : "Unpublished";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return language === "vi" ? "Ngay khong hop le" : "Invalid date";
  }

  return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatViews(value: number, language: string) {
  return value.toLocaleString(language === "vi" ? "vi-VN" : "en-US");
}

export default function ArticleClient({
  post,
  author,
  headings,
  relatedPosts,
  assetBase,
  legacyAssetOrigins,
}: ArticleClientProps) {
  const { t, language, localePath } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [views, setViews] = useState(post.views || 0);

  useEffect(() => {
    const storageKey = `linuxunity:viewed:${post.slug}`;
    const viewedAt = Number(localStorage.getItem(storageKey) || 0);
    const viewWindowMs = 24 * 60 * 60 * 1000;

    if (viewedAt && Date.now() - viewedAt < viewWindowMs) return;

    localStorage.setItem(storageKey, String(Date.now()));

    fetch(`/api/posts/${encodeURIComponent(post.slug)}/view`, {
      method: "POST",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { views?: number } | null) => {
        if (typeof payload?.views === "number") {
          setViews(payload.views);
        }
      })
      .catch(() => {
        localStorage.removeItem(storageKey);
      });
  }, [post.slug]);

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="theme-page w-full overflow-x-clip py-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Breadcrumb */}
        <div className="mb-8 flex min-w-0 items-center gap-1 overflow-hidden text-xs text-gray-500">
          <Link href={localePath("/")} className="hover:text-brand-650 transition">{t("home")}</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href={localePath("/blog")} className="hover:text-brand-650 transition">{t("blog")}</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate text-gray-900 dark:text-gray-100 font-medium max-w-[52vw] sm:max-w-xs">
            {post.title}
          </span>
        </div>

        {/* 3-Column Layout */}
        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,980px)_18rem] lg:justify-center lg:gap-10">
          
          {/* Left Column: Back button, author details & share */}
          <div className="order-2 space-y-8 lg:hidden">
            {/* Back to Blog */}
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                window.location.replace(localePath("/blog"));
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition group cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition duration-200" />
              {t("backToBlog")}
            </button>

            {/* Author Card */}
            <div className="rounded-2xl border border-gray-250/70 p-5 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20">
              <div className="flex items-center gap-3 mb-4">
                <AuthorAvatar author={author} post={post} className="h-10 w-10" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    {author.name}
                  </h4>
                  <p className="text-[10px] text-brand-600 dark:text-brand-400 font-medium mt-0.5">
                    {language === "en" ? author.role_en || author.role : author.role}
                  </p>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 mb-4">
                {language === "en"
                  ? author.description_en || author.description
                  : author.description}
              </p>
              
              {/* Author socials */}
              <div className="flex gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a
                  href={author.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                </a>
              </div>
            </div>

            {/* Share Post */}
            <div className="space-y-3 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("share")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyLink}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title={t("copyLinkText")}
                >
                  <Link2 className="h-4 w-4" />
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?url=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  title={t("shareTwitter")}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {copied && (
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
                    {t("copiedLink")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center Column: Main Content */}
          <div className="order-1 min-w-0 space-y-6">
            {/* Header info */}
            <div className="space-y-4">
              <h1 className="break-words text-2xl font-extrabold leading-tight tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-4xl">
                {post.title}
              </h1>
              <p className="theme-muted text-sm font-medium leading-relaxed sm:text-base">
                {post.description}
              </p>
              
              {/* Post Metadata row */}
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-gray-400">
                <span className="flex min-w-0 items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatPostDate(post.date, language)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {formatViews(views, language)} {t("views")}
                </span>
              </div>
            </div>

            {/* Banner Cover Gradient */}
            <div className={`relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gradient-to-br shadow-inner sm:aspect-[21/9] sm:rounded-2xl ${post.gradient}`}>
              {post.seo.ogImage ? (
                <CustomImage
                  src={post.seo.ogImage}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1024px) 980px, 100vw"
                  className="object-cover"
                  fetchPriority="high"
                />
              ) : (
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
              )}
            </div>

            {/* Prose Content Rendering */}
            <div className="article-content prose max-w-none overflow-hidden dark:prose-invert">
              <CodeBlockEnhancer
                contentKey={`${post.slug}-${language}`}
                copyLabel={t("copyCode")}
                copiedLabel={t("copiedCode")}
                failedLabel={t("copyFailed")}
              />
              <ArticleImageEnhancer
                assetBase={assetBase}
                contentKey={`${post.slug}-${language}`}
                legacyAssetOrigins={legacyAssetOrigins}
              />
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {relatedPosts.length > 0 && (
              <section className="pt-10">
                <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                    {t("relatedPosts")}
                  </h2>
                  <Link
                    href={localePath("/blog")}
                    className="text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
                  >
                    {t("viewAll")}
                  </Link>
                </div>
                <div>
                  {relatedPosts.map((relatedPost, index) => (
                    <PostListRow
                      key={relatedPost.slug}
                      post={relatedPost}
                      author={team[relatedPost.author] || team.nhatnghia}
                      index={index}
                      language={language}
                      isLast={index === relatedPosts.length - 1}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <TableOfContents
            headings={headings}
            title={t("toc")}
            emptyLabel={t("noToc")}
          />

        </div>
      </div>
    </div>
  );
}
