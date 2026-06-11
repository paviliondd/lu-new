import { posts as localPublishedPosts, team, type Post } from "@/app/data";
import {
  getLocalizedFilePost,
  getLocalizedFilePosts,
} from "@/lib/content/localized-posts";
import { localizePost, type Locale } from "@/i18n/config";
import { load } from "cheerio";

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
  translations?: Record<string, number | string>;
  yoast_head_json?: WordPressSeo;
  _embedded?: {
    author?: Array<{ slug?: string }>;
    "wp:term"?: WordPressTerm[][];
  };
}

const wordpressApiBase = (
  process.env.WORDPRESS_API_BASE ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  ""
).replace(/\/$/, "");

const wordpressPublicBase = (
  process.env.WORDPRESS_SITE_URL ||
  process.env.WORDPRESS_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  ""
).replace(/\/$/, "");

function buildWordPressRestUrl(apiBase: string, endpoint: string) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const [routePath, queryString = ""] = normalizedEndpoint.split("?");
  const url = new URL(apiBase);
  const restRoute = url.searchParams.get("rest_route");

  if (!restRoute) {
    return `${apiBase}${normalizedEndpoint}`;
  }

  const baseRoute = restRoute.replace(/\/$/, "");
  url.searchParams.set("rest_route", `${baseRoute}${routePath}`);

  const endpointParams = new URLSearchParams(queryString);
  endpointParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
}

function buildRestRouteApiBase(apiBase: string) {
  const url = new URL(apiBase);
  const wpJsonIndex = url.pathname.indexOf("/wp-json");

  if (wpJsonIndex === -1) return null;

  const wordpressPath = url.pathname.slice(0, wpJsonIndex) || "/";
  const routeBase = url.pathname.slice(wpJsonIndex + "/wp-json".length) || "/wp/v2";

  url.pathname = wordpressPath.endsWith("/") ? wordpressPath : `${wordpressPath}/`;
  url.search = "";
  url.searchParams.set("rest_route", routeBase.replace(/\/$/, ""));

  return url.toString();
}

