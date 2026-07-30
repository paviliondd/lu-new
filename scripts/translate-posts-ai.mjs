import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

function translationEndpoint() {
  return process.env.OPENAI_TRANSLATION_BASE_URL || "https://agentrouter.org/v1/chat/completions";
}

function translationModel() {
  return process.env.OPENAI_TRANSLATION_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
}

function extractText(payload) {
  if (typeof payload.output_text === "string") return payload.output_text;
  if (Array.isArray(payload.choices) && payload.choices[0]?.message?.content) {
    return payload.choices[0].message.content;
  }
  return "";
}

async function translatePostWithAI(apiKey, post) {
  const endpoint = translationEndpoint();
  const model = translationModel();
  const isChatCompletions = endpoint.includes("chat/completions") || !endpoint.includes("responses");

  const inputPayload = {
    title: post.title_vi || post.slug,
    description: post.excerpt_vi || post.seo_description_vi || "",
    content: post.content_vi || "",
  };

  const instructions =
    "Translate Vietnamese technical blog content into natural English. Preserve HTML tags, code blocks, inline code, URLs, image paths, Markdown-like syntax inside code, product names, CLI commands, and JSON/YAML exactly. Return only valid JSON object with keys: title, description, content.";

  const body = isChatCompletions
    ? JSON.stringify({
        model,
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: JSON.stringify(inputPayload) },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      })
    : JSON.stringify({
        model,
        store: false,
        instructions,
        input: JSON.stringify(inputPayload),
      });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`API request failed [${response.status}]: ${errorText}`);
  }

  const rawJson = extractText(await response.json());
  if (!rawJson) throw new Error("Empty translation output received from API.");

  const cleaned = rawJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ ERROR: OPENAI_API_KEY is not set in .env!");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();
  try {
    console.log("🔍 Checking posts in database for missing English translations...");
    const res = await client.query(`
      SELECT id, slug, title_vi, title_en, excerpt_vi, excerpt_en, content_vi, content_en
      FROM posts
      WHERE coalesce(nullif(trim(content_en), ''), nullif(trim(title_en), '')) IS NULL
      ORDER BY id ASC
    `);

    console.log(`Found ${res.rows.length} post(s) needing English translation.`);

    for (let i = 0; i < res.rows.length; i++) {
      const post = res.rows[i];
      console.log(`\n[${i + 1}/${res.rows.length}] Translating: "${post.title_vi || post.slug}"...`);

      try {
        const translated = await translatePostWithAI(apiKey, post);
        const titleEn = translated.title || post.title_vi || post.slug;
        const excerptEn = translated.description || post.excerpt_vi || "";
        const contentEn = translated.content || post.content_vi || "";

        await client.query(
          `
          UPDATE posts
          SET title_en = $1,
              excerpt_en = $2,
              seo_title_en = $1,
              seo_description_en = $2,
              content_en = $3,
              read_time_en = coalesce(read_time_en, read_time_vi, '5 min read'),
              updated_at = NOW()
          WHERE id = $4
        `,
          [titleEn, excerptEn, contentEn, post.id]
        );

        console.log(`✅ Successfully translated & saved post ID ${post.id} (${post.slug})`);
      } catch (err) {
        console.error(`❌ Failed to translate post ID ${post.id}:`, err.message);
      }
    }

    console.log("\n🎉 AI Translation process completed!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
