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
  const response = await fetch(
    `${wordpressApiBase}/posts?status=${status}&_embed=wp:term&per_page=100`
  );

  if (!response.ok) {
    throw new Error(`WordPress posts fetch failed: ${response.status}`);
  }

  const posts = (await response.json()) as WordPressPost[];
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
    const response = await fetch(
      `${wordpressApiBase}/posts?slug=${encodeURIComponent(
        slug
      )}&status=publish&_embed=wp:term&per_page=1`
    );

    if (!response.ok) {
      throw new Error(`WordPress post fetch failed: ${response.status}`);
    }

    const posts = (await response.json()) as WordPressPost[];
    return posts[0] ? mapWordPressPost(posts[0]) : null;
  } catch {
    return localPublishedPosts.find((post) => post.slug === slug) || null;
  }
}
