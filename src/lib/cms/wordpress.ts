import { posts as localPublishedPosts, type Post } from "@/app/data";

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
  yoast_head_json?: WordPressSeo;
  _embedded?: {
    "wp:term"?: WordPressTerm[][];
  };
}

const wordpressApiBase = (
  process.env.WORDPRESS_API_BASE ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
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
  let response = await fetch(primaryUrl);

  if (!response.ok && response.status === 404) {
    const fallbackApiBase = buildRestRouteApiBase(wordpressApiBase);

    if (fallbackApiBase) {
      response = await fetch(buildWordPressRestUrl(fallbackApiBase, endpoint));
    }
  }

  if (!response.ok) {
    throw new Error(`WordPress fetch failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function plainText(html = "") {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTerms(post: WordPressPost, taxonomy: string) {
  return (post._embedded?.["wp:term"] || [])
    .flat()
    .filter((term) => term.taxonomy === taxonomy)
    .map((term) => term.name);
}

function mapWordPressPost(post: WordPressPost): Post {
  const title = plainText(post.title?.rendered);
  const description = plainText(post.excerpt?.rendered);
  const category = extractTerms(post, "category")[0] || "Uncategorized";
  const tags = extractTerms(post, "post_tag");
  const isPublished = post.status === "publish";
  const publishDate = isPublished ? post.date || null : null;

  return {
    id: post.id,
    roadmapId: post.id,
    roadmapOrder: 0,
    slug: post.slug,
    title,
    title_en: title,
    description,
    description_en: description,
    content: post.content?.rendered || "",
    content_en: post.content?.rendered || "",
    category,
    tags,
    author: "nhatnghia",
    status: isPublished ? "published" : "draft",
    publishDate,
    publish_date: publishDate,
    date: post.date || "",
    readTime: "Draft",
    readTime_en: "Draft",
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
      ogImage: post.yoast_head_json?.og_image?.[0]?.url || null,
    },
    internalLinking: {
      hubSlug: "",
      relatedServiceSlugs: [],
      examDomainSlugs: [],
    },
  };
}

async function fetchWordPressPosts(status = "publish") {
  const posts = await fetchWordPressJson<WordPressPost[]>(
    `/posts?status=${status}&_embed=wp:term&per_page=100`
  );
  return posts.map(mapWordPressPost);
}

export async function getCmsPublishedPosts(): Promise<Post[]> {
  if (!wordpressApiBase) return localPublishedPosts;

  try {
    return await fetchWordPressPosts("publish");
  } catch {
    return localPublishedPosts;
  }
}

export async function getCmsPostBySlug(slug: string): Promise<Post | null> {
  if (!wordpressApiBase) {
    return localPublishedPosts.find((post) => post.slug === slug) || null;
  }

  try {
    const posts = await fetchWordPressJson<WordPressPost[]>(
      `/posts?slug=${encodeURIComponent(
        slug
      )}&status=publish&_embed=wp:term&per_page=1`
    );
    return posts[0] ? mapWordPressPost(posts[0]) : null;
  } catch {
    return localPublishedPosts.find((post) => post.slug === slug) || null;
  }
}
