import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogListPage from "@/app/components/pages/BlogListPage";
import { hasLocale } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/metadata";
import { getCmsPublishedPosts } from "@/lib/cms/payload";

export const dynamic = "force-dynamic";

interface BlogRouteProps {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ page?: string; tag?: string }>;
}

export async function generateMetadata({
  params,
}: BlogRouteProps): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};

  return localizedMetadata(
    lang,
    "/blog",
    lang === "vi" ? "Blog LinuxUnity" : "LinuxUnity Blog",
    lang === "vi"
      ? "Bài viết Linux, AWS, Kubernetes, Terraform và CI/CD theo lộ trình thực hành."
      : "Practical articles about Linux, AWS, Kubernetes, Terraform, and CI/CD."
  );
}

export default async function BlogRoute({ params, searchParams }: BlogRouteProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const query = await searchParams;
  const posts = await getCmsPublishedPosts(lang);
  return (
    <BlogListPage
      initialPosts={posts}
      initialPage={Math.max(1, Number(query?.page || 1))}
      initialTag={query?.tag || ""}
    />
  );
}
