import fs from "node:fs";
import path from "node:path";
import {
  assertWordPressCapabilities,
  assertWordPressAuth,
  buildWordPressRequestUrl,
  fetchWordPressRest,
  getWordPressScriptConfig,
} from "./wordpress-auth.mjs";

const manifestPath =
  process.env.ROADMAP_WORDPRESS_MANIFEST ||
  path.join(process.cwd(), "content", "roadmap-draft-posts.wordpress.json");

const shouldDeleteExistingPosts =
  process.env.WORDPRESS_DELETE_EXISTING_POSTS === "true";
const shouldWriteMeta = process.env.WORDPRESS_WRITE_META === "true";
const config = getWordPressScriptConfig({ allowDryRun: true });

if (shouldDeleteExistingPosts) {
  throw new Error(
    "Destructive roadmap imports are disabled. This script is create-only and will not delete or overwrite existing WordPress posts."
  );
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

async function wpRequest(endpoint, options = {}) {
  const method = options.method || "GET";

  if (config.isDryRun) {
    console.log(`[dry-run] ${method} ${buildWordPressRequestUrl(config, endpoint)}`);
    if (method === "GET") return [];
    return options.mockResponse || {};
  }

  const response = await fetchWordPressRest(config, endpoint, {
    method,
    body: options.body,
  });

  if (!response.ok) {
    throw new Error(
      `${method} ${response.url} failed with ${response.status}: ${response.text.slice(
        0,
        700
      )}`
    );
  }

  return response.status === 204 ? null : response.json();
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
    roadmap_series_slug: post.topic_cluster.series_slug || post.topic_cluster.cluster_slug,
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

  const existing = await findPostBySlug(post.slug);

  if (existing) {
    return {
      action: "skipped",
      slug: post.slug,
      reason: `existing WordPress post #${existing.id} (${existing.status})`,
    };
  }

  await wpRequest("/posts", {
    method: "POST",
    body: payload,
    mockResponse: { id: -1 },
  });

  return { action: "created", slug: post.slug };
}

async function main() {
  console.log(`Using WordPress REST API: ${config.apiBase}`);
  if (config.fallbackApiBase) {
    console.log(`Fallback REST route API: ${config.fallbackApiBase}`);
  }
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

  if (!config.isDryRun) {
    const user = await assertWordPressAuth(config);
    console.log(
      `Authenticated as WordPress user #${user.id}: ${user.name || user.slug}`
    );
    assertWordPressCapabilities(user, ["edit_posts", "manage_categories"]);
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
  const skipped = results.filter((result) => result.action === "skipped").length;

  console.log(
    `Done. Created ${created} draft posts, skipped ${skipped} existing posts.`
  );

  for (const result of results.filter((item) => item.action === "skipped")) {
    console.log(`Skipped ${result.slug}: ${result.reason}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
