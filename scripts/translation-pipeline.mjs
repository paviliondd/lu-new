import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(filename), "..");

export function loadEnvFile(filePath = path.join(rootDir, ".env")) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    if (!process.env[key]) process.env[key] = value;
  }
}

function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function hasContent(value) {
  if (typeof value === "string") return Boolean(value.trim());
  if (Array.isArray(value)) return value.some(hasContent);
  if (!isObject(value)) return false;
  if (typeof value.text === "string" && value.text.trim()) return true;
  return Object.values(value).some(hasContent);
}

const protectedNodeTypes = new Set(["code", "code-highlight", "terminal", "fileTree", "upload", "horizontalrule"]);
const protectedKeys = new Set(["commands", "tree", "code", "language", "filename", "url", "src", "href", "id"]);
const translatableBlockKeys = new Set(["body", "title", "caption", "explanation"]);

export function collectLexicalUnits(value) {
  const units = [];
  const visit = (node, pathParts = [], inheritedProtected = false) => {
    if (Array.isArray(node)) {
      node.forEach((item, index) => visit(item, [...pathParts, index], inheritedProtected));
      return;
    }
    if (!isObject(node)) return;

    const nodeType = typeof node.type === "string" ? node.type : "";
    const nodeProtected = inheritedProtected || protectedNodeTypes.has(nodeType);
    for (const [key, child] of Object.entries(node)) {
      const childPath = [...pathParts, key];
      if (typeof child === "string") {
        const isTextNode = key === "text" && nodeType === "text";
        const isBlockCopy = translatableBlockKeys.has(key);
        if (!nodeProtected && !protectedKeys.has(key) && (isTextNode || isBlockCopy) && child.trim()) {
          units.push({ id: units.length, path: childPath, text: child });
        }
      } else {
        visit(child, childPath, nodeProtected || protectedKeys.has(key));
      }
    }
  };
  visit(value);
  return units;
}

function setAtPath(target, pathParts, value) {
  let current = target;
  for (let index = 0; index < pathParts.length - 1; index += 1) current = current[pathParts[index]];
  current[pathParts.at(-1)] = value;
}

export function applyLexicalTranslations(source, translatedUnits) {
  const clone = structuredClone(source);
  for (const unit of translatedUnits) setAtPath(clone, unit.path, unit.translation);
  return clone;
}

function lexicalStructure(value) {
  const clone = structuredClone(value);
  for (const unit of collectLexicalUnits(clone)) setAtPath(clone, unit.path, "__TRANSLATABLE_TEXT__");
  return clone;
}

function containsVietnameseDiacritics(value) {
  return /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/iu.test(String(value || ""));
}

export function verifyTranslationCandidate(post, data) {
  const issues = [];
  if (!data.titleEn?.trim()) issues.push("missing-title-en");
  if (!data.excerptEn?.trim()) issues.push("missing-excerpt-en");
  if (!data.seo?.titleEn?.trim() || !data.seo?.descriptionEn?.trim()) issues.push("missing-seo-en");
  if (post.contentRichVi && data.contentRichEn) {
    const sourceStructure = JSON.stringify(lexicalStructure(post.contentRichVi));
    const targetStructure = JSON.stringify(lexicalStructure(data.contentRichEn));
    if (sourceStructure !== targetStructure) issues.push("lexical-structure-changed");
  }
  const targetText = JSON.stringify(data.contentRichEn || data.contentEn || "");
  if (containsVietnameseDiacritics(targetText)) issues.push("possible-vietnamese-remains");
  return { passed: issues.length === 0, issues };
}

export function auditPost(post) {
  const viRich = hasContent(post.contentRichVi);
  const enRich = hasContent(post.contentRichEn);
  const viLegacy = hasContent(post.contentVi);
  const enLegacy = hasContent(post.contentEn);
  const titleEn = hasContent(post.titleEn);
  const excerptEn = hasContent(post.excerptEn);
  const seoEn = hasContent(post.seo?.titleEn) && hasContent(post.seo?.descriptionEn);
  const sourceText = JSON.stringify(post.contentRichVi || post.contentVi || "");
  const status = enRich && titleEn && excerptEn && seoEn
    ? "complete-rich"
    : (enRich || enLegacy || titleEn || excerptEn ? "partial" : "missing");
  return {
    id: post.id,
    slug: post.slug,
    publicationStatus: post.status,
    translationStatus: status,
    source: viRich ? "contentRichVi" : (viLegacy ? "contentVi" : "none"),
    target: enRich ? "contentRichEn" : (enLegacy ? "contentEn" : "none"),
    lexicalUnits: viRich ? collectLexicalUnits(post.contentRichVi).length : 0,
    estimatedSourceTokens: Math.ceil(sourceText.length / 4),
  };
}

