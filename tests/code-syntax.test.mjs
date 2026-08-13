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
import {
  detectCodeLanguageFromSource,
  heuristicDetectCodeLanguage,
} from "../src/lib/content/detect-code-language.ts";
import {
  resolveCodeBlockLanguage,
  unwrapMarkdownCodeFence,
} from "../src/lib/content/ascii-topology.ts";

test("code language aliases resolve to Shiki languages", () => {
  assert.equal(normalizeLanguage("js"), "javascript");
  assert.equal(normalizeLanguage("TS"), "typescript");
  assert.equal(normalizeLanguage("yml"), "yaml");
  assert.equal(normalizeLanguage("md"), "markdown");
  assert.equal(normalizeLanguage("golang"), "go");
  assert.equal(languageFromClass("foo language-json bar"), "json");
  assert.equal(normalizeLanguage("plain"), "text");
  assert.equal(normalizeLanguage("text"), "text");
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

test("explicit code language wins and plaintext opt-out is preserved", () => {
  assert.deepEqual(detectCodeLanguageFromSource("echo hello", "python"), {
    language: "python",
    source: "explicit",
  });
  assert.deepEqual(detectCodeLanguageFromSource("const ready = true", "plain"), {
    language: "text",
    source: "explicit",
  });
});

test("code language heuristics identify YAML HCL and Bash without a fence tag", () => {
  assert.equal(
    heuristicDetectCodeLanguage("apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web"),
    "yaml",
  );
  assert.equal(
    heuristicDetectCodeLanguage('resource "aws_instance" "web" {\n  instance_type = "t3.micro"\n}'),
    "hcl",
  );
  assert.equal(heuristicDetectCodeLanguage('export APP_ENV=prod\necho "$APP_ENV"'), "bash");
  assert.equal(heuristicDetectCodeLanguage("npm install highlight.js"), "bash");
  assert.equal(heuristicDetectCodeLanguage("cd /srv/app\nls -la"), "bash");
  assert.equal(
    heuristicDetectCodeLanguage(
      'module "vpc" {\n  source = "terraform-aws-modules/vpc/aws"\n  version = "5.0"\n}',
    ),
    "hcl",
  );
  assert.equal(heuristicDetectCodeLanguage("version=2\necho $version"), "bash");
  assert.equal(heuristicDetectCodeLanguage("source = documentation"), null);
});

test("Payload explicit language wins over an embedded fence while auto defers to it", () => {
  assert.equal(resolveCodeBlockLanguage("plain", "javascript"), "plain");
  assert.equal(resolveCodeBlockLanguage("text", "python"), "text");
  assert.equal(resolveCodeBlockLanguage("yaml", "bash"), "yaml");
  assert.equal(resolveCodeBlockLanguage("auto", "typescript"), "typescript");
  assert.equal(resolveCodeBlockLanguage("", "hcl"), "hcl");
  assert.equal(resolveCodeBlockLanguage("auto", ""), "auto");
});

test("automatic code detection uses a safe plaintext fallback for weak prose", () => {
  assert.deepEqual(detectCodeLanguageFromSource("This is a short explanatory sentence."), {
    language: "text",
    source: "fallback",
  });
});

test("plain fenced topology keeps meaningful leading spaces", () => {
  const topology = "```plain\n    ┌──────┐\n    │ web  │\n    └──────┘\n       │\n    database\n```";

  assert.deepEqual(unwrapMarkdownCodeFence(topology), {
    language: "plain",
    source: "    ┌──────┐\n    │ web  │\n    └──────┘\n       │\n    database",
  });
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
