import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeriesLandingPage from "@/app/components/pages/SeriesLandingPage";
import { hasLocale } from "@/i18n/config";
import { getCmsSeriesBySlug, getCmsSeriesPosts } from "@/lib/cms/payload";
import { canPreviewPayloadDraft } from "@/lib/cms/preview-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Series staging preview | LinuxUnity",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface SeriesPreviewProps {
  params: Promise<{ lang: string; seriesSlug: string }>;
}

export default async function SeriesPreviewPage({ params }: SeriesPreviewProps) {
  if (process.env.SERIES_PREVIEW_ENABLED !== "true") notFound();
  if (!(await canPreviewPayloadDraft())) notFound();

  const { lang, seriesSlug } = await params;
  if (!hasLocale(lang)) notFound();

  const [selectedSeries, posts] = await Promise.all([
    getCmsSeriesBySlug(seriesSlug, lang, true),
    getCmsSeriesPosts(seriesSlug, lang, true),
  ]);
  if (!selectedSeries) notFound();

  return (
    <SeriesLandingPage
      locale={lang}
      posts={posts}
      preview
      series={selectedSeries}
    />
  );
}
