/**
 * import-from-wordpress.mjs
 *
 * Imports posts from an external / old WordPress site into this site's WordPress.
 *
 * Source (old site): IMPORT_SOURCE_URL  — public REST API, no auth needed for published posts.
 * Target (this site): WORDPRESS_URL + WORDPRESS_USERNAME + WORDPRESS_APP_PASSWORD
 *
 * Safety rules:
 *   - Only reads published posts from the source.
 *   - Creates posts as "draft" in the target so you can review before publishing.
 *   - Never deletes or overwrites existing posts (skips by slug).
 *   - Set DRY_RUN=true to preview without writing anything.
 *
 * Usage (from VPS or local):
 *   IMPORT_SOURCE_URL=https://old-site.example.com \
 *   WORDPRESS_URL=https://tesst.linuxunity.com \
 *   WORDPRESS_USERNAME=admin-user \
 *   WORDPRESS_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx" \
 *   node scripts/import-from-wordpress.mjs
 *
 * Or with dry-run first:
 *   DRY_RUN=true IMPORT_SOURCE_URL=https://old-site.example.com ... node scripts/import-from-wordpress.mjs
 *
 * Options (env vars):
 *   IMPORT_SOURCE_URL        Required. Base URL of the old WordPress site.
 *   IMPORT_STATUS            Default "publish". Status of posts to read from source.
 *   IMPORT_TARGET_STATUS     Default "draft". Status to set on created posts in target.
 *   IMPORT_PER_PAGE          Default 20. Posts per page when fetching from source.
 *   IMPORT_MAX_PAGES         Default 0 (unlimited). Max pages to fetch from source.
 *   IMPORT_CATEGORIES        Comma-separated category slugs to filter source posts. Default: all.
 *   DRY_RUN                  Set to "true" to preview without any writes.
 */

import {
  assertWordPressAuth,
  assertWordPressCapabilities,
  fetchWordPressRest,
  getWordPressScriptConfig,
} from "./wordpress-auth.mjs";

// ─── Config ──────────────────────────────────────────────────────────────────

const sourceUrl = (process.env.IMPORT_SOURCE_URL || "").replace(/\/$/, "");
if (!sourceUrl) {
  console.error("ERROR: IMPORT_SOURCE_URL is required.");
  console.error("  Example: IMPORT_SOURCE_URL=https://old-site.example.com");
  process.exitCode = 1;
  process.exit();
}

const sourceStatus  = process.env.IMPORT_STATUS         || "publish";
const targetStatus  = process.env.IMPORT_TARGET_STATUS  || "draft";
const perPage       = Math.max(1, parseInt(process.env.IMPORT_PER_PAGE  || "20", 10));
const maxPages      = Math.max(0, parseInt(process.env.IMPORT_MAX_PAGES || "0",  10));
const filterCats    = (process.env.IMPORT_CATEGORIES || "")
  .split(",").map(s => s.trim()).filter(Boolean);
const isDryRun      = process.env.DRY_RUN === "true";

