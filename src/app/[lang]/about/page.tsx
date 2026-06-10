import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AboutPage from "@/app/components/pages/AboutPage";
import { hasLocale } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/metadata";

interface AboutRouteProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: AboutRouteProps): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};

  return localizedMetadata(
    lang,
    "/about",
    lang === "vi" ? "Giới thiệu LinuxUnity" : "About LinuxUnity",
    lang === "vi"
      ? "Sứ mệnh và các chủ đề kỹ thuật trọng tâm của LinuxUnity."
      : "LinuxUnity's mission and core engineering topics."
  );
}

export default async function AboutRoute({ params }: AboutRouteProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <AboutPage />;
}
