import {
  allPosts as roadmapPosts,
  posts as localPublishedPosts,
  series,
  team,
  type Post,
} from "@/app/data";
import {
  getLocalizedFilePost,
  getLocalizedFilePosts,
} from "@/lib/content/localized-posts";
import { translateLegacyPostToEnglish } from "@/lib/content/legacy-translation";
import { localizePost, type Locale } from "@/i18n/config";
import { load } from "cheerio";
import { sanitizeArticleHtml } from "@/lib/utils/security";
import {
  buildRestRouteApiBase,
  buildWordPressRestUrl,
  wordpressApiBase,
} from "@/lib/cms/wordpress-rest";
import { cachedJson } from "@/lib/server/redis-cache";
import { getLocalPostViews } from "@/lib/views/store";

interface WordPressRendered {
  rendered?: string;
}

interface WordPressTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: "category" | "post_tag" | string;
}

interface WordPressSeo {
  title?: string;
  description?: string;
  og_image?: Array<{ url?: string }>;
}

interface WordPressPost {
  id: number;
  slug: string;
  status: string;
  date?: string;
  title?: WordPressRendered;
  excerpt?: WordPressRendered;
  content?: WordPressRendered;
  lang?: string;
  meta?: Record<string, unknown>;
  acf?: Record<string, unknown>;
  translations?: Record<string, number | string>;
  view_count?: number;
  yoast_head_json?: WordPressSeo;
  _embedded?: {
    author?: Array<{
      slug?: string;
      name?: string;
      description?: string;
      avatar_urls?: Record<string, string>;
      avatar_url?: string;
      simple_local_avatar?: Record<string, string>;
      acf?: Record<string, unknown>;
      meta?: Record<string, unknown>;
    }>;
    "wp:term"?: WordPressTerm[][];
  };
}

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

const wordpressPublicBase = (
  process.env.NEXT_PUBLIC_WORDPRESS_PUBLIC_URL ||
  process.env.WORDPRESS_PUBLIC_URL ||
  process.env.WORDPRESS_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  ""
).replace(/\/$/, "");

const legacyAssetOrigins = [
  ...(process.env.NEXT_PUBLIC_WORDPRESS_LEGACY_ASSET_ORIGINS || "").split(","),
  ...(process.env.WORDPRESS_LEGACY_ASSET_ORIGINS || "").split(","),
  ...(process.env.IMAGE_REMOTE_HOSTS || "").split(","),
]
  .map((value) => value.trim().replace(/\/$/, ""))
  .filter(Boolean);
const shouldRewriteLegacyAssets =
  process.env.NEXT_PUBLIC_REWRITE_LEGACY_WORDPRESS_ASSETS === "true" ||
  process.env.REWRITE_LEGACY_WORDPRESS_ASSETS === "true";

function isLegacyWordPressAssetUrl(url: URL) {
  const origin = url.origin.replace(/\/$/, "");

  return (
    (url.pathname.includes("/wp-content/") || url.pathname.includes("/wp-includes/")) &&
    legacyAssetOrigins.includes(origin)
  );
}

