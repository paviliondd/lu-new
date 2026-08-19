import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Post, Author, team } from "../data";
import PostListRow from "./PostListRow";
import TableOfContents, { MobileTableOfContents, TocHeading } from "./TableOfContents";
import CustomImage from "./CustomImage";
import AuthorAvatar from "./AuthorAvatar";
import Comments from "./Comments";
import ArticleContent from "./ArticleContent";
import { ArticleShareControls } from "./ArticleInteractions";
import type { CommentRecord } from "@/lib/comments/types";
import { localePath as buildLocalePath, type Locale } from "@/i18n/config";
import { formatTopicLabel } from "@/lib/utils/formatTopic";
import { formatReadTime } from "@/lib/utils/formatReadTime";

interface ArticleClientProps {
  post: Post;
  author: Author;
  headings: TocHeading[];
  relatedPosts: Post[];
  prevPost?: Post | null;
  nextPost?: Post | null;
  groupTitle?: string;
  initialComments?: CommentRecord[];
  language: Locale;
  assetBase?: string;
  content: string;
  contentKey: string;
  legacyAssetOrigins?: string[];
}

function formatPostDate(value: string, language: string) {
  if (!value) return "Unpublished";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArticleClient({
  post,
  author,
  headings,
  relatedPosts,
  prevPost,
  nextPost,
  groupTitle,
  initialComments = [],
  language,
  assetBase,
  content,
  contentKey,
  legacyAssetOrigins,
}: ArticleClientProps) {
  const localePath = (pathname: string) => buildLocalePath(language, pathname);
  const effectiveGroupTitle =
    groupTitle ||
    post.series?.title ||
    formatTopicLabel(post.category || "DevOps");

  return (
    <div className="theme-page w-full overflow-x-clip py-8 sm:py-10">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6">
        {/* Draft Preview Banner */}
        {post.status === "draft" && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="flex items-center gap-2.5 text-sm font-bold">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>DRAFT — PREVIEW MODE</span>
            </div>
            <span className="text-xs font-semibold opacity-80">
              Not published yet
            </span>
          </div>
        )}

        {/* The article owns the centered track; the TOC uses only the right track. */}
        <div className="grid min-w-0 gap-y-8 2xl:grid-cols-[minmax(0,1fr)_minmax(0,56.25rem)_minmax(0,1fr)]">
          
          {/* Left Column: Back button, author details & share */}
          <div className="order-2 space-y-8 lg:hidden">
            {/* Back to Blog */}
            <Link
              href={localePath("/blog")}
              className="group inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border theme-border bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-teal-500 hover:text-slate-950 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 transition duration-200 group-hover:-translate-x-1" />
              Back to blog
            </Link>

            {/* Author Card */}
            <div className="theme-card rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-4">
                <AuthorAvatar author={author} post={post} className="h-10 w-10" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    {author.name}
                  </h4>
                  <p className="mt-0.5 text-[10px] font-medium text-teal-700 dark:text-emerald-300">
                    {author.role_en || author.role}
                  </p>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 mb-4">
                {author.description_en || author.description}
              </p>
              
              {/* Author socials */}
              {(author.linkedin || author.github) && (
                <div className="flex gap-2.5 border-t theme-border pt-3">
                  {author.linkedin && (
                    <a
                      href={author.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${author.name} LinkedIn`}
                      className="grid h-9 w-9 place-items-center rounded-lg border theme-border text-gray-400 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                  )}
                  {author.github && (
                    <a
                      href={author.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${author.name} GitHub`}
                      className="grid h-9 w-9 place-items-center rounded-lg border theme-border text-gray-400 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Share Post */}
            <ArticleShareControls
              copiedLabel="Copied!"
              copyLabel="Copy Link"
              shareLabel="Share this post"
              twitterLabel="Share on Twitter"
            />
          </div>

          {/* Center Column: Main Content */}
          <div className="order-1 mx-auto min-w-0 w-full max-w-[56.25rem] space-y-8 2xl:col-start-2 2xl:row-start-1">
            {/* Header info */}
            <header className="article-reading-frame space-y-5">
              <h1 className="article-title break-words text-balance text-[clamp(1.75rem,3vw,2.75rem)] font-extrabold leading-[1.1] tracking-[-0.025em] text-slate-950 dark:text-white">
                {post.title}
              </h1>
              
              {/* Post Metadata row */}
              <div className="flex flex-col gap-4 border-y theme-border py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <AuthorAvatar author={author} post={post} className="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-950 dark:text-white">
                      {post.authorName || author.name}
                    </p>
                    <p className="text-xs theme-muted">
                      {author.role_en || author.role}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatPostDate(post.date, language)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatReadTime(post.readTime)}
                  </span>
                </div>
              </div>
            </header>

            <div className="article-reading-frame relative aspect-[2/1] overflow-hidden rounded-2xl border theme-border bg-slate-100 shadow-sm dark:bg-slate-900">
              {post.heroImage?.src || post.seo.ogImage ? (
                <CustomImage
                  src={post.heroImage?.src || post.seo.ogImage}
                  alt={post.heroImage?.alt || post.title}
                  fill
                  preload
                  sizes="(min-width: 1280px) 900px, (min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)"
                  className={post.heroImage?.fit === "contain" ? "object-contain" : "object-cover"}
                  style={{
                    objectPosition: post.heroImage?.focalPoint
                      ? `${post.heroImage.focalPoint.x}% ${post.heroImage.focalPoint.y}%`
                      : "50% 50%",
                  }}
                />
              ) : (
                <CustomImage
                  src="/images/linuxunity-placeholder.svg"
                  alt=""
                  fill
                  preload
                  sizes="(min-width: 1280px) 900px, (min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)"
                  className="object-contain opacity-90"
                />
              )}
            </div>

            <MobileTableOfContents
              headings={headings}
              title="Table of Contents"
              emptyLabel="No table of contents for this post."
            />

            {/* Serialized content renders atomically inside one client island. */}
            <ArticleContent
              assetBase={assetBase}
              content={content}
              contentKey={contentKey}
              language={language}
              legacyAssetOrigins={legacyAssetOrigins}
            />

            {/* Chapter Navigation (Previous / Next Chapter) */}
            {(prevPost || nextPost) && (
              <nav aria-label="Chapter navigation" className="article-reading-frame pt-10">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {prevPost ? (
                    <Link
                      href={localePath(`/blog/${prevPost.slug}`)}
                      className="group flex flex-col justify-between rounded-xl border theme-border bg-white p-4 sm:p-5 shadow-xs transition hover:border-teal-500 hover:shadow-md dark:bg-slate-900 dark:hover:border-emerald-400"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 transition duration-200 group-hover:-translate-x-1 dark:text-emerald-400">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        PREVIOUS
                      </span>
                      <h3 className="mt-2 line-clamp-2 text-base font-bold text-slate-900 transition group-hover:text-teal-700 dark:text-white dark:group-hover:text-emerald-300">
                        {prevPost.title}
                      </h3>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextPost ? (
                    <Link
                      href={localePath(`/blog/${nextPost.slug}`)}
                      className={`group flex flex-col justify-between rounded-xl border theme-border bg-white p-4 sm:p-5 shadow-xs transition hover:border-teal-500 hover:shadow-md dark:bg-slate-900 dark:hover:border-emerald-400 text-right ${
                        !prevPost ? "sm:col-start-2" : ""
                      }`}
                    >
                      <span className="flex items-center justify-end gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 transition duration-200 group-hover:translate-x-1 dark:text-emerald-400">
                        NEXT
                        <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                      </span>
                      <h3 className="mt-2 line-clamp-2 text-base font-bold text-slate-900 transition group-hover:text-teal-700 dark:text-white dark:group-hover:text-emerald-300">
                        {nextPost.title}
                      </h3>
                    </Link>
                  ) : null}
                </div>
              </nav>
            )}

            {relatedPosts.length > 0 && (
              <section className="article-reading-frame pt-10">
                <div className="mb-4 border-b theme-border pb-3">
                  <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                    {`More in ${effectiveGroupTitle}`}
                  </h2>
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
                <div className="mt-6 border-t theme-border pt-4">
                  <Link
                    href={localePath("/blog")}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition hover:text-teal-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to all posts
                  </Link>
                </div>
              </section>
            )}

            <div className="article-reading-frame">
              <Comments postSlug={post.slug} initialComments={initialComments} />
            </div>
          </div>

          <TableOfContents
            headings={headings}
            title="Table of Contents"
            emptyLabel="No table of contents for this post."
          />

        </div>
      </div>
    </div>
  );
}
