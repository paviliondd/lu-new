import { notFound } from "next/navigation";
import { Metadata } from "next";
import { team } from "@/app/data";
import ArticleClient from "@/app/components/ArticleClient";
import {
  getCmsPostBySlug,
  getCmsPublishedPosts,
} from "@/lib/cms/wordpress";
import { highlightCodeBlocks } from "@/lib/content/highlight";
import { hasLocale } from "@/i18n/config";
import { localizedAlternates } from "@/i18n/metadata";

export const revalidate = 60;

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function slugifyHeading(text: string, index: number) {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || `heading-${index}`
  );
}

function extractHeadings(content: string) {
  const headings: Array<{ id: string; text: string; level: 2 | 3 }> = [];
  const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const text = stripHtml(match[2]);
    if (!text) continue;

    headings.push({
      id: slugifyHeading(text, headings.length),
      text,
      level: Number(match[1]) as 2 | 3,
    });
  }

  return headings;
}

// Generate metadata dynamically for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};

  const post = await getCmsPostBySlug(slug, lang);
  if (!post) return {};

  return {
    title: post.seo.title || post.title,
    description: post.seo.description || post.description,
    alternates: localizedAlternates(lang, `/blog/${slug}`),
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [team[post.author]?.name || ""],
      tags: post.tags,
      locale: lang === "vi" ? "vi_VN" : "en_US",
      alternateLocale: lang === "vi" ? ["en_US"] : ["vi_VN"],
      images: post.seo.ogImage ? [post.seo.ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();

  const post = await getCmsPostBySlug(slug, lang);
  
  if (!post) {
    notFound();
  }

  const author = team[post.author] || team.nhatnghia;
  const highlightedContent = await highlightCodeBlocks(post.content);
  const localizedPost = { ...post, content: highlightedContent };
  const headings = extractHeadings(highlightedContent);
  const relatedPosts = (await getCmsPublishedPosts(lang))
    .filter((item) => item.slug !== post.slug && item.category === post.category)
    .slice(0, 3);
  const assetBase =
    process.env.WORDPRESS_SITE_URL ||
    process.env.WORDPRESS_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";

  return (
    <ArticleClient
      post={localizedPost}
      author={author}
      headings={headings}
      relatedPosts={relatedPosts}
      assetBase={assetBase}
    />
  );
}
