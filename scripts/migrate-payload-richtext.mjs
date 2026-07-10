import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { convertMarkdownToLexical } from "@payloadcms/richtext-lexical";
import { getPayload } from "payload";
import config from "../src/payload.config.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const backupDir = path.resolve(dirname, "../backups");

function legacyCanConvert(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return Boolean(trimmed) && !trimmed.startsWith("<");
}

function findField(fields, name) {
  for (const field of fields || []) {
    if (field.name === name) return field;
    if (field.fields) {
      const nested = findField(field.fields, name);
      if (nested) return nested;
    }
    if (field.tabs) {
      for (const tab of field.tabs) {
        const nested = findField(tab.fields, name);
        if (nested) return nested;
      }
    }
  }
  return null;
}

function richTextIsEmpty(value) {
  if (!value || typeof value !== "object") return true;
  const children = value.root?.children;
  return !Array.isArray(children) || children.length === 0;
}

async function main() {
  if (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) {
    throw new Error("DATABASE_URL and PAYLOAD_SECRET are required.");
  }

  const payload = await getPayload({ config });
  const postsCollection = payload.config.collections.find((collection) => collection.slug === "posts");
  const contentRichVi = findField(postsCollection?.fields, "contentRichVi");
  const contentRichEn = findField(postsCollection?.fields, "contentRichEn");
  const editorConfig = contentRichVi?.editor?.editorConfig || contentRichEn?.editor?.editorConfig;

  if (!editorConfig) {
    throw new Error("Unable to resolve sanitized Lexical editor config from Payload.");
  }

  const result = await payload.find({
    collection: "posts",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
  });

  await mkdir(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `payload-posts-richtext-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  await writeFile(backupPath, JSON.stringify(result.docs, null, 2), "utf8");

  let updated = 0;
  let skippedHtml = 0;

  for (const doc of result.docs) {
    const data = {};

    if (richTextIsEmpty(doc.contentRichVi) && legacyCanConvert(doc.contentVi)) {
      data.contentRichVi = convertMarkdownToLexical({ editorConfig, markdown: doc.contentVi });
    } else if (richTextIsEmpty(doc.contentRichVi) && typeof doc.contentVi === "string" && doc.contentVi.trim().startsWith("<")) {
      skippedHtml += 1;
    }

    if (richTextIsEmpty(doc.contentRichEn) && legacyCanConvert(doc.contentEn)) {
      data.contentRichEn = convertMarkdownToLexical({ editorConfig, markdown: doc.contentEn });
    } else if (richTextIsEmpty(doc.contentRichEn) && typeof doc.contentEn === "string" && doc.contentEn.trim().startsWith("<")) {
      skippedHtml += 1;
    }

    if (Object.keys(data).length === 0) continue;

    await payload.update({
      collection: "posts",
      id: doc.id,
      data,
      overrideAccess: true,
    });
    updated += 1;
  }

  payload.logger.info({
    backupPath,
    skippedHtml,
    total: result.docs.length,
    updated,
  }, "Payload rich text migration finished");
}

await main();
