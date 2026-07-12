import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const rootDir = path.resolve(dirname, "..");

function walkLexical(value, visit) {
  if (!value || typeof value !== "object") return;
  visit(value);
  const children = value.children || value.root?.children;
  if (Array.isArray(children)) {
    for (const child of children) walkLexical(child, visit);
  }
}

function lexicalHasRawFence(value) {
  let found = false;
  walkLexical(value, (node) => {
    if (typeof node.text === "string" && node.text.includes("```")) found = true;
  });
  return found;
}

function reportRawFence(source, slug, field, value) {
  const hasFence = typeof value === "string" ? value.includes("```") : lexicalHasRawFence(value);
  if (hasFence) {
    console.log(`[raw-fence] ${source} ${slug} ${field}`);
  }
}

function reportLinkedImages(source, slug, field, value) {
  if (typeof value !== "string") return;
  const linkedImagePattern = /<a\b[^>]*href=["'][^"']+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^"']*)?["'][^>]*>\s*<img\b/gi;
  if (linkedImagePattern.test(value)) {
    console.log(`[linked-image] ${source} ${slug} ${field}`);
  }
}

async function auditPayload() {
  if (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) return false;

  const [{ getPayload }, { default: config }] = await Promise.all([
    import("payload"),
    import("../src/payload.config.ts"),
  ]);
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "posts",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
  });

  for (const doc of result.docs) {
    const slug = doc.slug || doc.id;
    reportRawFence("payload", slug, "contentRichVi", doc.contentRichVi);
    reportRawFence("payload", slug, "contentRichEn", doc.contentRichEn);
    reportRawFence("payload", slug, "contentVi", doc.contentVi);
    reportRawFence("payload", slug, "contentEn", doc.contentEn);
    reportLinkedImages("payload", slug, "contentVi", doc.contentVi);
    reportLinkedImages("payload", slug, "contentEn", doc.contentEn);
  }

  return true;
}

async function auditFiles() {
  const postsDir = path.join(rootDir, "content", "posts");
  const files = await fs.readdir(postsDir).catch(() => []);
  for (const file of files) {
    if (file.toLowerCase() === "readme.md") continue;
    if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;
    const content = await fs.readFile(path.join(postsDir, file), "utf8");
    reportRawFence("file", file, "content", content);
    reportLinkedImages("file", file, "content", content);
  }
}

const usedPayload = await auditPayload();
if (!usedPayload) await auditFiles();
