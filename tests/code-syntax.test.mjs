import assert from "node:assert/strict";
import test from "node:test";
import { codeToHtml } from "shiki";

import {
  detectCodeLanguage,
  formatCodeSource,
  languageFromClass,
  normalizeCodeLabel,
  formatLanguageLabel,
  normalizeLanguage,
} from "../src/app/components/CodeBlock/syntax.ts";

test("code language aliases resolve to Shiki languages", () => {
  assert.equal(normalizeLanguage("js"), "javascript");
  assert.equal(normalizeLanguage("TS"), "typescript");
  assert.equal(normalizeLanguage("yml"), "yaml");
  assert.equal(normalizeLanguage("md"), "markdown");
  assert.equal(normalizeLanguage("golang"), "go");
  assert.equal(languageFromClass("foo language-json bar"), "json");
});

test("code language labels use lowercase display casing", () => {
  assert.equal(formatLanguageLabel("html"), "html");
  assert.equal(formatLanguageLabel("python"), "python");
  assert.equal(formatLanguageLabel("golang"), "go");
  assert.equal(formatLanguageLabel("markdown"), "markdown");
  assert.equal(formatLanguageLabel("bash"), "bash");
  assert.equal(formatLanguageLabel("hcl"), "hcl");
  assert.equal(formatLanguageLabel("terraform"), "terraform");
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

test("code language selection relies on explicit language input without auto-detection", () => {
  assert.equal(detectCodeLanguage("yaml"), "yaml");
  assert.equal(detectCodeLanguage("bash"), "bash");
  assert.equal(detectCodeLanguage("hcl"), "hcl");
  assert.equal(formatLanguageLabel("bash"), "bash");
  assert.equal(formatLanguageLabel("hcl"), "hcl");
  assert.equal(formatLanguageLabel("plaintext"), "");
  assert.equal(formatLanguageLabel(""), "");
  assert.equal(normalizeCodeLabel("plaintext"), "");
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
