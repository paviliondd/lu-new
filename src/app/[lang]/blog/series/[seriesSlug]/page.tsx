import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Layers } from "lucide-react";
import { notFound } from "next/navigation";
import { series, team } from "@/app/data";
import PostCard from "@/app/components/PostCard";
import { getCmsPublishedPosts } from "@/lib/cms/payload";
import { hasLocale, localePath } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/metadata";

const POSTS_PER_PAGE = 6;

export const dynamic = "force-dynamic";

interface SeriesDetailProps {
  params: Promise<{ lang: string; seriesSlug: string }>;
  searchParams?: Promise<{ page?: string }>;
}

function parsePage(value: string | undefined) {
  const parsed = Number(value || "1");
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function pageHref(lang: "vi" | "en", seriesSlug: string, page: number) {
  const basePath = localePath(lang, `/blog/series/${seriesSlug}`);
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

function postTime(value: string) {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

export async function generateMetadata({
  params,
}: SeriesDetailProps): Promise<Metadata> {
  const { lang, seriesSlug } = await params;
  if (!hasLocale(lang)) return {};

  const selectedSeries = series.find((item) => item.slug === seriesSlug);
  if (!selectedSeries) return {};

  const title = lang === "vi" ? selectedSeries.title : selectedSeries.title_en;
  const description =
    lang === "vi" ? selectedSeries.description : selectedSeries.description_en;

  return localizedMetadata(lang, `/blog/series/${seriesSlug}`, title, description);
}

export default async function SeriesDetailPage({
  params,
  searchParams,
}: SeriesDetailProps) {
  const { lang, seriesSlug } = await params;
  if (!hasLocale(lang)) notFound();

  const selectedSeries = series.find((item) => item.slug === seriesSlug);
  if (!selectedSeries) notFound();

  const requestedPage = parsePage((await searchParams)?.page);
  const posts = (await getCmsPublishedPosts(lang))
    .filter((post) => post.seriesSlug === seriesSlug)
    .sort((a, b) => {
      const dateDiff = postTime(b.date) - postTime(a.date);
      return dateDiff || b.roadmapOrder - a.roadmapOrder;
    });
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );
  const title = lang === "vi" ? selectedSeries.title : selectedSeries.title_en;
  const description =
    lang === "vi" ? selectedSeries.description : selectedSeries.description_en;

  return (
    <div className="theme-page min-h-screen overflow-x-clip">
      <section className="theme-surface border-b theme-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:py-16">
          <Link
            href={localePath(lang, "/blog/series")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-emerald-300"
          >
            <ChevronLeft className="h-4 w-4" />
            {lang === "vi" ? "Tất cả series" : "All series"}
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950">
              <Layers className="h-6 w-6" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              LinuxUnity DevOps Series
            </p>
            <h1 className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              {title}
            </h1>
            <p className="theme-muted mt-4 max-w-3xl leading-7">{description}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:py-14">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              {lang === "vi" ? "Bài viết mới nhất" : "Latest posts"}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              {posts.length} {lang === "vi" ? "bài viết" : "posts"}
            </h2>
          </div>
          {totalPages > 1 && (
            <p className="text-sm theme-muted">
              {lang === "vi" ? "Trang" : "Page"} {currentPage}/{totalPages}
            </p>
          )}
        </div>

        {paginatedPosts.length === 0 ? (
          <div className="theme-card rounded-2xl border border-dashed py-20 text-center">
            <p className="text-sm theme-muted">
              {lang === "vi"
                ? "Các bài viết trong series này đang được biên tập."
                : "Articles in this series are currently being edited."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedPosts.map((post, index) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  author={team[post.author]}
                  locale={lang}
                  featured={index === 0 && paginatedPosts.length > 3}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
                aria-label={lang === "vi" ? "Phân trang series" : "Series pagination"}
              >
                <PaginationLink
                  href={pageHref(lang, seriesSlug, currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {lang === "vi" ? "← Trước" : "← Prev"}
                </PaginationLink>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <PaginationLink
                    key={page}
                    href={pageHref(lang, seriesSlug, page)}
                    active={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                ))}
                <PaginationLink
                  href={pageHref(lang, seriesSlug, currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {lang === "vi" ? "Sau →" : "Next →"}
                </PaginationLink>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function PaginationLink({
  href,
  active = false,
  disabled = false,
  children,
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-10 min-w-10 cursor-not-allowed items-center justify-center rounded-lg bg-slate-500 px-3 text-sm font-semibold text-slate-900 opacity-70 sm:px-4">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white sm:px-4"
          : "inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-100 sm:px-4"
      }
    >
      {children}
    </Link>
  );
}