async function fetchWordPressJson<T>(endpoint: string): Promise<T> {
  const primaryUrl = buildWordPressRestUrl(wordpressApiBase, endpoint);
  let response = await fetch(primaryUrl, {
    next: { revalidate: 60 },
  });

  if (!response.ok && response.status === 404) {
    const fallbackApiBase = buildRestRouteApiBase(wordpressApiBase);

    if (fallbackApiBase) {
      response = await fetch(buildWordPressRestUrl(fallbackApiBase, endpoint), {
        next: { revalidate: 60 },
      });
    }
  }

  if (!response.ok) {
    throw new Error(`WordPress fetch failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
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

  return $.html();
}

function extractTerms(post: WordPressPost, taxonomy: string) {
  return (post._embedded?.["wp:term"] || [])
    .flat()
    .filter((term) => term.taxonomy === taxonomy)
    .map((term) => term.name);
}

function isPublishedPost(post: WordPressPost) {
  return post.status === "publish" && Boolean(post.slug);
}

function explicitWordPressLocale(post: WordPressPost): Locale | null {
  const metadataLocale = [
    post.lang,
    post.meta?.linuxunity_locale,
    post.meta?.locale,
    post.meta?.language,
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

  // Legacy WordPress articles have no locale metadata and are Vietnamese.
  return locale === "vi";
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
  const category = extractTerms(post, "category")[0] || "Uncategorized";
  const tags = extractTerms(post, "post_tag");
  const isPublished = post.status === "publish";
  const publishDate = isPublished ? post.date || null : null;
  const wpAuthorSlug = post._embedded?.author?.[0]?.slug;
  const authorKey = wpAuthorSlug && team[wpAuthorSlug] ? wpAuthorSlug : "nhatnghia";

  const mappedPost: Post = {
    id: post.id,
    roadmapId: post.id,
    roadmapOrder: 0,
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
    status: isPublished ? "published" : "draft",
    publishDate,
    publish_date: publishDate,
    date: post.date || "",
    readTime: estimateReadTime(content, locale),
    readTime_en: estimateReadTime(content, "en"),
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
      title: post.yoast_head_json?.title || title,
      description: post.yoast_head_json?.description || description,
      ogImage: post.yoast_head_json?.og_image?.[0]?.url
        ? normalizeWordPressAssetUrl(post.yoast_head_json.og_image[0].url || "")
        : null,
    },
    internalLinking: {
      hubSlug: "",
      relatedServiceSlugs: [],
      examDomainSlugs: [],
    },
  };

  return localizePost(mappedPost, locale);
}

async function fetchWordPressPosts(locale: Locale, status = "publish") {
  let posts: WordPressPost[];

  try {
    posts = await fetchWordPressJson<WordPressPost[]>(
      `/posts?status=${status}&lang=${locale}&_embed=author,wp:term&per_page=100`
    );
  } catch (error) {
    if (locale !== "vi") throw error;

    // WordPress core only supports `lang` when a multilingual plugin provides it.
    posts = await fetchWordPressJson<WordPressPost[]>(
      `/posts?status=${status}&_embed=author,wp:term&per_page=100`
    );
  }

  return posts
    .filter((post) => isPublishedPost(post) && matchesWordPressLocale(post, locale))
    .map((post) => mapWordPressPost(post, locale));
}

function mergePosts(primary: Post[], fallback: Post[]) {
  const postsBySlug = new Map(fallback.map((post) => [post.slug, post]));
  primary.forEach((post) => postsBySlug.set(post.slug, post));
  return [...postsBySlug.values()];
}

function localizedFallbackPosts(locale: Locale) {
  if (locale === "vi") {
    return localPublishedPosts.map((post) => localizePost(post, locale));
  }

  return localPublishedPosts
    .filter(
      (post) =>
        Boolean(post.title_en.trim()) &&
        (post.title_en.trim() !== post.title.trim() ||
          post.description_en.trim() !== post.description.trim() ||
          post.content_en.trim() !== post.content.trim())
    )
    .map((post) => localizePost(post, locale));
}

export async function getCmsPublishedPosts(locale: Locale = "vi"): Promise<Post[]> {
  const filePosts = await getLocalizedFilePosts(locale);
  const fallbackPosts = localizedFallbackPosts(locale);
  if (!wordpressApiBase) return mergePosts(filePosts, fallbackPosts);

  try {
    return mergePosts(filePosts, await fetchWordPressPosts(locale, "publish"));
  } catch {
    return mergePosts(filePosts, fallbackPosts);
  }
}

export async function getCmsPostBySlug(
  slug: string,
  locale: Locale = "vi"
): Promise<Post | null> {
  const filePost = await getLocalizedFilePost(slug, locale);
  if (filePost?.status === "published") return filePost;
  if (filePost?.status === "draft") return null;

  if (!wordpressApiBase) {
    return localizedFallbackPosts(locale).find((item) => item.slug === slug) || null;
  }

  try {
    let posts: WordPressPost[];

    try {
      posts = await fetchWordPressJson<WordPressPost[]>(
        `/posts?slug=${encodeURIComponent(
          slug
        )}&status=publish&lang=${locale}&_embed=author,wp:term&per_page=1`
      );
    } catch (error) {
      if (locale !== "vi") throw error;

      posts = await fetchWordPressJson<WordPressPost[]>(
        `/posts?slug=${encodeURIComponent(
          slug
        )}&status=publish&_embed=author,wp:term&per_page=1`
      );
    }

    const post = posts.find((item) => matchesWordPressLocale(item, locale));
    return post && isPublishedPost(post) ? mapWordPressPost(post, locale) : null;
  } catch {
    return localizedFallbackPosts(locale).find((item) => item.slug === slug) || null;
  }
}
