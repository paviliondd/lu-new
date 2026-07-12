import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const rootDir = path.resolve(dirname, "..");

const args = process.argv.slice(2);

function getArg(name, fallback = "") {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] || fallback : fallback;
}

function hasFlag(name) {
  return args.includes(name);
}

function usage() {
  return `
Usage:
  node scripts/import-wordpress-rest.mjs --source https://old-wordpress.example.com [options]

Options:
  --source <url>           WordPress site URL. Required.
  --status <draft|published>
                           Payload status for imported posts. Default: published.
  --author-slug <slug>     Payload author slug to assign. Default: nhatnghia.
  --series-slug <slug>     Optional Payload series slug to assign all imported posts.
  --limit <number>         Optional max posts to import.
  --dry-run                Fetch and print what would import without writing DB/files.
  --username <user>        Optional WordPress username for Application Password auth.
  --app-password <pass>    Optional WordPress Application Password.
`;
}

const source = getArg("--source").replace(/\/$/, "");
const payloadStatus = getArg("--status", "published");
const authorSlug = getArg("--author-slug", "nhatnghia");
const seriesSlug = getArg("--series-slug");
const limit = Number(getArg("--limit", "0"));
const dryRun = hasFlag("--dry-run");
const username = getArg("--username");
const appPassword = getArg("--app-password");
const uploadDir = path.join(rootDir, "public", "uploads", "imported");

if (!source) {
  console.error(usage());
  process.exit(1);
}

if (!["draft", "published"].includes(payloadStatus)) {
  throw new Error("--status must be either draft or published");
}

function connectionString() {
  if (!process.env.DATABASE_URL && !dryRun) {
    throw new Error("DATABASE_URL is required unless --dry-run is used.");
  }
  return process.env.DATABASE_URL;
}

function authHeaders() {
  if (!username || !appPassword) return {};
  return {
    authorization: `Basic ${Buffer.from(`${username}:${appPassword}`).toString("base64")}`,
  };
}

function decodeHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, "\"")
    .replace(/&#8221;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function textExcerpt(value = "") {
  return decodeHtml(value).slice(0, 480);
}

