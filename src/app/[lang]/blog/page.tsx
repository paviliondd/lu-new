import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogListPage from "@/app/components/pages/BlogListPage";
import { hasLocale } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/metadata";
import { getCmsPublishedPosts } from "@/lib/cms/wordpress";

interface BlogRouteProps {
  params: Promise<{ lang: string }>;
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

export default async function BlogRoute({ params }: BlogRouteProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const posts = await getCmsPublishedPosts(lang);
  return <BlogListPage initialPosts={posts} />;
}
