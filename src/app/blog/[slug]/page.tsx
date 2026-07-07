import { notFound, redirect } from "next/navigation";
import { getCmsPostBySlug } from "@/lib/cms/payload";
import { defaultLocale, localePath, locales } from "@/i18n/config";

export const dynamic = "force-dynamic";

interface LegacyBlogRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyBlogPostRoute({
  params,
}: LegacyBlogRouteProps) {
  const { slug } = await params;

  for (const locale of locales) {
    const post = await getCmsPostBySlug(slug, locale);
    if (post) {
      redirect(localePath(locale, `/blog/${post.slug}`));
    }
  }

  const fallbackPost = await getCmsPostBySlug(slug, defaultLocale);
  if (fallbackPost) {
    redirect(localePath(defaultLocale, `/blog/${fallbackPost.slug}`));
  }

  notFound();
}
