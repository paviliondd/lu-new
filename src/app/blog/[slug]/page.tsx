import { notFound, redirect } from "next/navigation";
import { getCmsPostBySlug } from "@/lib/cms/payload";
import { defaultLocale, localePath } from "@/i18n/config";
import BlogPostPage from "@/app/[lang]/blog/[slug]/page";

export const dynamic = "force-dynamic";

interface LegacyBlogRouteProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}

export default async function LegacyBlogPostRoute({
  params,
  searchParams,
}: LegacyBlogRouteProps) {
  const { slug } = await params;
  const query = await searchParams;
  const isPreview = query?.preview === "true";

  const viPost = await getCmsPostBySlug(slug, defaultLocale, isPreview);
  if (viPost) {
    return <BlogPostPage params={Promise.resolve({ lang: defaultLocale, slug: viPost.slug })} searchParams={searchParams} />;
  }

  const enPost = await getCmsPostBySlug(slug, "en", isPreview);
  if (enPost) {
    const previewSuffix = isPreview ? "?preview=true" : "";
    redirect(`${localePath("en", `/blog/${enPost.slug}`)}${previewSuffix}`);
  }

  notFound();
}
