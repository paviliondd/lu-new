import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { applyLexicalTranslations, auditPost, buildImportCandidate, collectLexicalUnits, translateJson, translationProvider, validateTranslationPackage, verifyTranslationCandidate } from "../scripts/translation-pipeline.mjs";
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

test("provider routing uses Anthropic Messages for Claude and OpenAI Chat Completions for GPT", () => {
  const previousAnthropic = process.env.ANTHROPIC_TRANSLATION_BASE_URL;
  const previousOpenAi = process.env.OPENAI_TRANSLATION_BASE_URL;
  process.env.ANTHROPIC_TRANSLATION_BASE_URL = "https://router.example";
  process.env.OPENAI_TRANSLATION_BASE_URL = "https://router.example/v1";
  try {
    assert.deepEqual(translationProvider("claude-opus-5"), {
      protocol: "anthropic-messages",
      endpoint: "https://router.example/v1/messages",
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
    });
    assert.equal(translationProvider("gpt-5.6-sol").protocol, "openai-chat-completions");
    assert.equal(translationProvider("gpt-5.6-sol").endpoint, "https://router.example/v1/chat/completions");
  } finally {
    if (previousAnthropic === undefined) delete process.env.ANTHROPIC_TRANSLATION_BASE_URL;
    else process.env.ANTHROPIC_TRANSLATION_BASE_URL = previousAnthropic;
    if (previousOpenAi === undefined) delete process.env.OPENAI_TRANSLATION_BASE_URL;
    else process.env.OPENAI_TRANSLATION_BASE_URL = previousOpenAi;
  }
});

test("translation falls back from a rejected Claude request to GPT using the correct wire protocols", async () => {
  const requests = [];
  const server = createServer(async (request, response) => {
    let raw = "";
    for await (const chunk of request) raw += chunk;
    requests.push({ url: request.url, headers: request.headers, body: JSON.parse(raw) });
    response.setHeader("content-type", "application/json");
    if (request.url === "/anthropic/v1/messages") {
      response.statusCode = 401;
      response.end(JSON.stringify({ error: { message: "unauthorized model client" } }));
      return;
    }
    response.end(JSON.stringify({ choices: [{ message: { content: '{"status":"ok"}' } }] }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const keys = ["OPENAI_API_KEY", "OPENAI_TRANSLATION_MODELS", "OPENAI_TRANSLATION_BASE_URL", "ANTHROPIC_TRANSLATION_BASE_URL"];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_TRANSLATION_MODELS = "claude-opus-5,gpt-5.6-sol";
    process.env.ANTHROPIC_TRANSLATION_BASE_URL = `http://127.0.0.1:${port}/anthropic`;
    process.env.OPENAI_TRANSLATION_BASE_URL = `http://127.0.0.1:${port}/openai/v1`;
    assert.deepEqual(await translateJson({ text: "Xin chao" }, "Return status."), { status: "ok" });
    assert.equal(requests.length, 2);
    assert.equal(requests[0].url, "/anthropic/v1/messages");
    assert.equal(requests[0].headers["anthropic-version"], "2023-06-01");
    assert.equal(requests[0].body.system.includes("Translate Vietnamese"), true);
    assert.equal(requests[1].url, "/openai/v1/chat/completions");
    assert.equal(requests[1].body.messages[0].role, "system");
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
    await new Promise((resolve) => server.close(resolve));
  }
});

test("offline translation packages require complete metadata and matching unit translations", () => {
  const valid = {
    formatVersion: 1,
    posts: [{
      id: 1,
      slug: "demo",
      source: { units: [{ id: 0, text: "Xin chao" }], legacyContent: null },
      translation: { title: "Title", excerpt: "Excerpt", seoTitle: "SEO", seoDescription: "Description", units: [{ id: 0, text: "Hello" }], legacyContent: null },
    }],
  };
  assert.deepEqual(validateTranslationPackage(valid), []);
  const invalid = structuredClone(valid);
  invalid.posts[0].translation.title = "";
  invalid.posts[0].translation.units[0].text = "";
  assert.deepEqual(validateTranslationPackage(invalid), [
    "demo: missing translation.title",
    "demo: missing translation unit 0",
  ]);
  assert.deepEqual(validateTranslationPackage({}), ["Invalid translation package format."]);
});

test("offline import reconstructs Lexical content and rejects a stale Vietnamese source", () => {
  const post = {
    id: 1,
    slug: "demo",
    contentRichVi: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Noi dung", version: 1 }] }] } },
    seo: {},
  };
  const entry = {
    id: 1,
    slug: "demo",
    source: { units: [{ id: 0, text: "Noi dung" }] },
    translation: { title: "Title", excerpt: "Excerpt", seoTitle: "SEO", seoDescription: "Description", units: [{ id: 0, text: "Content" }] },
  };
  const candidate = buildImportCandidate(post, entry);
  assert.equal(candidate.qa.passed, true);
  assert.equal(candidate.data.contentRichEn.root.children[0].children[0].text, "Content");
  const stale = structuredClone(entry);
  stale.source.units[0].text = "Old content";
  assert.throws(() => buildImportCandidate(post, stale), /Vietnamese source changed after export/);
});
