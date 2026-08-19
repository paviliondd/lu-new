import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("code cards size to short content and cap only at the article width", async () => {
  const styles = await readFile("src/app/components/CodeBlock/code-theme.css", "utf8");

  assert.match(styles, /\.code-card\s*\{[\s\S]*width: fit-content;[\s\S]*max-width: 100%/);
  assert.match(styles, /\.article-content__body > \.code-card\s*\{[\s\S]*width: fit-content;[\s\S]*max-width: min\(100%, var\(--article-wide-width, 100%\)\)/);
  assert.match(styles, /\.code-card__viewport\s*\{[\s\S]*max-width: 100%;[\s\S]*overflow-x: auto/);
  assert.doesNotMatch(styles, /\.code-card__preview\s*\{[^}]*min-height:/);
});

test("code cards keep a compact chrome while the source determines their width", async () => {
  const styles = await readFile("src/app/components/CodeBlock/code-theme.css", "utf8");

  assert.match(styles, /\.code-card__header\s*\{[\s\S]*?min-height:\s*2rem;/);
  assert.match(styles, /\.code-card__source\s*\{[\s\S]*?padding:\s*0\.65rem 0\.7rem;/);
  assert.match(styles, /\.code-card__source\s*\{[\s\S]*?min-width:\s*max-content;/);
});