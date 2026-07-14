import assert from "node:assert/strict";
import test from "node:test";
import { codeToHtml } from "shiki";

import {
  formatCodeSource,
  languageFromClass,
  normalizeCodeLabel,
  normalizeLanguage,
} from "../src/app/components/CodeBlock/syntax.ts";

test("code language aliases resolve to Shiki languages", () => {
  assert.equal(normalizeLanguage("js"), "javascript");
  assert.equal(normalizeLanguage("TS"), "typescript");
  assert.equal(normalizeLanguage("yml"), "yaml");
  assert.equal(normalizeLanguage("md"), "markdown");
  assert.equal(languageFromClass("foo language-json bar"), "json");
});

test("valid JSON is formatted with two-space indentation", () => {
  assert.equal(
    formatCodeSource('{"Version":"2012-10-17"}', "json"),
    '{\n  "Version": "2012-10-17"\n}'
  );
});

test("invalid JSON and non-JSON code are preserved", () => {
  assert.equal(formatCodeSource('{"Version":}', "json"), '{"Version":}');
  assert.equal(formatCodeSource("echo hello", "bash"), "echo hello");
});

test("plain-text labels stay hidden while useful metadata remains", () => {
  assert.equal(normalizeCodeLabel("plaintext"), "");
  assert.equal(normalizeCodeLabel("iam-policy.json"), "iam-policy.json");
});

test("configured Shiki light and dark themes render together", async () => {
  const html = await codeToHtml("const ready = true", {
    lang: "typescript",
    themes: {
      light: "github-light",
      dark: "dark-plus",
    },
  });

  assert.match(html, /shiki-themes github-light dark-plus/);
  assert.match(html, /style="color:#[0-9A-Fa-f]+;--shiki-dark:/);
  assert.match(html, /--shiki-dark:/);
});
