import assert from "node:assert/strict";
import test from "node:test";
import { applyLexicalTranslations, auditPost, collectLexicalUnits, verifyTranslationCandidate } from "../scripts/translation-pipeline.mjs";
import { readFile } from "node:fs/promises";

test("collectLexicalUnits translates prose but preserves code and terminal commands", () => {
  const source = { root: { type: "root", children: [
    { type: "paragraph", children: [{ type: "text", text: "Triển khai an toàn", version: 1 }] },
    { type: "code", language: "bash", children: [{ type: "text", text: "kubectl apply -f app.yaml", version: 1 }] },
    { type: "block", fields: { blockType: "note", title: "Lưu ý", body: "Giữ bí mật an toàn" } },
    { type: "block", fields: { blockType: "terminal", commands: "aws sts get-caller-identity" } },
  ] } };
  const units = collectLexicalUnits(source);
  assert.deepEqual(units.map((unit) => unit.text), ["Triển khai an toàn", "Lưu ý", "Giữ bí mật an toàn"]);
  const translated = applyLexicalTranslations(source, units.map((unit) => ({ ...unit, translation: `EN:${unit.text}` })));
  assert.equal(translated.root.children[0].children[0].text, "EN:Triển khai an toàn");
  assert.equal(translated.root.children[1].children[0].text, "kubectl apply -f app.yaml");
  assert.equal(translated.root.children[3].fields.commands, "aws sts get-caller-identity");
  assert.equal(source.root.children[0].children[0].text, "Triển khai an toàn");
});

test("auditPost distinguishes rich completion from partial and missing translations", () => {
  const base = { id: 1, slug: "demo", status: "published", titleVi: "Bài", contentRichVi: { root: { children: [{ type: "text", text: "Nội dung" }] } } };
  assert.equal(auditPost(base).translationStatus, "missing");
  assert.equal(auditPost({ ...base, titleEn: "Post" }).translationStatus, "partial");
  assert.equal(auditPost({ ...base, titleEn: "Post", excerptEn: "Excerpt", contentRichEn: { root: { children: [{ type: "text", text: "Content" }] } }, seo: { titleEn: "SEO", descriptionEn: "Description" } }).translationStatus, "complete-rich");
});

test("verifyTranslationCandidate rejects changed Lexical structure and Vietnamese remnants", () => {
  const source = { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Nội dung", version: 1 }] }] } };
  const post = { contentRichVi: source };
  const validContent = structuredClone(source);
  validContent.root.children[0].children[0].text = "English content";
  const base = { titleEn: "Title", excerptEn: "Excerpt", seo: { titleEn: "SEO", descriptionEn: "Description" } };
  assert.equal(verifyTranslationCandidate(post, { ...base, contentRichEn: validContent }).passed, true);
  const changed = { root: { type: "root", children: [{ type: "text", text: "Vẫn còn tiếng Việt", version: 1 }] } };
  const result = verifyTranslationCandidate(post, { ...base, contentRichEn: changed });
  assert.equal(result.passed, false);
  assert.ok(result.issues.includes("lexical-structure-changed"));
  assert.ok(result.issues.includes("possible-vietnamese-remains"));
});

test("translation runner isolates failures and supports fallback resume controls", async () => {
  const source = await readFile("scripts/translation-pipeline.mjs", "utf8");
  assert.match(source, /OPENAI_TRANSLATION_MODELS/);
  assert.match(source, /AbortSignal\.timeout\(120_000\)/);
  assert.match(source, /\[429, 500, 502, 503, 504\]/);
  assert.match(source, /--resume/);
  assert.match(source, /--max-source-tokens/);
  assert.match(source, /failures\.push/);
  assert.match(source, /-failures\.json/);
  assert.match(source, /start \+= 25/);
});
