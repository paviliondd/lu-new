import {
  assertWordPressCapabilities,
  assertWordPressAuth,
  fetchWordPressRest,
  getWordPressScriptConfig,
} from "./wordpress-auth.mjs";

async function main() {
  const config = getWordPressScriptConfig();

  console.log(`Using WordPress REST API: ${config.apiBase}`);
  if (config.fallbackApiBase) {
    console.log(`Fallback REST route API: ${config.fallbackApiBase}`);
  }
  console.log(`Using WordPress username: ${config.username}`);

  const user = await assertWordPressAuth(config);
  console.log(
    `Authenticated as WordPress user #${user.id}: ${user.name || user.slug}`
  );

  const requiredCapabilities = ["edit_posts", "manage_categories"];
  assertWordPressCapabilities(user, requiredCapabilities);
  console.log("Required capabilities look present: edit_posts, manage_categories.");

  const drafts = await fetchWordPressRest(
    config,
    "/posts?status=draft&context=edit&per_page=1&_fields=id,slug,status"
  );

  if (!drafts.ok) {
    throw new Error(
      `Draft read check failed at ${drafts.url} with ${drafts.status}: ${drafts.text.slice(
        0,
        700
      )}`
    );
  }

  console.log("Draft read check passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
