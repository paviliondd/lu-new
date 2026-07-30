import fs from "node:fs";
import path from "node:path";
import pg from "pg";

// Zero-dependency .env loader for production containers
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const { Pool } = pg;

function translationEndpoint() {
  return process.env.OPENAI_TRANSLATION_BASE_URL || "https://agentrouter.org/v1/chat/completions";
}

const candidateModels = [
  process.env.OPENAI_TRANSLATION_MODEL || process.env.OPENAI_MODEL || "claude-opus-5",
  "gpt-5.6-sol",
  "claude-opus-4-8",
].filter((item, index, self) => Boolean(item) && self.indexOf(item) === index);

function extractText(payload) {
  if (typeof payload.output_text === "string") return payload.output_text;
  if (Array.isArray(payload.choices) && payload.choices[0]?.message?.content) {
    return payload.choices[0].message.content;
  }
  return "";
}

async function requestTranslationWithModel(apiKey, post, model) {
  const endpoint = translationEndpoint();
  const isChatCompletions = endpoint.includes("chat/completions") || !endpoint.includes("responses");

  const cleanContent = (post.content_vi || "").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  const inputPayload = {
    title: post.title_vi || post.slug,
    description: post.excerpt_vi || post.seo_description_vi || "",
    content: cleanContent,
  };

  const instructions =
    "You are an expert technical translator. Translate the provided Vietnamese technology article into natural English for software engineering documentation. Preserve all HTML formatting, code snippets, inline code, and JSON/YAML structures exactly. Return a valid JSON object with keys: title, description, content.";

  const body = isChatCompletions
    ? JSON.stringify({
        model,
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: JSON.stringify(inputPayload) },
        ],
        temperature: 0.2,
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

  const rawText = await response.text().catch(() => "");
  if (!response.ok) {
    throw new Error(`API request failed [${response.status}]: ${rawText}`);
  }

  let parsedResponse = {};
  try {
    parsedResponse = JSON.parse(rawText);
  } catch {
    throw new Error(`Invalid JSON response from server: ${rawText.slice(0, 150)}`);
  }

  const rawJson = extractText(parsedResponse);
  if (!rawJson) throw new Error("Empty translation output received from API.");

  const cleaned = rawJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
}

async function translatePostWithAI(apiKey, post) {
  let lastError = null;

  for (const model of candidateModels) {
    try {
      if (model !== candidateModels[0]) {
        console.log(`   🔄 Retrying translation using fallback model "${model}"...`);
      }
      return await requestTranslationWithModel(apiKey, post, model);
    } catch (err) {
      lastError = err;
      const isContentBlocked = err.message.includes("content-blocked");
      if (isContentBlocked) {
        console.warn(`   ⚠️ Model "${model}" hit Agent Router content-blocked guard. Trying next fallback model...`);
      } else {
        console.warn(`   ⚠️ Model "${model}" failed: ${err.message}. Trying next fallback model...`);
      }
    }
  }

  throw lastError || new Error("All candidate models failed to translate post.");
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