function parseArgs(argv) {
  const options = { mode: "audit", limit: 0, apply: false, slugs: [], outputDir: path.join(rootDir, ".translation-work") };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--mode") options.mode = argv[++index];
    else if (arg === "--limit") options.limit = Number(argv[++index] || 0);
    else if (arg === "--slug") options.slugs.push(argv[++index]);
    else if (arg === "--apply") options.apply = true;
    else if (arg === "--output-dir") options.outputDir = path.resolve(argv[++index]);
    else if (arg === "--snapshot") options.snapshot = path.resolve(argv[++index]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!new Set(["audit", "translate", "rollback"]).has(options.mode)) throw new Error(`Invalid mode: ${options.mode}`);
  if (options.mode === "rollback" && (!options.apply || !options.snapshot)) {
    throw new Error("Rollback requires --apply and --snapshot <file>.");
  }
  return options;
}

function endpoint() {
  return process.env.OPENAI_TRANSLATION_BASE_URL || "https://agentrouter.org/v1/chat/completions";
}

function model() {
  return process.env.OPENAI_TRANSLATION_MODEL || process.env.OPENAI_MODEL || "claude-opus-5";
}

function extractOutput(payload) {
  if (typeof payload.output_text === "string") return payload.output_text;
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((item) => item.text || "").join("");
  return "";
}

async function translateJson(input, schemaDescription) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required for translate mode.");
  const instructions = [
    "Translate Vietnamese technical documentation into natural professional English.",
    "Preserve product names, URLs, placeholders, inline code, commands and formatting exactly.",
    `Return JSON only. ${schemaDescription}`,
  ].join(" ");
  const target = endpoint();
  const isResponses = target.includes("/responses");
  const requestBody = isResponses
    ? { model: model(), store: false, instructions, input: JSON.stringify(input) }
    : { model: model(), temperature: 0.1, messages: [{ role: "system", content: instructions }, { role: "user", content: JSON.stringify(input) }] };
  const response = await fetch(target, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`Translation API ${response.status}: ${raw.slice(0, 300)}`);
  const output = extractOutput(JSON.parse(raw)).replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
  const match = output.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Translation API did not return a JSON object.");
  return JSON.parse(match[0]);
}

async function translateMetadata(post) {
  return translateJson({
    title: post.titleVi || post.slug,
    excerpt: post.excerptVi || "",
    seoTitle: post.seo?.titleVi || post.titleVi || post.slug,
    seoDescription: post.seo?.descriptionVi || post.excerptVi || "",
  }, "Object keys must be title, excerpt, seoTitle, seoDescription.");
}

async function translateLexical(source) {
  const units = collectLexicalUnits(source);
  const translated = [];
  for (let start = 0; start < units.length; start += 40) {
    const batch = units.slice(start, start + 40);
    const result = await translateJson({ units: batch.map(({ id, text }) => ({ id, text })) }, "Return an object with a units array; each item must contain the same numeric id and translated text.");
    const byId = new Map((result.units || []).map((item) => [Number(item.id), String(item.text || "")]));
    for (const unit of batch) {
      const translation = byId.get(unit.id);
      if (!translation) throw new Error(`Missing translated Lexical unit ${unit.id}.`);
      translated.push({ ...unit, translation });
    }
  }
  return { content: applyLexicalTranslations(source, translated), units: translated.length };
}

async function translateLegacyHtml(source) {
  const result = await translateJson({ content: source }, "Return an object with a content string. Preserve all HTML tags and code blocks exactly.");
  if (typeof result.content !== "string" || !result.content.trim()) throw new Error("Missing translated legacy content.");
  return result.content;
}

async function getPayloadClient() {
  if (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) throw new Error("DATABASE_URL and PAYLOAD_SECRET are required.");
  const [{ getPayload }, { default: config }] = await Promise.all([import("payload"), import("../src/payload.config.ts")]);
  return getPayload({ config });
}

