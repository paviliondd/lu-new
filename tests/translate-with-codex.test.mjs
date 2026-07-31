import assert from "node:assert/strict";
import test from "node:test";
import { splitHtmlSafely, verifyLegacyTranslation } from "../scripts/translate-with-codex.mjs";

test("HTML splitting is lossless and respects paragraph boundaries", () => {
  const html = `<p>${"a".repeat(20)}</p>\n\n<p>${"b".repeat(20)}</p>\n\n<pre><code>apt update</code></pre>`;
  const chunks = splitHtmlSafely(html, 40);
  assert.equal(chunks.join(""), html);
  assert.ok(chunks.length > 1);
});

test("legacy translation QA preserves structure, protected attributes, and code", () => {
  const source = '<p class="lead">Cai dat</p><a href="https://example.com"><code>apt update</code></a>';
  const valid = '<p class="lead">Install</p><a href="https://example.com"><code>apt update</code></a>';
  assert.deepEqual(verifyLegacyTranslation(source, valid), []);
  assert.ok(verifyLegacyTranslation(source, valid.replace("https://example.com", "https://evil.example")).includes("html-structure-or-protected-attributes-changed"));
  assert.ok(verifyLegacyTranslation(source, valid.replace("apt update", "apt upgrade")).includes("code-block-changed"));
});
