import "server-only";

import config from "@payload-config";
import { marked } from "marked";
import { getPayload } from "payload";
import { allPosts, team, type Post } from "@/app/data";
import { localizePost, type Locale } from "@/i18n/config";
import { getLocalizedFilePost, getLocalizedFilePosts } from "@/lib/content/localized-posts";
import { sanitizeArticleHtml } from "@/lib/utils/security";
import { cachedJson } from "@/lib/server/redis-cache";
import { getLocalPostViews } from "@/lib/views/store";

type PayloadDoc = Record<string, unknown>;

function canUsePayload() {
  return Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
}

async function getPayloadClient() {
  if (!canUsePayload()) return null;

  try {
    return await getPayload({ config });
  } catch (error) {
    console.error("Unable to initialize Payload", { error });
    return null;
  }
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function arrayValues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "value" in item) return String(item.value || "");
      return "";
    })
    .map((item) => item.trim())
    .filter(Boolean);
}

function relationDoc(value: unknown): PayloadDoc | null {
  return value && typeof value === "object" ? (value as PayloadDoc) : null;
}

function mediaUrl(value: unknown): string | null {
  const doc = relationDoc(value);
  if (!doc) return null;

  const sizes = relationDoc(doc.sizes);
  const sized = relationDoc(sizes?.og) || relationDoc(sizes?.card);
  return asString(sized?.url) || asString(doc.url) || null;
}

async function renderContent(value: unknown) {
  const source = asString(value);
  if (!source) return "";

  const html = /^\s*</.test(source) ? source : await marked.parse(source, { gfm: true });
  return sanitizeArticleHtml(html);
}

function estimateReadTime(content: string, locale: Locale) {
  const wordCount = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return locale === "vi" ? `${minutes} phút đọc` : `${minutes} min read`;
}

function fallbackBase(slug: string): Post | null {
  return allPosts.find((post) => post.slug === slug) || null;
}

async function mapPayloadPost(doc: PayloadDoc, locale: Locale): Promise<Post> {
  const slug = asString(doc.slug);
  const fallback = fallbackBase(slug);
  const author = relationDoc(doc.author);
  const series = relationDoc(doc.series);
  const seo = relationDoc(doc.seo);
  const coverImage = mediaUrl(doc.coverImage);
  const seoImage = mediaUrl(seo?.ogImage) || coverImage;
  const contentVi = await renderContent(doc.contentVi);
  const contentEn = await renderContent(doc.contentEn || doc.contentVi);
  const publishedAt = asString(doc.publishedAt) || asString(doc.createdAt) || new Date().toISOString();
  const authorSlug = asString(author?.slug, fallback?.author || "nhatnghia");
  const fallbackAuthor = team[authorSlug] || team.nhatnghia;
  const titleVi = asString(doc.titleVi, fallback?.title || slug);
  const titleEn = asString(doc.titleEn, titleVi);
  const descriptionVi = asString(doc.excerptVi, fallback?.description || "");
  const descriptionEn = asString(doc.excerptEn, descriptionVi);
  const seoTitleVi = asString(seo?.titleVi, titleVi);
  const seoTitleEn = asString(seo?.titleEn, titleEn);
  const seoDescriptionVi = asString(seo?.descriptionVi, descriptionVi);
  const seoDescriptionEn = asString(seo?.descriptionEn, descriptionEn);

  const post: Post = {
    ...(fallback || {
      id: asNumber(doc.id, Math.abs(Array.from(slug).reduce((hash, char) => hash * 31 + char.charCodeAt(0), 7))),
      roadmapId: 0,
      roadmapOrder: 0,
      slug,
      title: titleVi,
      title_en: titleEn,
      description: descriptionVi,
      description_en: descriptionEn,
      content: contentVi,
      content_en: contentEn,
      category: "Cloud",
      tags: [],
      author: authorSlug,
      status: "published",
      publishDate: publishedAt,
      publish_date: publishedAt,
      date: publishedAt,
      readTime: estimateReadTime(contentVi, "vi"),
      readTime_en: estimateReadTime(contentEn, "en"),
      views: 0,
      seriesSlug: null,
      topicSlug: "",
      clusterSlug: "",
      gradient: "from-slate-600/90 to-cyan-700/90",
      certs: [],
      services: [],
      examDomains: [],
      coverage: "",
      labs: [],
      costNote: "",
      cleanupNote: "",
      editorialNote: "",
      quiz: "",
      seo: {
        title: seoTitleVi,
        description: seoDescriptionVi,
        ogImage: seoImage,
      },
      internalLinking: {
        hubSlug: "",
        relatedServiceSlugs: [],
        examDomainSlugs: [],
      },
    }),
    id: asNumber(doc.id, fallback?.id || 0),
    roadmapId: asNumber(doc.roadmapId, fallback?.roadmapId || 0),
    roadmapOrder: asNumber(doc.roadmapOrder, fallback?.roadmapOrder || 0),
    slug,
    title: titleVi,
    title_en: titleEn,
    description: descriptionVi,
    description_en: descriptionEn,
    content: contentVi,
    content_en: contentEn,
    category: asString(doc.category, fallback?.category || "Cloud"),
    tags: arrayValues(doc.tags).length ? arrayValues(doc.tags) : fallback?.tags || [],
    author: authorSlug,
    authorName: asString(author?.name, fallback?.authorName || fallbackAuthor.name),
    authorAvatar: mediaUrl(author?.avatar) || fallback?.authorAvatar || fallbackAuthor.avatarUrl || null,
    authorDescription: asString(author?.descriptionVi, fallback?.authorDescription || fallbackAuthor.description),
    status: doc.status === "published" ? "published" : "draft",
    publishDate: publishedAt,
    publish_date: publishedAt,
    date: publishedAt,
    readTime: asString(doc.readTimeVi, fallback?.readTime || estimateReadTime(contentVi, "vi")),
    readTime_en: asString(doc.readTimeEn, fallback?.readTime_en || estimateReadTime(contentEn, "en")),
    views: Math.max(0, asNumber(doc.views, fallback?.views || 0)),
    seriesSlug: asString(series?.slug, fallback?.seriesSlug || "") || null,
    topicSlug: asString(doc.topicSlug, fallback?.topicSlug || ""),
    clusterSlug: asString(doc.clusterSlug, fallback?.clusterSlug || asString(series?.slug, "")),
    gradient: asString(doc.gradient, fallback?.gradient || "from-slate-600/90 to-cyan-700/90"),
    certs: arrayValues(doc.certs).length ? arrayValues(doc.certs) : fallback?.certs || [],
    services: arrayValues(doc.services).length ? arrayValues(doc.services) : fallback?.services || [],
    examDomains: arrayValues(doc.examDomains).length
      ? arrayValues(doc.examDomains)
      : fallback?.examDomains || [],
    coverage: asString(doc.coverage, fallback?.coverage || ""),
    labs: arrayValues(doc.labs).length ? arrayValues(doc.labs) : fallback?.labs || [],
    costNote: asString(doc.costNote, fallback?.costNote || ""),
    cleanupNote: asString(doc.cleanupNote, fallback?.cleanupNote || ""),
    editorialNote: asString(doc.editorialNote, fallback?.editorialNote || ""),
    quiz: asString(doc.quiz, fallback?.quiz || ""),
    seo: {
      title: seoTitleVi,
      description: seoDescriptionVi,
      ogImage: seoImage || fallback?.seo.ogImage || null,
    },
    internalLinking: {
      hubSlug: asString(doc.clusterSlug, fallback?.internalLinking.hubSlug || asString(series?.slug, "")),
      relatedServiceSlugs: fallback?.internalLinking.relatedServiceSlugs || [],
      examDomainSlugs: fallback?.internalLinking.examDomainSlugs || [],
    },
  };

  const localized = localizePost(post, locale);
  if (locale === "en") {
    return {
      ...localized,
      authorDescription: asString(author?.descriptionEn, localized.authorDescription || fallbackAuthor.description_en),
      seo: {
        title: seoTitleEn,
        description: seoDescriptionEn,
        ogImage: localized.seo.ogImage,
      },
    };
  }

  return localized;
}

