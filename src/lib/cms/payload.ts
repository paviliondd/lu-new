import "server-only";

import crypto from "node:crypto";
import config from "@payload-config";
import { marked } from "marked";
import { getPayload, type Where } from "payload";
import { FilterXSS } from "xss";
import { allPosts, series as fileSeries, team, type Post, type Series } from "@/app/data";
import { localizePost, type Locale } from "@/i18n/config";
import { getLocalizedFilePost, getLocalizedFilePosts } from "@/lib/content/localized-posts";
import { sanitizeArticleHtml } from "@/lib/utils/security";
import { cachedJson } from "@/lib/server/redis-cache";
import { getLocalPostViews } from "@/lib/views/store";
import type { CommentRecord } from "@/lib/comments/types";
import type { AuthUser } from "@/lib/auth/session";

type PayloadDoc = Record<string, unknown>;

function asPayloadDoc(value: unknown): PayloadDoc {
  return value && typeof value === "object" ? (value as PayloadDoc) : {};
}

const commentFilter = new FilterXSS({
  whiteList: {
    a: ["href", "title", "target", "rel"],
    blockquote: [],
    br: [],
    code: [],
    em: [],
    li: [],
    ol: [],
    p: [],
    pre: [],
    strong: [],
    ul: [],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed"],
});

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

function mapPayloadSeries(doc: PayloadDoc): Series {
  const slug = asString(doc.slug);
  const titleVi = asString(doc.titleVi, slug);
  const descriptionVi = asString(doc.descriptionVi);

  return {
    slug,
    title: titleVi,
    title_en: asString(doc.titleEn, titleVi),
    description: descriptionVi,
    description_en: asString(doc.descriptionEn, descriptionVi),
    icon: asString(doc.icon, "layers"),
    partsCount: 0,
    tag: asString(doc.tag),
    color: asString(doc.color, "#2563eb"),
  };
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
    series: series
      ? {
          slug: asString(series.slug),
          title: asString(series.titleVi),
          title_en: asString(series.titleEn, asString(series.titleVi)),
        }
      : null,
    thumbnail: seoImage || coverImage || fallback?.seo.ogImage || null,
    comments: [],
    commentCount: 0,
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

function mergeSeries(primary: Series[], fallback: Series[]) {
  const seriesBySlug = new Map<string, Series>();
  for (const item of fallback) seriesBySlug.set(item.slug, item);
  for (const item of primary) {
    const current = seriesBySlug.get(item.slug);
    seriesBySlug.set(item.slug, {
      ...(current || item),
      ...item,
      partsCount: current?.partsCount || item.partsCount || 0,
    });
  }
  return Array.from(seriesBySlug.values());
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

async function getPayloadPublishedPosts(locale: Locale = "vi"): Promise<Post[]> {
  return cachedJson(`posts:published:${locale}`, 30, async () => {
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
      const payloadPosts = await Promise.all(result.docs.map((doc) => mapPayloadPost(asPayloadDoc(doc), locale)));
      return withLocalViews(mergePosts(payloadPosts, filePosts));
    } catch (error) {
      console.error("Unable to fetch Payload published posts", { locale, error });
      return withLocalViews(filePosts);
    }
  });
}

export const getCmsPublishedPosts = getPayloadPublishedPosts;

async function getPayloadSeries(locale: Locale = "vi"): Promise<Series[]> {
  return cachedJson(`series:list:${locale}`, 30, async () => {
    const posts = await getPayloadPublishedPosts(locale);
    const counts = new Map<string, number>();
    for (const post of posts) {
      if (!post.seriesSlug) continue;
      counts.set(post.seriesSlug, (counts.get(post.seriesSlug) || 0) + 1);
    }

    const fallback = fileSeries.map((item) => ({
      ...item,
      partsCount: counts.get(item.slug) || item.partsCount,
    }));
    const payload = await getPayloadClient();
    if (!payload) return fallback;

    try {
      const result = await payload.find({
        collection: "series",
        depth: 0,
        limit: 100,
        sort: "titleVi",
      });
      const payloadSeries = result.docs.map((doc) => mapPayloadSeries(asPayloadDoc(doc)));
      return mergeSeries(payloadSeries, fallback).map((item) => ({
        ...item,
        partsCount: counts.get(item.slug) || item.partsCount,
      }));
    } catch (error) {
      console.error("Unable to fetch Payload series", { locale, error });
      return fallback;
    }
  });
}

export const getCmsSeries = getPayloadSeries;

async function getPayloadPostBySlug(slug: string, locale: Locale = "vi"): Promise<Post | null> {
  return cachedJson(`posts:detail:${locale}:${slug}`, 30, async () => {
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
      return withLocalView(await mapPayloadPost(asPayloadDoc(doc), locale));
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
  const doc = result.docs[0] ? asPayloadDoc(result.docs[0]) : undefined;
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

function renderCommentBody(value: unknown) {
  const source = asString(value).slice(0, 4000);
  const html = marked.parse(source, { async: false }) as string;
  return commentFilter.process(html);
}

function mapPayloadComment(doc: PayloadDoc): CommentRecord {
  const post = relationDoc(doc.post);
  const parent = relationDoc(doc.parent);
  const user = relationDoc(doc.user);
  const name = asString(doc.username, asString(doc.name, asString(user?.name, "LinuxUnity reader")));
  const avatarUrl = asString(doc.avatarUrl, asString(user?.avatarUrl)) || null;
  return {
    id: String(doc.id || ""),
    postSlug: asString(doc.postSlug, asString(post?.slug)),
    parentId: parent ? String(parent.id || "") : null,
    name,
    email: asString(doc.email, asString(user?.email)) || null,
    avatarUrl,
    provider: doc.provider === "github" || doc.provider === "google" ? doc.provider : null,
    providerUserId: asString(doc.providerUserId) || null,
    userId: user?.id ? String(user.id) : null,
    body: asString(doc.content),
    bodyHtml: renderCommentBody(doc.content),
    status: doc.status === "approved" || doc.status === "rejected" ? doc.status : "pending",
    createdAt: asString(doc.createdAt, new Date().toISOString()),
  };
}

export async function getApprovedPayloadComments(postSlug: string): Promise<CommentRecord[] | null> {
  const payload = await getPayloadClient();
  if (!payload) return null;

  try {
    const result = await payload.find({
      collection: "comments",
      depth: 1,
      limit: 100,
      sort: "createdAt",
      where: {
        and: [
          {
            postSlug: {
              equals: postSlug,
            },
          },
          {
            status: {
              equals: "approved",
            },
          },
        ],
      },
    });
    return result.docs.map((doc) => mapPayloadComment(asPayloadDoc(doc)));
  } catch (error) {
    console.error("Unable to fetch Payload comments", { postSlug, error });
    return null;
  }
}

export async function addPendingPayloadComment(input: {
  postSlug: string;
  parentId?: string | null;
  user: AuthUser;
  body: string;
}): Promise<CommentRecord | null> {
  const payload = await getPayloadClient();
  if (!payload) return null;

  try {
    const postResult = await payload.find({
      collection: "posts",
      depth: 0,
      limit: 1,
      where: {
        slug: {
          equals: input.postSlug,
        },
      },
    });
    const post = postResult.docs[0] ? asPayloadDoc(postResult.docs[0]) : undefined;
    if (!post?.id) return null;
    const postId = Number(post.id);
    if (!Number.isFinite(postId)) return null;
    const parentId = input.parentId ? Number(input.parentId) : undefined;

    const comment = await payload.create({
      collection: "comments",
      overrideAccess: true,
      data: {
        status: "pending",
        name: input.user.name.trim().slice(0, 80),
        email: input.user.email.trim().slice(0, 160) || undefined,
        content: input.body.trim().slice(0, 4000),
        post: postId,
        user: input.user.userId ? Number(input.user.userId) : undefined,
        postSlug: input.postSlug,
        parent: Number.isFinite(parentId) ? parentId : undefined,
        provider: input.user.provider,
        providerUserId: input.user.providerUserId,
        username: input.user.name.trim().slice(0, 80),
        avatarUrl: input.user.avatar?.trim().slice(0, 400) || undefined,
      },
    });

    return mapPayloadComment(asPayloadDoc(comment));
  } catch (error) {
    console.error("Unable to create Payload comment", { postSlug: input.postSlug, error });
    return null;
  }
}

export async function upsertPayloadOAuthUser(user: Omit<AuthUser, "userId">): Promise<AuthUser> {
  const payload = await getPayloadClient();
  if (!payload) return user;

  const where: Where = {
    and: [
      {
        provider: {
          equals: user.provider,
        },
      },
      {
        providerId: {
          equals: user.providerUserId,
        },
      },
    ],
  };

  const existing = await payload.find({
    collection: "users",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where,
  });
  const data = {
    email: user.email || `${user.provider}-${user.providerUserId}@linuxunity.local`,
    name: user.name,
    provider: user.provider,
    providerId: user.providerUserId,
    avatarUrl: user.avatar || undefined,
  };

  let found = existing.docs[0];
  if (!found?.id && user.email) {
    const existingByEmail = await payload.find({
      collection: "users",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        email: {
          equals: user.email,
        },
      },
    });
    found = existingByEmail.docs[0];
  }

  if (found?.id) {
    await payload.update({
      collection: "users",
      id: found.id,
      overrideAccess: true,
      data,
    });
    return { ...user, userId: String(found.id) };
  }

  const created = await payload.create({
    collection: "users",
    overrideAccess: true,
    data: {
      ...data,
      password: cryptoRandomPassword(),
    },
  });

  return { ...user, userId: String(created.id) };
}

function cryptoRandomPassword() {
  return `oauth-${crypto.randomUUID()}-${crypto.randomUUID()}`;
}
