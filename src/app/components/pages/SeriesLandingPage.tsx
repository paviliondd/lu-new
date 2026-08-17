import Link from "next/link";
import { ArrowRight, Check, ChevronLeft, Layers, LockKeyhole } from "lucide-react";
import type { Post, Series } from "@/app/data";
import CustomImage from "@/app/components/CustomImage";
import RichTextRenderer from "@/app/components/RichTextRenderer";
import { getCodeBlockLabels } from "@/app/components/CodeBlock/labels";
import { localePath, type Locale } from "@/i18n/config";

interface SeriesLandingPageProps {
  locale: Locale;
  posts: Post[];
  preview?: boolean;
  series: Series;
}

export default function SeriesLandingPage({
  locale,
  posts,
  preview = false,
  series,
}: SeriesLandingPageProps) {
  const isVi = locale === "vi";
  const title = isVi ? series.title : series.title_en || series.title;
  const description = isVi
    ? series.description
    : series.description_en || series.description;
  const introduction = isVi
    ? series.introduction || ""
    : series.introduction_en || series.introduction || "";
  const learningPoints = isVi
    ? series.learningPoints || []
    : series.learningPoints_en?.length
      ? series.learningPoints_en
      : series.learningPoints || [];

  return (
    <main className="theme-page min-h-screen overflow-x-clip">
      {preview && (
        <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          <div className="mx-auto flex max-w-[56.25rem] items-center gap-2 text-sm font-semibold">
            <LockKeyhole className="h-4 w-4 shrink-0" />
            {isVi
              ? "Bản xem trước staging: series và chapter nháp chưa xuất hiện ở website public."
              : "Staging preview: draft series and chapters are not visible on the public website."}
          </div>
        </div>
      )}

      <section className="border-b theme-border theme-surface">
        <div className="mx-auto max-w-[56.25rem] px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href={localePath(locale, "/blog/series")}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border theme-border bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-teal-500 hover:text-slate-950 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            {isVi ? "Tất cả series" : "All series"}
          </Link>

          {series.coverImage?.src ? (
            <div className="relative mt-8 aspect-[16/7] overflow-hidden rounded-2xl border theme-border bg-slate-100 shadow-sm dark:bg-slate-900">
              <CustomImage
                src={series.coverImage.src}
                alt={series.coverImage.alt || title}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 900px"
                className="object-cover"
                style={{
                  objectFit: series.coverImage.fit,
                  objectPosition: series.coverImage.focalPoint
                    ? `${series.coverImage.focalPoint.x}% ${series.coverImage.focalPoint.y}%`
                    : "center",
                }}
              />
            </div>
          ) : (
            <div
              className="mt-8 flex aspect-[16/6] items-center justify-center rounded-2xl border theme-border shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${series.color || "#0f766e"}, #0f172a)`,
              }}
            >
              <Layers className="h-16 w-16 text-white/85" aria-hidden="true" />
            </div>
          )}

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-emerald-300">
            LinuxUnity DevOps Series
          </p>
          <h1 className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="theme-muted mt-4 max-w-3xl text-lg leading-8">{description}</p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-[56.25rem] space-y-12 px-4 py-12 sm:px-6 sm:py-16">
        {introduction && (
          <section aria-labelledby="series-introduction-title">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-emerald-300">
              {isVi ? "Giới thiệu" : "Introduction"}
            </p>
            <h2 id="series-introduction-title" className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {isVi ? "Về series này" : "About this series"}
            </h2>
            <div className="article-content article-content--reading prose mt-6 max-w-none">
              <RichTextRenderer
                content={introduction}
                contentKey={`series-${series.slug}-${locale}`}
                labels={getCodeBlockLabels(locale)}
              />
            </div>
          </section>
        )}

        {learningPoints.length > 0 && (
          <section aria-labelledby="series-learning-title">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-emerald-300">
              {isVi ? "Mục tiêu" : "Outcomes"}
            </p>
            <h2 id="series-learning-title" className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {isVi ? "Bạn sẽ học được gì?" : "What will you learn?"}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {learningPoints.map((point) => (
                <li key={point} className="theme-card flex gap-3 rounded-xl border p-4 leading-7">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="series-chapters-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-emerald-300">
                {isVi ? "Nội dung series" : "Series content"}
              </p>
              <h2 id="series-chapters-title" className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {posts.length} {isVi ? "chapter" : posts.length === 1 ? "chapter" : "chapters"}
              </h2>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="theme-card mt-6 rounded-xl border border-dashed px-6 py-14 text-center theme-muted">
              {isVi
                ? "Các chapter đang được biên tập. Hãy thêm bài viết vào series trong Payload Admin."
                : "Chapters are being edited. Add posts to this series in Payload Admin."}
            </div>
          ) : (
            <ol className="mt-6 overflow-hidden rounded-2xl border theme-border theme-surface">
              {posts.map((post, index) => {
                const chapterOrder = post.chapterOrder ?? index + 1;
                const isDraft = post.status === "draft";
                const href = `${localePath(locale, `/blog/${post.slug}`)}${preview && isDraft ? "?preview=true" : ""}`;

                return (
                  <li key={post.slug} className="border-b theme-border last:border-b-0">
                    <Link
                      href={href}
                      className="group grid gap-3 px-4 py-5 transition hover:bg-slate-50 sm:grid-cols-[7rem_1fr_auto] sm:items-center sm:px-6 dark:hover:bg-slate-900/70"
                    >
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-emerald-300">
                        {isVi ? "Chapter" : "Chapter"} {String(chapterOrder).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block break-words font-semibold leading-6 text-slate-950 group-hover:text-teal-700 dark:text-white dark:group-hover:text-emerald-300">
                          {post.title}
                        </span>
                        <span className="theme-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          {post.readTime && <span>{post.readTime}</span>}
                          {isDraft && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                              {isVi ? "Bản nháp" : "Draft"}
                            </span>
                          )}
                        </span>
                      </span>
                      <ArrowRight className="hidden h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-600 sm:block dark:group-hover:text-emerald-300" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