async function readPosts(payload, options) {
  const posts = [];
  let page = 1;
  while (true) {
    const result = await payload.find({ collection: "posts", depth: 0, limit: 100, page, overrideAccess: true, sort: "id" });
    posts.push(...result.docs);
    if (!result.hasNextPage) break;
    page = result.nextPage;
  }
  let selected = posts;
  if (options.slugs.length) selected = selected.filter((post) => options.slugs.includes(post.slug));
  if (options.limit > 0) selected = selected.slice(0, options.limit);
  return selected;
}

async function writeJson(outputDir, name, value) {
  await fsp.mkdir(outputDir, { recursive: true });
  const filePath = path.join(outputDir, name);
  await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return filePath;
}

async function runAudit(payload, options) {
  const posts = await readPosts(payload, options);
  const rows = posts.map(auditPost);
  const summary = rows.reduce((acc, row) => {
    acc.total += 1;
    acc[row.translationStatus] = (acc[row.translationStatus] || 0) + 1;
    acc.estimatedSourceTokens += row.estimatedSourceTokens;
    return acc;
  }, { total: 0, "complete-rich": 0, partial: 0, missing: 0, estimatedSourceTokens: 0 });
  const report = { generatedAt: new Date().toISOString(), summary, posts: rows };
  const reportPath = await writeJson(options.outputDir, "translation-audit.json", report);
  console.log(JSON.stringify({ reportPath, summary }, null, 2));
}

async function runTranslate(payload, options) {
  const posts = (await readPosts(payload, options)).filter((post) => auditPost(post).translationStatus !== "complete-rich");
  if (!options.limit && !options.slugs.length) throw new Error("Translate mode requires --limit or one or more --slug values.");
  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(3).toString("hex")}`;
  const snapshots = [];
  const candidates = [];
  for (const post of posts) {
    console.log(`[translate] ${post.slug}`);
    const metadata = await translateMetadata(post);
    let contentRichEn = post.contentRichEn;
    let contentEn = post.contentEn;
    let translatedUnits = 0;
    if (hasContent(post.contentRichVi)) {
      const result = await translateLexical(post.contentRichVi);
      contentRichEn = result.content;
      translatedUnits = result.units;
    } else if (hasContent(post.contentVi)) {
      contentEn = await translateLegacyHtml(post.contentVi);
    }
    const data = {
      titleEn: metadata.title,
      excerptEn: metadata.excerpt,
      contentRichEn,
      contentEn,
      seo: { ...(post.seo || {}), titleEn: metadata.seoTitle, descriptionEn: metadata.seoDescription },
    };
    snapshots.push({ id: post.id, slug: post.slug, before: { titleEn: post.titleEn, excerptEn: post.excerptEn, contentRichEn: post.contentRichEn, contentEn: post.contentEn, seo: post.seo } });
    const qa = verifyTranslationCandidate(post, data);
    candidates.push({ id: post.id, slug: post.slug, translatedUnits, qa, data });
    if (options.apply && !qa.passed) throw new Error(`QA failed for ${post.slug}: ${qa.issues.join(", ")}`);
    if (options.apply) await payload.update({ collection: "posts", id: post.id, data, depth: 0, overrideAccess: true });
  }
  const snapshotPath = await writeJson(options.outputDir, `${runId}-snapshot.json`, { runId, applied: options.apply, posts: snapshots });
  const candidatePath = await writeJson(options.outputDir, `${runId}-candidates.json`, { runId, applied: options.apply, model: model(), posts: candidates });
  console.log(JSON.stringify({ applied: options.apply, translated: candidates.length, snapshotPath, candidatePath }, null, 2));
}

async function runRollback(payload, options) {
  const snapshot = JSON.parse(await fsp.readFile(options.snapshot, "utf8"));
  for (const post of snapshot.posts || []) {
    await payload.update({ collection: "posts", id: post.id, data: post.before, depth: 0, overrideAccess: true });
    console.log(`[rollback] ${post.slug}`);
  }
}

export async function main(argv = process.argv.slice(2)) {
  loadEnvFile();
  const options = parseArgs(argv);
  const payload = await getPayloadClient();
  if (options.mode === "audit") await runAudit(payload, options);
  else if (options.mode === "translate") await runTranslate(payload, options);
  else await runRollback(payload, options);
}

if (process.argv[1] && path.resolve(process.argv[1]) === filename) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
