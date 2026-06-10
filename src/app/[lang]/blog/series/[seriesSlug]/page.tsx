import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { notFound } from "next/navigation";
import { series, team } from "@/app/data";
import { getCmsPublishedPosts } from "@/lib/cms/wordpress";
import { hasLocale, localePath } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/metadata";

interface SeriesDetailProps {
  params: Promise<{ lang: string; seriesSlug: string }>;
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

export default async function SeriesDetailPage({ params }: SeriesDetailProps) {
  const { lang, seriesSlug } = await params;
  if (!hasLocale(lang)) notFound();

  const selectedSeries = series.find((item) => item.slug === seriesSlug);
  if (!selectedSeries) notFound();

  const posts = (await getCmsPublishedPosts(lang))
    .filter((post) => post.seriesSlug === seriesSlug)
    .sort((a, b) => a.roadmapOrder - b.roadmapOrder);
  const title = lang === "vi" ? selectedSeries.title : selectedSeries.title_en;
  const description =
    lang === "vi" ? selectedSeries.description : selectedSeries.description_en;

  return (
    <div className="min-h-screen bg-white py-14 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4">
        <Link
          href={localePath(lang, "/blog/series")}
          className="text-sm font-semibold text-cyan-700 hover:text-blue-700 dark:text-cyan-300"
        >
          ← {lang === "vi" ? "Tất cả chuyên đề" : "All series"}
        </Link>

        <div className="mt-8 rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50 p-8 dark:border-cyan-950 dark:from-cyan-950/30 dark:to-blue-950/20 sm:p-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <Layers className="h-6 w-6" />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
            LinuxUnity DevOps Series
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {lang === "vi"
                ? "Các bài viết trong chuyên đề đang được biên tập."
                : "Articles in this series are currently being edited."}
            </div>
          ) : (
            posts.map((post, index) => (
              <Link
                key={post.slug}
                href={localePath(lang, `/blog/${post.slug}`)}
                className="group flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/10 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-cyan-800"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-sm font-bold text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-gray-950 group-hover:text-cyan-700 dark:text-white dark:group-hover:text-cyan-300">
                    {post.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {post.description}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {team[post.author]?.name || "LinuxUnity"} · {post.readTime}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-cyan-600" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
