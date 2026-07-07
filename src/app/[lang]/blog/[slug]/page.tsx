import { notFound } from "next/navigation";
import { Metadata } from "next";
import { team } from "@/app/data";
import ArticleClient from "@/app/components/ArticleClient";
import {
  getCmsPostBySlug,
  getCmsPublishedPosts,
} from "@/lib/cms/payload";
import { highlightCodeBlocks } from "@/lib/content/highlight";
import { hasLocale } from "@/i18n/config";
import { localizedAlternates } from "@/i18n/metadata";
import { localePath } from "@/i18n/config";
import { siteUrl } from "@/i18n/metadata";
import { load } from "cheerio";

export const revalidate = 60;
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
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

function prepareArticleContent(content: string) {
  const $ = load(content, null, false);
  const headings: Array<{ id: string; text: string; level: 2 | 3 }> = [];
  const seenIds = new Set<string>();

  $("h2, h3").each((index, element) => {
    const heading = $(element);
    const text = heading.text().replace(/\s+/g, " ").trim();
    if (!text) return;

    const baseId = heading.attr("id") || slugifyHeading(text, index);
    let id = baseId;
    let duplicate = 2;
    while (seenIds.has(id)) {
      id = `${baseId}-${duplicate}`;
      duplicate += 1;
    }
    seenIds.add(id);
    heading.attr("id", id);

    headings.push({
      id,
      text,
      level: element.tagName.toLowerCase() === "h3" ? 3 : 2,
    });
  });

  return { html: $.html(), headings };
}

function publicAssetBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
}

function legacyAssetOrigins() {
  return [
    ...(process.env.IMAGE_REMOTE_HOSTS || "").split(","),
  ]
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
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
  const preparedContent = prepareArticleContent(highlightedContent);
  const localizedPost = { ...post, content: preparedContent.html };
  const headings = preparedContent.headings;
  const relatedPosts = (await getCmsPublishedPosts(lang))
    .filter((item) => item.slug !== post.slug && item.category === post.category)
    .slice(0, 3);
  const assetBase = publicAssetBase();
  const externalAssetOrigins = legacyAssetOrigins();
  const canonicalUrl = `${siteUrl}${localePath(lang, `/blog/${post.slug}`)}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.seo.ogImage ? [post.seo.ogImage] : undefined,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.authorName || author.name,
      image: post.authorAvatar || author.avatarUrl || undefined,
    },
    mainEntityOfPage: canonicalUrl,
    commentCount: 0,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: lang === "vi" ? "Trang chủ" : "Home",
        item: `${siteUrl}${localePath(lang, "/")}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteUrl}${localePath(lang, "/blog")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ArticleClient
        post={localizedPost}
        author={author}
        headings={headings}
        relatedPosts={relatedPosts}
        assetBase={assetBase}
        legacyAssetOrigins={externalAssetOrigins}
      />
    </>
  );
}
