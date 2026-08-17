import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeriesLandingPage from "@/app/components/pages/SeriesLandingPage";
import { hasLocale } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/metadata";
import { getCmsSeriesBySlug, getCmsSeriesPosts } from "@/lib/cms/payload";

export const dynamic = "force-dynamic";

interface SeriesDetailProps {
  params: Promise<{ lang: string; seriesSlug: string }>;
}

export async function generateMetadata({ params }: SeriesDetailProps): Promise<Metadata> {
  const { lang, seriesSlug } = await params;
  if (!hasLocale(lang)) return {};

  const selectedSeries = await getCmsSeriesBySlug(seriesSlug, lang);
  if (!selectedSeries) return {};

  const title = lang === "vi" ? selectedSeries.title : selectedSeries.title_en;
  const description = lang === "vi"
    ? selectedSeries.description
    : selectedSeries.description_en;

  return localizedMetadata(lang, `/blog/series/${seriesSlug}`, title, description);
}

export default async function SeriesDetailPage({ params }: SeriesDetailProps) {
  const { lang, seriesSlug } = await params;
  if (!hasLocale(lang)) notFound();

  const [selectedSeries, posts] = await Promise.all([
    getCmsSeriesBySlug(seriesSlug, lang),
    getCmsSeriesPosts(seriesSlug, lang),
  ]);
  if (!selectedSeries) notFound();

  return <SeriesLandingPage locale={lang} posts={posts} series={selectedSeries} />;
}