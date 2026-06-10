import fs from "node:fs";
import path from "node:path";
import {
  assertWordPressAuth,
  fetchWordPressRest,
  getWordPressScriptConfig,
} from "./wordpress-auth.mjs";

const manifestPath =
  process.env.ROADMAP_WORDPRESS_MANIFEST ||
  path.join(process.cwd(), "content", "roadmap-draft-posts.wordpress.json");

const config = getWordPressScriptConfig();

async function wpGet(endpoint) {
  const response = await fetchWordPressRest(config, endpoint);

  if (!response.ok) {
    throw new Error(
      `GET ${response.url} failed with ${response.status}: ${response.text.slice(
        0,
        700
      )}`
    );
  }

  return response.json();
}

async function getAllPosts() {
  const posts = [];
  let page = 1;
  const fields = "id,date,modified,slug,status,type,title,author,link";

  while (true) {
    try {
      const batch = await wpGet(
        `/posts?status=any&context=edit&orderby=modified&order=desc&per_page=100&page=${page}&_fields=${fields}`
      );

      posts.push(...batch);
      if (batch.length < 100) break;
      page += 1;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("rest_post_invalid_page_number")
      ) {
        break;
      }

      throw error;
    }
  }

  return posts;
}

function titleOf(post) {
  return (
    post.title?.rendered
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "(untitled)"
  );
}

function printPostTable(label, posts) {
  console.log(`\n${label}: ${posts.length}`);

  for (const post of posts) {
    console.log(
      `${post.id}\t${post.status}\t${post.modified || post.date || "-"}\t${post.slug}\t${titleOf(post)}`
    );
  }
}

async function main() {
  console.log(
    "READ ONLY audit. This script does not create, update, delete, or reset anything."
  );
  console.log(`Using WordPress REST API: ${config.apiBase}`);

  const user = await assertWordPressAuth(config);
  console.log(
    `Authenticated as WordPress user #${user.id}: ${user.name || user.slug}`
  );

  const posts = await getAllPosts();
  const counts = posts.reduce((acc, post) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
    return acc;
  }, {});

  console.log("\nPost status counts:");
  for (const [status, count] of Object.entries(counts).sort()) {
    console.log(`${status}: ${count}`);
  }

  printPostTable("Recent posts across all statuses", posts.slice(0, 30));
  printPostTable(
    "Recent drafts",
    posts.filter((post) => post.status === "draft").slice(0, 30)
  );
  printPostTable(
    "Trash",
    posts.filter((post) => post.status === "trash").slice(0, 30)
  );

  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const existingSlugs = new Set(posts.map((post) => post.slug));
    const missingRoadmapPosts = manifest.posts.filter(
      (post) => !existingSlugs.has(post.slug)
    );

    console.log(
      `\nRoadmap manifest posts: ${manifest.posts.length}; missing from WordPress: ${missingRoadmapPosts.length}`
    );

    for (const post of missingRoadmapPosts) {
      console.log(`missing\t${post.slug}\t${post.title}`);
    }
  }

  try {
    const users = await wpGet(
      "/users?context=edit&per_page=100&_fields=id,slug,name,roles"
    );
    console.log("\nWordPress users:");

    for (const item of users) {
      console.log(
        `${item.id}\t${item.slug}\t${(item.roles || []).join(",")}\t${item.name}`
      );
    }
  } catch (error) {
    console.log(`\nCould not list users with this account: ${error.message}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
