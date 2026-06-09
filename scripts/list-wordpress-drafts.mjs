const wordpressUrl = process.env.WORDPRESS_URL;
const username = process.env.WORDPRESS_USERNAME;
const appPassword = process.env.WORDPRESS_APP_PASSWORD;
const limit = Number(process.env.WORDPRESS_DRAFT_LIMIT || 20);

if (!wordpressUrl || !username || !appPassword) {
  throw new Error(
    "Missing WORDPRESS_URL, WORDPRESS_USERNAME, or WORDPRESS_APP_PASSWORD."
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

async function main() {
  const fields = "id,date,modified,slug,status,type,title,author";
  const response = await fetch(
    `${apiBase}/posts?status=draft&context=edit&orderby=modified&order=desc&per_page=${limit}&_fields=${fields}`,
    {
      headers: {
        Authorization: authHeader,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Draft lookup failed with ${response.status}: ${text.slice(0, 700)}`
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