function mergePosts(primary: Post[], fallback: Post[]) {
  const postsBySlug = new Map<string, Post>();
  for (const post of fallback) postsBySlug.set(post.slug, post);
  for (const post of primary) postsBySlug.set(post.slug, post);
  return Array.from(postsBySlug.values()).sort((left, right) => {
    const leftDate = new Date(left.date || 0).getTime();
    const rightDate = new Date(right.date || 0).getTime();
    return rightDate - leftDate;
  });
}

async function withLocalViews(posts: Post[]) {
  const localViews = await getLocalPostViews();
  return posts.map((post) => ({
    ...post,
    views: Math.max(post.views || 0, localViews[post.slug] || 0),
  }));
}

async function withLocalView(post: Post) {
  return (await withLocalViews([post]))[0];
}

export async function getPayloadPublishedPosts(locale: Locale = "vi"): Promise<Post[]> {
  return cachedJson(`posts:published:${locale}`, 300, async () => {
    const filePosts = await getLocalizedFilePosts(locale);
    const payload = await getPayloadClient();
    if (!payload) return withLocalViews(filePosts);

    try {
      const result = await payload.find({
        collection: "posts",
        depth: 2,
        limit: 100,
        sort: "-publishedAt",
        where: {
          status: {
            equals: "published",
          },
        },
      });
      const payloadPosts = await Promise.all(result.docs.map((doc) => mapPayloadPost(doc, locale)));
      return withLocalViews(mergePosts(payloadPosts, filePosts));
    } catch (error) {
      console.error("Unable to fetch Payload published posts", { locale, error });
      return withLocalViews(filePosts);
    }
  });
}

export const getCmsPublishedPosts = getPayloadPublishedPosts;

export async function getPayloadPostBySlug(slug: string, locale: Locale = "vi"): Promise<Post | null> {
  return cachedJson(`posts:detail:${locale}:${slug}`, 300, async () => {
    const filePost = await getLocalizedFilePost(slug, locale);
    const payload = await getPayloadClient();
    if (!payload) return filePost ? withLocalView(filePost) : null;

    try {
      const result = await payload.find({
        collection: "posts",
        depth: 2,
        limit: 1,
        where: {
          and: [
            {
              slug: {
                equals: slug,
              },
            },
            {
              status: {
                equals: "published",
              },
            },
          ],
        },
      });

      const doc = result.docs[0];
      if (!doc) return filePost ? withLocalView(filePost) : null;
      return withLocalView(await mapPayloadPost(doc, locale));
    } catch (error) {
      console.error("Unable to resolve Payload post by slug", { slug, locale, error });
      return filePost ? withLocalView(filePost) : null;
    }
  });
}

export const getCmsPostBySlug = getPayloadPostBySlug;

export async function incrementPayloadPostView(slug: string): Promise<number | null> {
  const payload = await getPayloadClient();
  if (!payload) return null;

  const result = await payload.find({
    collection: "posts",
    depth: 0,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  });
  const doc = result.docs[0] as PayloadDoc | undefined;
  if (!doc) return null;
  if (typeof doc.id !== "string" && typeof doc.id !== "number") return null;

  const views = Math.max(0, asNumber(doc.views)) + 1;
  await payload.update({
    collection: "posts",
    id: doc.id,
    data: { views },
  });

  return views;
}
