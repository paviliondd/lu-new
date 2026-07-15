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
  assert.match(html, /Sao chép/);
  assert.match(html, /Tải file/);
  assert.match(html, /inventory\.ini/);
  assert.match(html, /echo &lt;LinuxUnity&gt; &amp;&amp; printf/);
  assert.doesNotMatch(html, /data-enhanced|code-shell/);
});
