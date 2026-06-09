import {
  buildRestRouteApiBase,
  buildWordPressRestUrl,
  normalizeWordPressApiBase,
} from "./wordpress-rest-url.mjs";

const wordpressUrl = process.env.WORDPRESS_URL;
const username = process.env.WORDPRESS_USERNAME;
const appPassword = process.env.WORDPRESS_APP_PASSWORD;
const limit = Number(process.env.WORDPRESS_DRAFT_LIMIT || 20);

if (!wordpressUrl || !username || !appPassword) {
  throw new Error(
    "Missing WORDPRESS_URL, WORDPRESS_USERNAME, or WORDPRESS_APP_PASSWORD."
  );
}

const apiBase = normalizeWordPressApiBase(
  process.env.WORDPRESS_API_BASE ||
    new URL(
      "wp-json/wp/v2/",
      wordpressUrl.endsWith("/") ? wordpressUrl : `${wordpressUrl}/`
    ).toString()
);
const fallbackApiBase = buildRestRouteApiBase(apiBase);

const authHeader = `Basic ${Buffer.from(`${username}:${appPassword}`).toString(
  "base64"
)}`;

async function main() {
  const fields = "id,date,modified,slug,status,type,title,author";
  const endpoint = `/posts?status=draft&context=edit&orderby=modified&order=desc&per_page=${limit}&_fields=${fields}`;
  let requestUrl = buildWordPressRestUrl(apiBase, endpoint);
  let response = await fetch(requestUrl, {
    headers: {
      Authorization: authHeader,
    },
  });
  let failedText = "";

  if (!response.ok) {
    failedText = await response.text();

    if (response.status === 404 && fallbackApiBase) {
      requestUrl = buildWordPressRestUrl(fallbackApiBase, endpoint);
      response = await fetch(requestUrl, {
        headers: {
          Authorization: authHeader,
        },
      });
      failedText = response.ok ? "" : await response.text();
    }
  }

  if (!response.ok) {
    throw new Error(
      `Draft lookup failed at ${requestUrl} with ${response.status}: ${failedText.slice(
        0,
        700
      )}`
    );
  }

  const drafts = await response.json();
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
