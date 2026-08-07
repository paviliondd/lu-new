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

test("code language labels use familiar display casing automatically", () => {
  assert.equal(formatLanguageLabel("html"), "HTML");
  assert.equal(formatLanguageLabel("python"), "Python");
  assert.equal(formatLanguageLabel("golang"), "Go");
  assert.equal(formatLanguageLabel("markdown"), "Markdown");
  assert.equal(formatLanguageLabel("bash"), "Bash");
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

test("code auto-detection identifies YAML and Bash snippets or stays blank", () => {
  assert.equal(detectCodeLanguage("name: Install httpd\nname: Copy Site Files"), "yaml");
  assert.equal(detectCodeLanguage("tasks:\n  - install httpd\n  - start httpd"), "yaml");
  assert.equal(detectCodeLanguage('eval "$(ssh-agent -s)"'), "bash");
  assert.equal(detectCodeLanguage("ssh-add <path_to_private_key>"), "bash");
  assert.equal(formatLanguageLabel("", "name: Install httpd"), "YAML");
  assert.equal(formatLanguageLabel("", 'eval "$(ssh-agent -s)"'), "Bash");
  assert.equal(formatLanguageLabel("", "just regular text"), "");
  assert.equal(normalizeCodeLabel("plaintext", "just regular text"), "");
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
