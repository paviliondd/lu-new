import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeriesListPage from "@/app/components/pages/SeriesListPage";
import { hasLocale } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/metadata";
import { getCmsPublishedPosts } from "@/lib/cms/payload";

export const dynamic = "force-dynamic";

interface SeriesRouteProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: SeriesRouteProps): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};

  return localizedMetadata(
    lang,
    "/blog/series",
    "LinuxUnity DevOps Series",
    lang === "vi"
      ? "Các series bài viết DevOps chuyên sâu của LinuxUnity."
      : "LinuxUnity's in-depth DevOps article series."
  );
}

export default async function SeriesRoute({ params }: SeriesRouteProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const posts = await getCmsPublishedPosts(lang);
  return <SeriesListPage initialPosts={posts} />;
}
