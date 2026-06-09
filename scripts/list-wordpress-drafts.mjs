import {
  assertWordPressCapabilities,
  assertWordPressAuth,
  fetchWordPressRest,
  getWordPressScriptConfig,
} from "./wordpress-auth.mjs";

const limit = Number(process.env.WORDPRESS_DRAFT_LIMIT || 20);
const config = getWordPressScriptConfig();

async function main() {
  console.log(`Using WordPress REST API: ${config.apiBase}`);
  if (config.fallbackApiBase) {
    console.log(`Fallback REST route API: ${config.fallbackApiBase}`);
  }

  const user = await assertWordPressAuth(config);
  console.log(
    `Authenticated as WordPress user #${user.id}: ${user.name || user.slug}`
  );
  assertWordPressCapabilities(user, ["edit_posts"]);

  const fields = "id,date,modified,slug,status,type,title,author";
  const endpoint = `/posts?status=draft&context=edit&orderby=modified&order=desc&per_page=${limit}&_fields=${fields}`;
  const response = await fetchWordPressRest(config, endpoint);

  if (!response.ok) {
    throw new Error(
      `Draft lookup failed at ${response.url} with ${response.status}: ${response.text.slice(
        0,
        700
      )}`
    );
  }

  const drafts = response.json();
  console.log(`Found ${drafts.length} recent WordPress draft posts.`);

  for (const draft of drafts) {
    const title = draft.title?.rendered || "(untitled)";
    console.log(
      `${draft.id}\t${draft.status}\t${draft.type}\t${draft.slug}\t${title}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