const targetConfig = getWordPressScriptConfig({ allowDryRun: false });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function plainText(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Fetch JSON from the *source* site's public REST API (no auth needed for published posts).
 */
async function fetchSource(endpoint) {
  // Support both /wp-json/wp/v2 and /?rest_route=/wp/v2 styles.
  const url = `${sourceUrl}/wp-json/wp/v2${endpoint}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  if (!res.ok) {
    // Fallback to query-string form in case pretty permalinks aren't enabled.
    const fallback = `${sourceUrl}/?rest_route=/wp/v2${endpoint}`;
    const res2 = await fetch(fallback, { headers: { Accept: "application/json" } });
    if (!res2.ok) {
      throw new Error(`Source fetch failed: GET ${url} → ${res.status}`);
    }
    return res2.json();
  }

  return res.json();
}

/** Fetch all pages from the source and return a flat array. */
async function fetchAllSourcePosts() {
  const posts = [];
  let page = 1;

  // Build optional category filter
  let categoryFilter = "";
  if (filterCats.length > 0) {
    // Look up category IDs on the source site
    const catIds = [];
    for (const slug of filterCats) {
      try {
        const cats = await fetchSource(`/categories?slug=${encodeURIComponent(slug)}&per_page=1`);
        if (cats[0]?.id) catIds.push(cats[0].id);
      } catch {
        console.warn(`Warning: could not find source category slug "${slug}" – skipping filter.`);
      }
    }
    if (catIds.length > 0) {
      categoryFilter = `&categories=${catIds.join(",")}`;
    }
  }

  while (true) {
    console.log(`  Fetching source page ${page}…`);
    let batch;
    try {
      batch = await fetchSource(
        `/posts?status=${sourceStatus}&per_page=${perPage}&page=${page}&_embed=author,wp:term${categoryFilter}`
      );
    } catch (err) {
      if (err.message.includes("rest_post_invalid_page_number")) break;
      throw err;
    }

    if (!Array.isArray(batch) || batch.length === 0) break;
    posts.push(...batch);
    if (batch.length < perPage) break;
    if (maxPages > 0 && page >= maxPages) break;
    page += 1;
  }

  return posts;
}

/** Ensure a term (category or tag) exists in the target and return its ID. */
async function ensureTargetTerm(taxonomy, name, slug) {
  const endpoint = taxonomy === "category" ? "/categories" : "/tags";

  const checkRes = await fetchWordPressRest(
    targetConfig,
    `${endpoint}?slug=${encodeURIComponent(slug)}&per_page=1`
  );
  if (checkRes.ok) {
    const found = checkRes.json();
    if (Array.isArray(found) && found[0]?.id) return found[0].id;
  }

  if (isDryRun) {
    console.log(`  [dry-run] Would create ${taxonomy}: "${name}" (${slug})`);
    return -1;
  }

  const createRes = await fetchWordPressRest(targetConfig, endpoint, {
    method: "POST",
    body: { name, slug },
  });
  if (!createRes.ok) {
    console.warn(`  Warning: could not create ${taxonomy} "${slug}": ${createRes.text.slice(0, 200)}`);
    return -1;
  }
  return createRes.json().id;
}

/** Check if a slug already exists in the target. */
async function slugExistsInTarget(slug) {
  const res = await fetchWordPressRest(
    targetConfig,
    `/posts?slug=${encodeURIComponent(slug)}&status=any&context=edit&per_page=1`
  );
  if (!res.ok) return false;
  const found = res.json();
  return Array.isArray(found) && found.length > 0;
}

/** Create a single post in the target WordPress. */
async function createTargetPost(sourcePost, categoryIds, tagIds) {
  const title   = plainText(sourcePost.title?.rendered || "");
  const content = sourcePost.content?.rendered || "";
  const excerpt = sourcePost.excerpt?.rendered || "";
  const slug    = sourcePost.slug;
  const date    = sourcePost.date || undefined;

  const payload = {
    title,
    slug,
    status: targetStatus,
    content,
    excerpt,
    date,
    categories: categoryIds.filter(id => id > 0),
    tags:       tagIds.filter(id => id > 0),
  };

  if (isDryRun) {
    console.log(`  [dry-run] Would create post: "${title}" (${slug})`);
    return { id: -1, slug };
  }

  const res = await fetchWordPressRest(targetConfig, "/posts", {
    method: "POST",
    body: payload,
  });

  if (!res.ok) {
    throw new Error(
      `Failed to create post "${slug}": ${res.status} – ${res.text.slice(0, 500)}`
    );
  }

  return res.json();
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== WordPress → WordPress Import ===");
  console.log(`Source:    ${sourceUrl}`);
  console.log(`Target:    ${targetConfig.wordpressUrl}`);
  console.log(`Target API: ${targetConfig.apiBase}`);
  console.log(`Source status filter:  ${sourceStatus}`);
  console.log(`Target post status:    ${targetStatus}`);
  console.log(`Dry run:   ${isDryRun}`);
  if (filterCats.length > 0) {
    console.log(`Category filter:  ${filterCats.join(", ")}`);
  }
  console.log("");

  // Verify target credentials
  if (!isDryRun) {
    const user = await assertWordPressAuth(targetConfig);
    console.log(`Authenticated as target user #${user.id}: ${user.name || user.slug}`);
    assertWordPressCapabilities(user, ["edit_posts", "manage_categories"]);
  } else {
    console.log("[dry-run] Skipping target auth check.");
  }

  console.log("\nFetching posts from source site…");
  const sourcePosts = await fetchAllSourcePosts();
  console.log(`Found ${sourcePosts.length} post(s) on source.`);

  if (sourcePosts.length === 0) {
    console.log("Nothing to import. Exiting.");
    return;
  }

  let created = 0;
  let skipped = 0;
  let errors  = 0;

  for (const sourcePost of sourcePosts) {
    const slug  = sourcePost.slug;
    const title = plainText(sourcePost.title?.rendered || "(untitled)");

    // Check for duplicates
    if (!isDryRun) {
      const exists = await slugExistsInTarget(slug);
      if (exists) {
        console.log(`  skip  "${title}" (${slug}) – already exists in target`);
        skipped++;
        continue;
      }
    }

    // Build category IDs in target
    const sourceCategories = (sourcePost._embedded?.["wp:term"] || [])
      .flat()
      .filter(t => t.taxonomy === "category");
    const sourceTags = (sourcePost._embedded?.["wp:term"] || [])
      .flat()
      .filter(t => t.taxonomy === "post_tag");

    const categoryIds = [];
    for (const cat of sourceCategories) {
      const id = await ensureTargetTerm("category", cat.name, cat.slug);
      categoryIds.push(id);
    }

    const tagIds = [];
    for (const tag of sourceTags) {
      const id = await ensureTargetTerm("tag", tag.name, tag.slug);
      tagIds.push(id);
    }

    try {
      const created_ = await createTargetPost(sourcePost, categoryIds, tagIds);
      console.log(`  create #${created_.id}  "${title}" (${slug})`);
      created++;
    } catch (err) {
      console.error(`  ERROR  "${title}" (${slug}): ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone. Created: ${created}  Skipped: ${skipped}  Errors: ${errors}`);
  if (isDryRun) {
    console.log("(Dry run – no data was written.)");
  }
  if (errors > 0) {
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
