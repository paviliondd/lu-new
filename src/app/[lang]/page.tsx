import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePage from "@/app/components/pages/HomePage";
import { hasLocale } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/metadata";
import { getCmsPublishedPosts, getCmsSeries } from "@/lib/cms/payload";

export const dynamic = "force-dynamic";

interface HomeRouteProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: HomeRouteProps): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};

  return localizedMetadata(
    lang,
    "/",
    "LinuxUnity — Explore, Build, Share",
    lang === "vi"
      ? "Hướng dẫn Linux, Cloud và DevOps thực chiến cho kỹ sư hạ tầng hiện đại."
      : "Practical Linux, Cloud, and DevOps guides for modern infrastructure engineers."
  );
}

export default async function HomeRoute({ params }: HomeRouteProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [posts, seriesItems] = await Promise.all([getCmsPublishedPosts(lang, 6), getCmsSeries(lang, 3)]);
  return <HomePage initialPosts={posts} seriesItems={seriesItems} />;
}