async function fetchWordPressJson<T>(
  endpoint: string,
  init: NextFetchInit = { next: { revalidate: 60 } }
): Promise<T> {
  const primaryUrl = buildWordPressRestUrl(wordpressApiBase, endpoint);
  let response = await fetch(primaryUrl, init);
  let requestUrl = primaryUrl;

  if (!response.ok && response.status === 404) {
    const fallbackApiBase = buildRestRouteApiBase(wordpressApiBase);

    if (fallbackApiBase) {
      requestUrl = buildWordPressRestUrl(fallbackApiBase, endpoint);
      response = await fetch(requestUrl, init);
    }
  }

  if (!response.ok) {
    if (response.status !== 404) {
      console.error("WordPress fetch failed", {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        url: requestUrl,
      });
    }

    throw new Error(`WordPress fetch failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchWordPressPostPages(status = "publish") {
  const perPage = 100;
  const allPosts: WordPressPost[] = [];

  for (let page = 1; page <= 20; page += 1) {
    const posts = await fetchWordPressJson<WordPressPost[]>(
      `/posts?status=${status}&_embed=author,wp:term&per_page=${perPage}&page=${page}&orderby=date&order=desc`
    );

    allPosts.push(...posts);
    if (posts.length < perPage) break;
  }

  return allPosts;
}

function plainText(html = "") {
  if (!html) return "";
  return load(`<body>${html}</body>`).text().replace(/\s+/g, " ").trim();
}

function normalizeWordPressAssetUrl(value: string) {
  if (!value || value.startsWith("data:") || value.startsWith("blob:")) return value;

  if (
    wordpressPublicBase &&
    (value.startsWith("/wp-content/") || value.startsWith("/wp-includes/"))
  ) {
    return `${wordpressPublicBase}${value}`;
  }

  try {
    const url = new URL(value);
    if (wordpressPublicBase && shouldRewriteLegacyAssets && isLegacyWordPressAssetUrl(url)) {
      const assetPath = url.pathname.replace(/^.*?(\/wp-(?:content|includes)\/)/, "$1");
      return `${wordpressPublicBase}${assetPath}${url.search}${url.hash}`;
    }

    if (wordpressPublicBase && (url.hostname === "wordpress" || url.hostname === "localhost")) {
      return `${wordpressPublicBase}${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return value;
  }

  return value;
}

function normalizeWordPressSrcSet(value: string) {
  return value
    .split(",")
    .map((candidate) => {
      const [url, ...descriptor] = candidate.trim().split(/\s+/);
      if (!url) return candidate;
      return [normalizeWordPressAssetUrl(url), ...descriptor].join(" ");
    })
    .join(", ");
}

function normalizeWordPressContent(html = "") {
  if (!html) return html;

  const $ = load(html, null, false);
  $(".lightbox-trigger, script").remove();

  $("img, source").each((_index, element) => {
    const media = $(element);
    const source =
      media.attr("data-src") ||
      media.attr("data-lazy-src") ||
      media.attr("data-original") ||
      media.attr("src");
    const sourceSet = media.attr("data-srcset") || media.attr("srcset");

    if (source) media.attr("src", normalizeWordPressAssetUrl(source));
    if (sourceSet) media.attr("srcset", normalizeWordPressSrcSet(sourceSet));

    media.removeAttr("data-src");
    media.removeAttr("data-lazy-src");
    media.removeAttr("data-original");
    media.removeAttr("data-srcset");
  });

  $("a").each((_index, element) => {
    const link = $(element);
    const href = link.attr("href");
    if (href) link.attr("href", normalizeWordPressAssetUrl(href));
  });

  return sanitizeArticleHtml($.html());
}

function extractTerms(post: WordPressPost, taxonomy: string) {
  return (post._embedded?.["wp:term"] || [])
    .flat()
    .filter((term) => term.taxonomy === taxonomy)
    .map((term) => term.name);
}

function extractTermSlugs(post: WordPressPost, taxonomy: string) {
  return (post._embedded?.["wp:term"] || [])
    .flat()
    .filter((term) => term.taxonomy === taxonomy)
    .map((term) => term.slug);
}

function readStringMeta(post: WordPressPost, keys: string[]) {
  for (const key of keys) {
    const value = post.meta?.[key] ?? post.acf?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return "";
}

function readNumberMeta(post: WordPressPost, keys: string[]) {
  for (const key of keys) {
    const value = post.meta?.[key] ?? post.acf?.[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return null;
}

function normalizeComparableText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findRoadmapPost(post: WordPressPost, title: string) {
  const bySlug = roadmapPosts.find((item) => item.slug === post.slug);
  if (bySlug) return bySlug;

  const normalizedTitle = normalizeComparableText(title);
  if (!normalizedTitle) return null;

  return (
    roadmapPosts.find(
      (item) =>
        normalizeComparableText(item.title) === normalizedTitle ||
        normalizeComparableText(item.title_en) === normalizedTitle
    ) || null
  );
}

function inferSeriesSlug(post: WordPressPost, fallbackPost?: Post | null) {
  const metadataSeriesSlug = readStringMeta(post, [
    "roadmap_series_slug",
    "roadmap_cluster_slug",
    "series_slug",
    "cluster_slug",
    "series",
  ]);

  if (series.some((item) => item.slug === metadataSeriesSlug)) return metadataSeriesSlug;

  const termSlugs = [
    ...extractTermSlugs(post, "category"),
    ...extractTermSlugs(post, "post_tag"),
  ];
  const termNames = [
    ...extractTerms(post, "category"),
    ...extractTerms(post, "post_tag"),
  ].map((term) => term.toLowerCase());

  return (
    series.find((item) => termSlugs.includes(item.slug))?.slug ||
    series.find((item) => termNames.includes(item.tag.toLowerCase()))?.slug ||
    fallbackPost?.seriesSlug ||
    null
  );
}

function isPublishedPost(post: WordPressPost) {
  return post.status === "publish" && Boolean(post.slug);
}

function explicitWordPressLocale(post: WordPressPost): Locale | null {
  const metadataLocale = [
    post.lang,
    post.meta?.linuxunity_locale,
    post.meta?.lang,
    post.meta?.locale,
    post.meta?.language,
    post.acf?.lang,
  ].find((value) => value === "vi" || value === "en");

  if (metadataLocale === "vi" || metadataLocale === "en") {
    return metadataLocale;
  }

  const suffixLocale = post.slug.match(/(?:^|[-_.])(vi|en)$/i)?.[1]?.toLowerCase();
  return suffixLocale === "vi" || suffixLocale === "en" ? suffixLocale : null;
}

function matchesWordPressLocale(post: WordPressPost, locale: Locale) {
  const explicitLocale = explicitWordPressLocale(post);
  if (explicitLocale) return explicitLocale === locale;

  // Legacy WordPress articles have no locale metadata. Show them in every
  // locale and let localizePost fall back to the original content when no
  // English translation exists yet.
  return locale === "vi" || locale === "en";
}

function localePriority(post: WordPressPost, locale: Locale) {
  const explicitLocale = explicitWordPressLocale(post);
  if (explicitLocale === locale) return 3;
  if (!explicitLocale) return 2;
  return 1;
}

function translationGroupKey(post: WordPressPost) {
  const translationOf = readNumberMeta(post, ["translation_of"]);
  if (translationOf) {
    return [String(post.id), String(translationOf)].sort().join(":");
  }

  const translationIds = Object.values(post.translations || {}).map(String).filter(Boolean);
  if (translationIds.length > 0) {
    return [String(post.id), ...translationIds].sort().join(":");
  }

  return post.slug.replace(/(?:^|[-_.])(vi|en)$/i, "");
}

async function localizeMappedPost(post: Post, locale: Locale, scope: "summary" | "full") {
  const localized = localizePost(post, locale);
  if (locale !== "en") return localized;
  return translateLegacyPostToEnglish(localized, scope);
}

async function mapPostsForLocale(posts: WordPressPost[], locale: Locale) {
  const publishedPosts = posts.filter(isPublishedPost);
  const postsByTranslation = new Map<string, WordPressPost>();

  publishedPosts.forEach((post) => {
    const key = translationGroupKey(post);
    const current = postsByTranslation.get(key);

    if (!current || localePriority(post, locale) > localePriority(current, locale)) {
      postsByTranslation.set(key, post);
    }
  });

  return Promise.all(
    [...postsByTranslation.values()].map((post) =>
      localizeMappedPost(mapWordPressPost(post, locale), locale, "summary")
    )
  );
}

function findPostForLocale(posts: WordPressPost[], locale: Locale) {
  const publishedPosts = posts.filter(isPublishedPost);
  const matchedPost = publishedPosts.find((post) => matchesWordPressLocale(post, locale));
  if (matchedPost) return matchedPost;

  return (
    publishedPosts
      .sort((a, b) => localePriority(b, locale) - localePriority(a, locale))[0] || null
  );
}

function findTranslatedPostBySlug(posts: WordPressPost[], slug: string, locale: Locale) {
  const publishedPosts = posts.filter(isPublishedPost);
  const sourcePost = publishedPosts.find((post) => post.slug === slug);
  if (!sourcePost) return null;

  const sourceGroupKey = translationGroupKey(sourcePost);
  return (
    publishedPosts
      .filter((post) => translationGroupKey(post) === sourceGroupKey)
      .sort((a, b) => localePriority(b, locale) - localePriority(a, locale))[0] || sourcePost
  );
}

function estimateReadTime(html: string, locale: Locale): string {
  const wordCount = plainText(html).split(/\s+/).filter(Boolean).length;
  if (wordCount === 0) return locale === "vi" ? "< 1 phút" : "< 1 min read";
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return locale === "vi" ? `${minutes} phút đọc` : `${minutes} min read`;
}

function mapWordPressPost(post: WordPressPost, locale: Locale): Post {
  const title = plainText(post.title?.rendered);
  const description = plainText(post.excerpt?.rendered);
  const content = normalizeWordPressContent(post.content?.rendered || "");
  const roadmapPost = findRoadmapPost(post, title);
  const category = extractTerms(post, "category")[0] || "Uncategorized";
  const tags = extractTerms(post, "post_tag");
  const isPublished = post.status === "publish";
  const publishDate = isPublished ? post.date || null : null;
  const wpAuthor = post._embedded?.author?.[0];
  const wpAuthorSlug = wpAuthor?.slug;
  const authorKey = wpAuthorSlug && team[wpAuthorSlug] ? wpAuthorSlug : "nhatnghia";
  const avatarUrls = wpAuthor?.avatar_urls || {};
  const fallbackAvatarUrl = Object.values(avatarUrls).slice(-1)[0];
  const customAvatar =
    wpAuthor?.avatar_url ||
    wpAuthor?.simple_local_avatar?.["96"] ||
    wpAuthor?.simple_local_avatar?.full ||
    (typeof wpAuthor?.acf?.avatar === "string" ? wpAuthor.acf.avatar : null) ||
    (typeof wpAuthor?.meta?.avatar === "string" ? wpAuthor.meta.avatar : null) ||
    (typeof wpAuthor?.meta?.avatar_url === "string" ? wpAuthor.meta.avatar_url : null);
  const authorAvatar =
    customAvatar ||
    avatarUrls["96"] ||
    avatarUrls["48"] ||
    avatarUrls["24"] ||
    fallbackAvatarUrl ||
    team[authorKey]?.avatarUrl ||
    null;

  const mappedPost: Post = {
    id: post.id,
    roadmapId: roadmapPost?.roadmapId || post.id,
    roadmapOrder: roadmapPost?.roadmapOrder || 0,
    slug: post.slug,
    title,
    title_en: title,
    description,
    description_en: description,
    content,
    content_en: content,
    category,
    tags,
    author: authorKey,
    authorName: wpAuthor?.name || team[authorKey]?.name,
    authorAvatar: authorAvatar ? normalizeWordPressAssetUrl(authorAvatar) : null,
    authorDescription: wpAuthor?.description || team[authorKey]?.description,
    status: isPublished ? "published" : "draft",
    publishDate,
    publish_date: publishDate,
    date: post.date || "",
    readTime: estimateReadTime(content, locale),
    readTime_en: estimateReadTime(content, "en"),
    views: Math.max(0, Number(post.view_count || 0)),
    seriesSlug: inferSeriesSlug(post, roadmapPost),
    topicSlug: roadmapPost?.topicSlug || "",
    clusterSlug: roadmapPost?.clusterSlug || "",
    gradient: roadmapPost?.gradient || "from-slate-600/90 to-cyan-700/90",
    certs: roadmapPost?.certs || [],
    services: roadmapPost?.services || [],
    examDomains: roadmapPost?.examDomains || [],
    coverage: roadmapPost?.coverage || "",
    labs: roadmapPost?.labs || [],
    costNote: roadmapPost?.costNote || "",
    cleanupNote: roadmapPost?.cleanupNote || "",
    editorialNote: roadmapPost?.editorialNote || "",
    quiz: roadmapPost?.quiz || "",
    seo: {
      title: post.yoast_head_json?.title || title,
      description: post.yoast_head_json?.description || description,
      ogImage: post.yoast_head_json?.og_image?.[0]?.url
        ? normalizeWordPressAssetUrl(post.yoast_head_json.og_image[0].url || "")
        : null,
    },
    internalLinking: {
      hubSlug: roadmapPost?.internalLinking.hubSlug || "",
      relatedServiceSlugs: roadmapPost?.internalLinking.relatedServiceSlugs || [],
      examDomainSlugs: roadmapPost?.internalLinking.examDomainSlugs || [],
    },
  };

  return localizePost(mappedPost, locale);
}

async function fetchWordPressPosts(locale: Locale, status = "publish") {
  const posts = await fetchWordPressPostPages(status);
  return mapPostsForLocale(posts, locale);
}

function mergePosts(primary: Post[], fallback: Post[]) {
  const postsBySlug = new Map(fallback.map((post) => [post.slug, post]));
  primary.forEach((post) => postsBySlug.set(post.slug, post));
  return [...postsBySlug.values()];
}

function localizedFallbackPosts(locale: Locale) {
  const fallbackSource = localPublishedPosts.length > 0 ? localPublishedPosts : roadmapPosts;
  const offlinePublishDate = "2026-06-09T00:00:00+07:00";
  const englishFallback = (post: Post) => {
    const services = post.services.filter(Boolean).join(", ") || post.category || "Cloud";
    const certs = post.certs.length > 0 ? ` for ${post.certs.join(", ")}` : "";
    const title = `${services}: ${post.category} practical guide`;
    const description = `A practical ${post.category} guide covering ${services}${certs}.`;
    const content = `<p>${description}</p><p>This English fallback is generated from article metadata. Add a dedicated English translation in WordPress or content/posts for the full article body.</p>`;

    return { title, description, content };
  };

  return fallbackSource.map((post) =>
    {
      const english = locale === "en" ? englishFallback(post) : null;
      return localizePost(
      {
        ...post,
        status: "published" as const,
        publishDate: post.publishDate || post.date || offlinePublishDate,
        publish_date: post.publish_date || post.date || offlinePublishDate,
        date: post.date || post.publishDate || offlinePublishDate,
        description:
          english?.description ||
          post.description ||
          post.editorialNote ||
          post.labs[0] ||
          `${post.category} guide for ${post.services.join(", ") || "cloud engineering"}.`,
        description_en:
          english?.description ||
          post.description_en ||
          post.editorialNote ||
          post.labs[0] ||
          `${post.category} guide for ${post.services.join(", ") || "cloud engineering"}.`,
        content:
          english?.content ||
          post.content ||
          `<p>${post.editorialNote || post.labs[0] || post.quiz || post.title}</p>`,
        content_en:
          english?.content ||
          post.content_en ||
          `<p>${post.editorialNote || post.labs[0] || post.quiz || post.title_en || post.title}</p>`,
        title_en: english?.title || post.title_en,
        readTime: post.readTime === "Draft" ? "3 phút đọc" : post.readTime,
        readTime_en: post.readTime_en === "Draft" ? "3 min read" : post.readTime_en,
      },
      locale
    );
    }
  );
}

async function withLocalViews(posts: Post[]) {
  const localViews = await getLocalPostViews();
  return posts.map((post) => ({
    ...post,
    views: Math.max(post.views || 0, localViews[post.slug] || 0),
  }));
}

async function withLocalView(post: Post) {
  const localViews = await getLocalPostViews();
  return {
    ...post,
    views: Math.max(post.views || 0, localViews[post.slug] || 0),
  };
}

export async function getCmsPublishedPosts(locale: Locale = "vi"): Promise<Post[]> {
  return cachedJson(`posts:published:${locale}`, 300, async () => {
    const filePosts = await getLocalizedFilePosts(locale);
    const fallbackPosts = localizedFallbackPosts(locale);
    if (!wordpressApiBase) return withLocalViews(mergePosts(filePosts, fallbackPosts));

    try {
      const wordpressPosts = await fetchWordPressPosts(locale, "publish");
      const localFallbackPosts = mergePosts(filePosts, fallbackPosts);
      return withLocalViews(mergePosts(wordpressPosts, localFallbackPosts));
    } catch (error) {
      console.error("Unable to fetch WordPress published posts", { locale, error });
      return withLocalViews(mergePosts(filePosts, fallbackPosts));
    }
  });
}

export async function getCmsPostBySlug(
  slug: string,
  locale: Locale = "vi"
): Promise<Post | null> {
  return cachedJson(`posts:detail:${locale}:${slug}`, 600, async () => {
    const filePost = await getLocalizedFilePost(slug, locale);

    if (!wordpressApiBase) {
      if (filePost?.status === "published") {
        return withLocalView(filePost);
      }
      if (filePost?.status === "draft") return null;
      const fallback = localizedFallbackPosts(locale).find((item) => item.slug === slug) || null;
      return fallback ? withLocalView(fallback) : null;
    }

    try {
      const posts = await fetchWordPressJson<WordPressPost[]>(
        `/posts?slug=${encodeURIComponent(
          slug
        )}&status=publish&_embed=author,wp:term&per_page=1`,
        { cache: "no-store" }
      );

      const post = findPostForLocale(posts, locale);
      if (post) return withLocalView(await localizeMappedPost(mapWordPressPost(post, locale), locale, "full"));

      if (locale !== "vi") {
        const allPosts = await fetchWordPressPostPages("publish");
        const translatedPost = findTranslatedPostBySlug(allPosts, slug, locale);
        if (translatedPost) {
          return withLocalView(
            await localizeMappedPost(mapWordPressPost(translatedPost, locale), locale, "full")
          );
        }
      }

      if (filePost?.status === "draft") return null;
      const fallback = localizedFallbackPosts(locale).find((item) => item.slug === slug) || null;
      return fallback ? withLocalView(fallback) : null;
    } catch (error) {
      console.error("Unable to resolve WordPress post by slug", { slug, locale, error });
      if (filePost?.status === "published") return withLocalView(filePost);
      if (filePost?.status === "draft") return null;
      const fallback = localizedFallbackPosts(locale).find((item) => item.slug === slug) || null;
      return fallback ? withLocalView(fallback) : null;
    }
  });
}
