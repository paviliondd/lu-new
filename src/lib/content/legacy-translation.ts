import "server-only";

import crypto from "node:crypto";
import type { Post } from "@/app/data";
import { cachedJson } from "@/lib/server/redis-cache";

type TranslationScope = "summary" | "full";

interface TranslationPayload {
  title: string;
  description: string;
  content?: string;
}

const vietnamesePattern =
  /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;
const vietnameseWordsPattern =
  /\b(?:và|của|cho|trong|khi|để|với|những|các|bài|viết|hướng|dẫn|triển|khai|kiểm|thử|dịch|vụ)\b/i;

function hasVietnameseText(value = "") {
  return vietnamesePattern.test(value) || vietnameseWordsPattern.test(value);
}

function textContent(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function hashPayload(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 24);
}

function translationModel() {
  return process.env.OPENAI_TRANSLATION_MODEL || process.env.OPENAI_MODEL || "gpt-5.5";
}

function translationEndpoint() {
  return process.env.OPENAI_TRANSLATION_BASE_URL || "https://api.openai.com/v1/responses";
}

function shouldTranslate(post: Post, scope: TranslationScope) {
  if (!hasVietnameseText(`${post.title} ${post.description}`)) {
    return scope === "full" && hasVietnameseText(textContent(post.content));
  }

  return true;
}

function extractOutputText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") return payload.output_text;

  const output = Array.isArray(payload.output) ? payload.output : [];
  const parts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as { content?: unknown }).content)
      ? ((item as { content?: unknown[] }).content || [])
      : [];
    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== "object") continue;
      const text = (contentItem as { text?: unknown }).text;
      if (typeof text === "string") parts.push(text);
    }
  }

  return parts.join("\n").trim();
}

async function requestOpenAiTranslation(input: TranslationPayload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(translationEndpoint(), {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: translationModel(),
      store: false,
      instructions:
        "Translate Vietnamese technical blog content into natural English. Preserve HTML tags, code blocks, inline code, URLs, image paths, Markdown-like syntax inside code, product names, CLI commands, and JSON/YAML exactly. Return only valid JSON with keys title, description, and content when content is provided.",
      input: JSON.stringify(input),
    }),
  });

  if (!response.ok) {
    console.error("Legacy translation failed", {
      status: response.status,
      statusText: response.statusText,
    });
    return null;
  }

  const raw = extractOutputText((await response.json()) as Record<string, unknown>);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<TranslationPayload>;
    return {
      title: typeof parsed.title === "string" ? parsed.title : input.title,
      description:
        typeof parsed.description === "string" ? parsed.description : input.description,
      content:
        typeof input.content === "string"
          ? typeof parsed.content === "string"
            ? parsed.content
            : input.content
          : undefined,
    };
  } catch (error) {
    console.error("Legacy translation JSON parse failed", { error });
    return null;
  }
}

async function translatePayload(input: TranslationPayload, scope: TranslationScope) {
  const cacheKey = `translation:${scope}:${translationModel()}:${hashPayload(input)}`;
  return cachedJson<TranslationPayload | null>(cacheKey, 60 * 60 * 24 * 30, async () =>
    requestOpenAiTranslation(input)
  );
}

function readableList(values: string[]) {
  const items = values.filter(Boolean);
  if (items.length === 0) return "cloud engineering";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function synthesizeEnglishFallback(post: Post, scope: TranslationScope): TranslationPayload {
  const services = readableList(post.services);
  const certs = readableList(post.certs);
  const title = `${services}: ${post.category} practical guide`;
  const description = `A practical ${post.category} guide covering ${services}${
    post.certs.length > 0 ? ` for ${certs}` : ""
  }.`;
  const body = `<p>${description}</p><p>This English fallback is generated from article metadata. Add a dedicated English translation for the full article body.</p>`;

  return {
    title,
    description,
    ...(scope === "full" ? { content: body || `<p>${description}</p>` } : {}),
  };
}

export async function translateLegacyPostToEnglish(
  post: Post,
  scope: TranslationScope
): Promise<Post> {
  if (!shouldTranslate(post, scope)) return post;

  const input: TranslationPayload = {
    title: post.title,
    description: post.description,
    ...(scope === "full" ? { content: post.content } : {}),
  };
  const translated = (await translatePayload(input, scope)) || synthesizeEnglishFallback(post, scope);
  if (!translated) return post;

  return {
    ...post,
    title: translated.title || post.title,
    title_en: translated.title || post.title_en,
    description: translated.description || post.description,
    description_en: translated.description || post.description_en,
    content:
      scope === "full" && typeof translated.content === "string"
        ? translated.content
        : post.content,
    content_en:
      scope === "full" && typeof translated.content === "string"
        ? translated.content
        : post.content_en,
    seo: {
      ...post.seo,
      title: translated.title || post.seo.title,
      description: translated.description || post.seo.description,
    },
  };
}
