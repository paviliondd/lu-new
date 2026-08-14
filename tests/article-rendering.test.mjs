import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";

import RichTextRenderer from "../src/app/components/RichTextRenderer/Renderer.tsx";
import { getCodeBlockLabels } from "../src/app/components/CodeBlock/labels.ts";
import { normalizeExcerpt } from "../src/lib/content/excerpt.ts";
import { sanitizeArticleHtml } from "../src/lib/utils/security.ts";

test("double-escaped excerpts render as plain readable text", () => {
  assert.equal(
    normalizeExcerpt("LinuxUnity &amp;hellip; Ansible &amp;amp; DevOps"),
    "LinuxUnity … Ansible & DevOps",
  );
});

test("article HTML cannot keep layout utility classes that overlap published text", () => {
  const html = sanitizeArticleHtml(
    '<div class="absolute -mt-16 grid leading-none richtext-block richtext-block--note"><p class="fixed translate-y-8 note-box">Stable copy</p><code class="language-bash line">echo ok</code></div>',
  );

  assert.doesNotMatch(html, /\b(?:absolute|fixed|-mt-16|grid|leading-none|translate-y-8)\b/);
  assert.match(html, /class="richtext-block richtext-block--note"/);
  assert.match(html, /class="note-box"/);
  assert.match(html, /class="language-bash line"/);
});

test("code toolbar is present in the initial React render", () => {
  const source = "echo &lt;LinuxUnity&gt; &amp;&amp; printf 'tiếng Việt'\n";
  const html = renderToStaticMarkup(
    React.createElement(RichTextRenderer, {
      content: `<p>Mở đầu</p><pre data-language="bash" data-filename="inventory.ini"><code class="language-bash">${source}</code></pre>`,
      contentKey: "test-vi",
      labels: getCodeBlockLabels("vi"),
    }),
  );

  assert.match(html, /class="code-card"/);
  assert.match(html, /lucide-copy/);
  assert.match(html, /Copy/);
  assert.doesNotMatch(html, /inventory\.ini/);
  assert.match(html, /echo &lt;LinuxUnity&gt; &amp;&amp; printf/);
  assert.doesNotMatch(html, /data-enhanced|code-shell/);
});

test("ASCII topology renders as a dedicated topology figure instead of a code card", () => {
  const source = "Internet\n  |\n  IGW\n  |\n  |________|\nPublic     Private\n  |          |\nEC2        RDS";
  const html = renderToStaticMarkup(
    React.createElement(RichTextRenderer, {
      content: `<pre><code class="language-text">${source}</code></pre>`,
      contentKey: "topology-test",
      labels: getCodeBlockLabels("vi"),
    }),
  );

  assert.match(html, /topology-shell--ascii/);
  assert.match(html, /data-topology-ascii="true"/);
  assert.doesNotMatch(html, /class="code-card"/);
  assert.doesNotMatch(html, />Topology</);
});

test("article tables render with a separate toolbar and accessible actions", () => {
  const html = renderToStaticMarkup(
    React.createElement(RichTextRenderer, {
      content: "<table><thead><tr><th>Số lượng</th><th>Đánh giá</th></tr></thead><tbody><tr><td>24 bài</td><td>Đủ sàn</td></tr></tbody></table>",
      contentKey: "table-test-vi",
      labels: getCodeBlockLabels("vi"),
    }),
  );

  assert.match(html, /class="article-table"/);
  assert.match(html, /class="article-table__header"/);
  assert.match(html, /aria-label="Copy table"/);
  assert.match(html, /aria-label="Download table"/);
  assert.match(html, /Số lượng/);
});

test("article content crosses the language client boundary as one serializable atomic body", async () => {
  const [articleLayout, articleTable, articlePage, articleContent] = await Promise.all([
    readFile("src/app/components/ArticleClient.tsx", "utf8"),
    readFile("src/app/components/ArticleTable/ArticleTable.tsx", "utf8"),
    readFile("src/app/[lang]/blog/[slug]/page.tsx", "utf8"),
    readFile("src/app/components/ArticleContent.tsx", "utf8"),
  ]);

  assert.doesNotMatch(articleLayout, /^\s*["']use client["'];/);
  assert.doesNotMatch(articleLayout, /children:\s*ReactNode/);
  assert.match(articleLayout, /<ArticleContent/);
  assert.doesNotMatch(articleTable, /^\s*["']use client["'];/);
  assert.match(articleTable, /ArticleTableActions/);
  assert.doesNotMatch(articlePage, /<RichTextRenderer/);
  assert.match(articlePage, /content=\{localizedPost\.content\}/);
  assert.match(articleContent, /^\s*["']use client["'];/);
  assert.match(articleContent, /useEffect/);
  assert.match(articleContent, /aria-busy=\{!ready\}/);
  assert.match(articleContent, /hidden=\{!ready\}/);
  assert.match(articleContent, /<RichTextRenderer/);
});