function wordCount(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function readTimeLabel(value = "", locale = "vi") {
  const minutes = Math.max(1, Math.ceil(wordCount(value) / 220));
  return locale === "vi" ? `${minutes} phút đọc` : `${minutes} min read`;
}

function absoluteUrl(value) {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return new URL(trimmed, source).toString();
  return "";
}

function looksLikeImage(value) {
  return /\.(avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(value);
}

function imageCandidates(html = "") {
  const candidates = new Map();
  const attributePattern =
    /\b(?:src|data-src|data-lazy-src|data-original|poster)=["']([^"']+)["']/gi;
  const sourceSetPattern = /\b(?:srcset|data-srcset)=["']([^"']+)["']/gi;
  const directUrlPattern =
    /(?:https?:\/\/|\/\/|\/)[^\s"'<>]+?\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#][^\s"'<>]*)?/gi;

  let match;
  while ((match = attributePattern.exec(html)) !== null) {
    const raw = match[1].trim();
    const url = absoluteUrl(raw);
    if (url && looksLikeImage(url)) candidates.set(raw, url);
  }

  let sourceSetMatch;
  while ((sourceSetMatch = sourceSetPattern.exec(html)) !== null) {
    for (const candidate of sourceSetMatch[1].split(",")) {
      const raw = candidate.trim().split(/\s+/)[0];
      const url = absoluteUrl(raw);
      if (url && looksLikeImage(url)) candidates.set(raw, url);
    }
  }

  for (const directMatch of html.matchAll(directUrlPattern)) {
    const raw = directMatch[0].trim();
    const url = absoluteUrl(raw);
    if (url && looksLikeImage(url)) candidates.set(raw, url);
  }

  return candidates;
}

function fileNameForUrl(url, contentType = "") {
  const parsed = new URL(url);
  const original = path.basename(parsed.pathname) || "image";
  const currentExtension = path.extname(original).toLowerCase();
  const extensionByType = {
    "image/avif": ".avif",
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
  };
  const extension = currentExtension || extensionByType[contentType] || ".img";
  const stem =
    path
      .basename(original, currentExtension)
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "image";
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 10);
  return `${stem}-${hash}${extension}`;
}

async function downloadImage(client, url, alt = "") {
  const response = await fetch(url, {
    headers: { "user-agent": "LinuxUnity WordPress importer/1.0" },
    redirect: "follow",
  });
  const contentType = response.headers.get("content-type")?.split(";")[0] || "";
  if (!response.ok || !contentType.startsWith("image/")) {
    throw new Error(`Unable to download image ${url}: HTTP ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const filename = fileNameForUrl(url, contentType);
  const diskPath = path.join(uploadDir, filename);
  const publicUrl = `/uploads/imported/${filename}`;

  if (!dryRun) {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(diskPath, bytes);
    await client.query(
      `
        INSERT INTO "media" ("alt", "url", "filename", "mime_type", "filesize", "created_at", "updated_at")
        VALUES ($1, $2, $3, $4, $5, now(), now())
        ON CONFLICT ("filename") DO UPDATE SET
          "alt" = EXCLUDED."alt",
          "url" = EXCLUDED."url",
          "mime_type" = EXCLUDED."mime_type",
          "filesize" = EXCLUDED."filesize",
          "updated_at" = now()
      `,
      [alt || filename, publicUrl, filename, contentType, bytes.length]
    );
  }

  return { filename, publicUrl };
}

async function normalizeImages(client, html, alt) {
  const replacements = new Map();
  for (const [raw, url] of imageCandidates(html)) {
    try {
      const downloaded = await downloadImage(client, url, alt);
      replacements.set(raw, downloaded.publicUrl);
    } catch (error) {
      console.warn(error instanceof Error ? error.message : String(error));
    }
  }

  let normalized = html;
  for (const [from, to] of replacements) {
    normalized = normalized.replaceAll(from, to);
    normalized = normalized.replaceAll(from.replaceAll("&", "&amp;"), to);
  }
  return normalized;
}

function embeddedTerms(post) {
  const terms = post?._embedded?.["wp:term"];
  return Array.isArray(terms) ? terms.flat().filter(Boolean) : [];
}

function postCategory(post) {
  const category = embeddedTerms(post).find((term) => term.taxonomy === "category");
  return decodeHtml(category?.name || "Cloud") || "Cloud";
}

function postTags(post) {
  return embeddedTerms(post)
    .filter((term) => term.taxonomy === "post_tag")
    .map((term) => decodeHtml(term.name))
    .filter(Boolean);
}

function featuredImageUrl(post) {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];
  return media?.source_url || "";
}

async function fetchPosts() {
  const posts = [];
  const perPage = 100;
  let page = 1;
  let totalPages = 1;

  do {
    const url = new URL(`${source}/wp-json/wp/v2/posts`);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    url.searchParams.set("_embed", "1");
    if (username && appPassword) {
      url.searchParams.set("status", "publish,draft,private,future");
    }

    const response = await fetch(url, { headers: authHeaders() });
    if (!response.ok) {
      throw new Error(`WordPress REST failed: ${response.status} ${response.statusText} (${url})`);
    }

    totalPages = Number(response.headers.get("x-wp-totalpages") || "1");
    const batch = await response.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    posts.push(...batch);
    console.log(`Fetched page ${page}/${totalPages}: ${batch.length} posts`);
    if (limit > 0 && posts.length >= limit) break;
    page += 1;
  } while (page <= totalPages);

  return limit > 0 ? posts.slice(0, limit) : posts;
}

async function ensureAuthor(client) {
  const found = await client.query(`SELECT "id" FROM "authors" WHERE "slug" = $1 LIMIT 1`, [
    authorSlug,
  ]);
  if (found.rows[0]?.id) return found.rows[0].id;

  const created = await client.query(
    `
      INSERT INTO "authors" ("slug", "name", "role_vi", "role_en", "created_at", "updated_at")
      VALUES ($1, $2, 'Admin', 'Admin', now(), now())
      RETURNING "id"
    `,
    [authorSlug, authorSlug]
  );
  return created.rows[0].id;
}

async function seriesId(client) {
  if (!seriesSlug) return null;
  const found = await client.query(`SELECT "id" FROM "series" WHERE "slug" = $1 LIMIT 1`, [
    seriesSlug,
  ]);
  return found.rows[0]?.id || null;
}

async function mediaIdByUrl(client, url) {
  if (!url) return null;
  const found = await client.query(`SELECT "id" FROM "media" WHERE "url" = $1 LIMIT 1`, [url]);
  return found.rows[0]?.id || null;
}

async function replaceArrayValues(client, table, parentId, values) {
  await client.query(`DELETE FROM "${table}" WHERE "_parent_id" = $1`, [parentId]);
  for (const [index, value] of values.entries()) {
    await client.query(
      `INSERT INTO "${table}" ("_order", "_parent_id", "id", "value") VALUES ($1, $2, $3, $4)`,
      [index, parentId, crypto.randomUUID(), value]
    );
  }
}

async function upsertPost(client, post, authorId, resolvedSeriesId) {
  const title = decodeHtml(post.title?.rendered || post.slug || "Untitled");
  const slug = post.slug || slugify(title);
  const excerpt = textExcerpt(post.excerpt?.rendered || "");
  const date = post.date_gmt ? `${post.date_gmt}Z` : post.date || new Date().toISOString();
  const category = postCategory(post);
  const tags = postTags(post);
  const featuredUrl = featuredImageUrl(post);
  let coverImageId = null;

  if (dryRun) {
    console.log(`[dry-run] ${payloadStatus}: ${slug} | ${title} | ${category} | ${tags.length} tags`);
    return;
  }

  let content = post.content?.rendered || "";
  content = await normalizeImages(client, content, title);

  if (featuredUrl) {
    try {
      const downloaded = await downloadImage(client, featuredUrl, title);
      coverImageId = await mediaIdByUrl(client, downloaded.publicUrl);
    } catch (error) {
      console.warn(error instanceof Error ? error.message : String(error));
    }
  }

  const result = await client.query(
    `
      INSERT INTO "posts" (
        "status",
        "slug",
        "published_at",
        "title_vi",
        "excerpt_vi",
        "content_vi",
        "cover_image_id",
        "category",
        "author_id",
        "series_id",
        "seo_title_vi",
        "seo_description_vi",
        "seo_og_image_id",
        "read_time_vi",
        "read_time_en",
        "views",
        "created_at",
        "updated_at"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $4, $5, $7, $11, $12, 0, now(), now())
      ON CONFLICT ("slug") DO UPDATE SET
        "status" = EXCLUDED."status",
        "published_at" = EXCLUDED."published_at",
        "title_vi" = EXCLUDED."title_vi",
        "excerpt_vi" = EXCLUDED."excerpt_vi",
        "content_vi" = EXCLUDED."content_vi",
        "cover_image_id" = COALESCE(EXCLUDED."cover_image_id", "posts"."cover_image_id"),
        "category" = EXCLUDED."category",
        "author_id" = EXCLUDED."author_id",
        "series_id" = COALESCE(EXCLUDED."series_id", "posts"."series_id"),
        "seo_title_vi" = EXCLUDED."seo_title_vi",
        "seo_description_vi" = EXCLUDED."seo_description_vi",
        "seo_og_image_id" = COALESCE(EXCLUDED."seo_og_image_id", "posts"."seo_og_image_id"),
        "read_time_vi" = EXCLUDED."read_time_vi",
        "read_time_en" = EXCLUDED."read_time_en",
        "updated_at" = now()
      RETURNING "id"
    `,
    [
      payloadStatus,
      slug,
      date,
      title,
      excerpt,
      content,
      coverImageId,
      category,
      authorId,
      resolvedSeriesId,
      readTimeLabel(content, "vi"),
      readTimeLabel(content, "en"),
    ]
  );

  const postId = result.rows[0].id;
  await replaceArrayValues(client, "posts_tags", postId, tags);
  console.log(`Imported ${slug}`);
}

async function main() {
  const posts = await fetchPosts();
  console.log(`Found ${posts.length} WordPress posts.`);

  if (dryRun) {
    for (const post of posts) {
      await upsertPost(null, post, null, null);
    }
    return;
  }

  const client = new Client({ connectionString: connectionString() });
  await client.connect();
  try {
    const authorId = await ensureAuthor(client);
    const resolvedSeriesId = await seriesId(client);
    for (const post of posts) {
      await client.query("BEGIN");
      try {
        await upsertPost(client, post, authorId, resolvedSeriesId);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`Failed to import ${post.slug || post.id}`, error);
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
