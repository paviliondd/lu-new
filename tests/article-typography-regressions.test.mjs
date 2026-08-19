import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("article reading rhythm uses compact, consistent line and block spacing", async () => {
  const styles = await readFile("src/app/globals.css", "utf8");

  assert.match(styles, /\.article-content\s*\{[\s\S]*?line-height:\s*1\.65/);
  assert.match(styles, /\.article-content--reading\.prose p\s*\{\s*margin-bottom:\s*1rem/);
  assert.match(styles, /\.article-content--reading\.prose ul,[\s\S]*?margin-bottom:\s*1rem/);
  assert.match(styles, /\.article-content--reading\.prose h2\s*\{[\s\S]*?margin-top:\s*2\.25rem;[\s\S]*?margin-bottom:\s*1rem/);
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
