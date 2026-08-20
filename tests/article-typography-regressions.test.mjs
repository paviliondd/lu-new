import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("article reading rhythm uses one shared gap between content blocks", async () => {
  const [styles, codeStyles] = await Promise.all([
    readFile("src/app/globals.css", "utf8"),
    readFile("src/app/components/CodeBlock/code-theme.css", "utf8"),
  ]);

  assert.match(styles, /\.article-content\s*\{[\s\S]*?line-height:\s*1\.65/);
  assert.match(styles, /\.article-content\s*\{[\s\S]*?--article-block-space:\s*1\.25rem/);
  assert.match(styles, /\.article-content--reading\.prose :where\(h1, h2, h3, h4\)\s*\{[\s\S]*?margin-block:\s*var\(--article-block-space\)/);
  assert.match(styles, /\.article-content--reading\.prose p\s*\{\s*margin-bottom:\s*var\(--article-block-space\)/);
  assert.match(styles, /\.article-content--reading\.prose ul,[\s\S]*?margin-bottom:\s*var\(--article-block-space\)/);
  assert.match(styles, /\.article-content figure\s*\{[\s\S]*?margin:\s*var\(--article-block-space\) auto/);
  assert.match(styles, /\.article-table\s*\{[\s\S]*?margin:\s*var\(--article-block-space\) auto/);
  assert.match(styles, /\.article-image-fallback\s*\{[\s\S]*?margin-block:\s*var\(--article-block-space\)/);
  assert.match(codeStyles, /\.code-card\s*\{[\s\S]*?margin-block:\s*var\(--article-block-space\)/);
  assert.match(codeStyles, /@media \(max-width: 639px\)[\s\S]*?\.code-card\s*\{[\s\S]*?margin-block:\s*var\(--article-block-space\)/);
});

test("article titles and content headings use a reduced reading scale", async () => {
  const styles = await readFile("src/app/globals.css", "utf8");
  const article = await readFile("src/app/components/ArticleClient.tsx", "utf8");

  assert.match(styles, /\.article-title\s*\{[\s\S]*?font-size:\s*clamp\(1\.75rem, 3vw, 2\.75rem\)/);
  assert.match(styles, /\.article-content--reading\.prose h1\s*\{[\s\S]*?font-size:\s*clamp\(1\.875rem, 1\.65rem \+ 1\.1vw, 2\.5rem\)/);
  assert.match(styles, /\.article-content--reading\.prose h2\s*\{[\s\S]*?font-size:\s*clamp\(1\.5rem, 1\.35rem \+ 0\.65vw, 1\.875rem\)/);
  assert.match(styles, /\.article-content--reading\.prose h3\s*\{[\s\S]*?font-size:\s*clamp\(1\.1875rem, 1\.1rem \+ 0\.45vw, 1\.5rem\)/);
  assert.match(article, /text-\[clamp\(1\.75rem,3vw,2\.75rem\)\]/);
});
