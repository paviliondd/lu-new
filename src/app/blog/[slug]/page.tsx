import { notFound, redirect } from "next/navigation";
import { getCmsPostBySlug } from "@/lib/cms/payload";
import { defaultLocale, localePath } from "@/i18n/config";
import BlogPostPage from "@/app/[lang]/blog/[slug]/page";

export const dynamic = "force-dynamic";

interface LegacyBlogRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyBlogPostRoute({
  params,
}: LegacyBlogRouteProps) {
  const { slug } = await params;

  const viPost = await getCmsPostBySlug(slug, defaultLocale);
  if (viPost) {
    return <BlogPostPage params={Promise.resolve({ lang: defaultLocale, slug: viPost.slug })} />;
  }

  const enPost = await getCmsPostBySlug(slug, "en");
  if (enPost) {
    redirect(localePath("en", `/blog/${enPost.slug}`));
  }

  notFound();
}
