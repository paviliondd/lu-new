import assert from "node:assert/strict";
import test from "node:test";
import { applyLegacyHtmlTextUnits, collectLegacyHtmlTextUnits, protectCodeBlocks, splitHtmlSafely, translateValidatedHtmlChunk, verifyLegacyTranslation } from "../scripts/translate-with-codex.mjs";

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

test("legacy translation retries structural validation failures", async () => {
  const source = '<p class="lead">Xin chao</p>';
  const candidates = ['<p class="lead">Hello</p><p>Extra</p>', '<p class="lead">Hello</p>'];
  const attempts = [];
  const result = await translateValidatedHtmlChunk(source, 2, async (attempt) => {
    attempts.push(attempt);
    return candidates[attempt];
  });

  assert.equal(result, candidates[1]);
  assert.deepEqual(attempts, [0, 1]);
});

test("legacy HTML code is removed before translation and restored exactly", () => {
  const source = '<p>Cai dat</p><pre><code class="language-shell"> apt update &amp;&amp; apt install ansible</code></pre>';
  const protection = protectCodeBlocks(source);

  assert.equal(protection.protectedHtml, '<p>Cai dat</p><pre><code class="language-shell"></code></pre>');
  assert.equal(
    protection.restore('<p>Install</p><pre><code class="language-shell">hallucinated command</code></pre>'),
    '<p>Install</p><pre><code class="language-shell"> apt update &amp;&amp; apt install ansible</code></pre>',
  );
});

test("legacy HTML text-unit translation cannot change markup or code", () => {
  const source = '<p class="lead">Cai dat <strong>Ansible</strong></p><pre><code>apt update</code></pre>';
  const units = collectLegacyHtmlTextUnits(source);
  const translated = applyLegacyHtmlTextUnits(source, units, new Map([
    [0, "Install"],
    [1, "Ansible"],
  ]));

  assert.equal(translated, '<p class="lead">Install <strong>Ansible</strong></p><pre><code>apt update</code></pre>');
  assert.deepEqual(verifyLegacyTranslation(source, translated), []);
});

test("legacy HTML text units exclude multiline code containing blank lines", () => {
  const source = '<p>Huong dan</p><pre><code>first command\n\nsecond command</code></pre><p>Ket thuc</p>';
  const units = collectLegacyHtmlTextUnits(source);

  assert.deepEqual(units.map(({ text }) => text), ["Huong dan", "Ket thuc"]);
});
