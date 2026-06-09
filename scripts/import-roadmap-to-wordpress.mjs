import fs from "node:fs";
import path from "node:path";

const manifestPath =
  process.env.ROADMAP_WORDPRESS_MANIFEST ||
  path.join(process.cwd(), "content", "roadmap-draft-posts.wordpress.json");

const shouldDeleteExistingPosts =
  process.env.WORDPRESS_DELETE_EXISTING_POSTS === "true";
const deleteConfirm = process.env.WORDPRESS_DELETE_CONFIRM || "";
const shouldWriteMeta = process.env.WORDPRESS_WRITE_META === "true";
const isDryRun = process.env.DRY_RUN === "true";
const wordpressUrl = process.env.WORDPRESS_URL || "https://example.invalid";
const username = process.env.WORDPRESS_USERNAME || "dry-run";
const appPassword = process.env.WORDPRESS_APP_PASSWORD || "dry-run";

if (
  !isDryRun &&
  (!process.env.WORDPRESS_URL ||
    !process.env.WORDPRESS_USERNAME ||
    !process.env.WORDPRESS_APP_PASSWORD)
) {
  throw new Error(
    "Missing WORDPRESS_URL, WORDPRESS_USERNAME, or WORDPRESS_APP_PASSWORD."
  );
}

if (shouldDeleteExistingPosts && deleteConfirm !== "delete-posts-only") {
  throw new Error(
    "WORDPRESS_DELETE_EXISTING_POSTS=true also requires WORDPRESS_DELETE_CONFIRM=delete-posts-only."
  );
}

const apiBase = (
  process.env.WORDPRESS_API_BASE ||
  new URL(
    "wp-json/wp/v2/",
    wordpressUrl.endsWith("/") ? wordpressUrl : `${wordpressUrl}/`
  ).toString()
).replace(/\/$/, "");

const authHeader = `Basic ${Buffer.from(`${username}:${appPassword}`).toString(
  "base64"
)}`;

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

async function wpRequest(endpoint, options = {}) {
  const method = options.method || "GET";
  const body = options.body ? JSON.stringify(options.body) : undefined;

  if (isDryRun) {
    console.log(`[dry-run] ${method} ${endpoint}`);
    if (method === "GET") return [];
    return options.mockResponse || {};
  }

  const response = await fetch(`${apiBase}${endpoint}`, {
    method,
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `${method} ${endpoint} failed with ${response.status}: ${text.slice(
        0,
        700
      )}`
    );
  }

  return response.status === 204 ? null : response.json();
}

async function getAllPosts() {
  const posts = [];
  let page = 1;

  while (true) {
    const batch = await wpRequest(
      `/posts?status=any&context=edit&per_page=100&page=${page}&_fields=id,slug,title,status`
    );
    posts.push(...batch);

    if (batch.length < 100) break;
    page += 1;
  }

  return posts;
}

async function deleteExistingPostsOnly() {
  const posts = await getAllPosts();
  console.log(`Deleting ${posts.length} existing WordPress posts only...`);

  for (const post of posts) {
    await wpRequest(`/posts/${post.id}?force=true`, {
      method: "DELETE",
      mockResponse: { deleted: true },
    });
  }
}

async function ensureTerm(endpoint, name, slug, description = "") {
  const found = await wpRequest(
    `/${endpoint}?slug=${encodeURIComponent(slug)}&per_page=100`
  );

  if (found[0]) return found[0].id;

  const created = await wpRequest(`/${endpoint}`, {
    method: "POST",
    body: { name, slug, description },
    mockResponse: { id: -1, name, slug },
  });

  return created.id;
}

async function findPostBySlug(slug) {
  const found = await wpRequest(
    `/posts?slug=${encodeURIComponent(
      slug
    )}&status=any&context=edit&per_page=1`
  );

  return found[0] || null;
}

function buildMeta(post) {
  return {
    roadmap_id: String(post.roadmap_id),
    roadmap_order: String(post.roadmap_order),
    roadmap_topic_slug: post.topic_cluster.topic_slug,
    roadmap_cluster_slug: post.topic_cluster.cluster_slug,
    seo_title: post.seo.title,
    seo_description: post.seo.description,
    seo_og_image: post.seo.ogImage || "",
  };
}

async function upsertPost(post, categoryId, tagIds) {
  const payload = {
    title: post.title,
    slug: post.slug,
    status: "draft",
    content: "",
    excerpt: "",
    categories: [categoryId],
    tags: tagIds,
  };

  if (shouldWriteMeta) {
    payload.meta = buildMeta(post);
  }

  const existing = shouldDeleteExistingPosts
    ? null
    : await findPostBySlug(post.slug);

  if (existing) {
    await wpRequest(`/posts/${existing.id}`, {
      method: "POST",
      body: payload,
      mockResponse: { id: existing.id },
    });
    return { action: "updated", slug: post.slug };
  }

  await wpRequest("/posts", {
    method: "POST",
    body: payload,
    mockResponse: { id: -1 },
  });

  return { action: "created", slug: post.slug };
}

async function main() {
  console.log(`Using WordPress REST API: ${apiBase}`);
  console.log(`Using manifest: ${manifestPath}`);
  console.log(
    `Manifest posts: ${manifest.posts.length}; explicit roadmap articles: ${manifest.explicitArticleCount}`
  );

  if (manifest.missingArticleIds?.length) {
    console.log(
      `Roadmap HTML claims 44 articles, but explicit records are missing IDs: ${manifest.missingArticleIds.join(
        ", "
      )}`
    );
  }

  if (shouldDeleteExistingPosts) {
    await deleteExistingPostsOnly();
  }

  const categoryIds = new Map();
  for (const category of manifest.categories) {
    const id = await ensureTerm(
      "categories",
      category.name,
      category.slug,
      category.description
    );
    categoryIds.set(category.slug, id);
  }

  const tagIds = new Map();
  for (const tag of manifest.posts.flatMap((post) =>
    post.tags.map((name, index) => ({
      name,
      slug: post.tag_slugs[index],
    }))
  )) {
    if (tagIds.has(tag.slug)) continue;
    const id = await ensureTerm("tags", tag.name, tag.slug);
    tagIds.set(tag.slug, id);
  }

  const results = [];
  for (const post of manifest.posts) {
    const categoryId = categoryIds.get(post.category_slug);
    const ids = post.tag_slugs.map((slug) => tagIds.get(slug)).filter(Boolean);
    results.push(await upsertPost(post, categoryId, ids));
  }

  const created = results.filter((result) => result.action === "created").length;
  const updated = results.filter((result) => result.action === "updated").length;

  console.log(
    `Done. Created ${created} draft posts, updated ${updated} draft posts.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
