import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import RichTextRenderer from "../src/app/components/RichTextRenderer/Renderer.tsx";
import { getCodeBlockLabels } from "../src/app/components/CodeBlock/labels.ts";
import { normalizeExcerpt } from "../src/lib/content/excerpt.ts";

test("double-escaped excerpts render as plain readable text", () => {
  assert.equal(
    normalizeExcerpt("LinuxUnity &amp;hellip; Ansible &amp;amp; DevOps"),
    "LinuxUnity … Ansible & DevOps",
  );
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
