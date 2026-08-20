import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("localized layout provides a keyboard skip link to the main content landmark", async () => {
  const layout = await readFile("src/app/[lang]/layout.tsx", "utf8");

  assert.match(layout, /href="#main-content"/);
  assert.match(layout, /<main\s+id="main-content"/);
});

test("localized layout declares light and dark browser theme colors", async () => {
  const layout = await readFile("src/app/[lang]/layout.tsx", "utf8");

  assert.match(layout, /export function generateViewport\(\)/);
  assert.match(layout, /themeColor:\s*\[\s*\{ media: "\(prefers-color-scheme: light\)", color: "#f7f8fb" \}/);
});

test("blog filters expose state and preserve text search in the URL", async () => {
  const [blog, blogRoute] = await Promise.all([
    readFile("src/app/components/pages/BlogListPage.tsx", "utf8"),
    readFile("src/app/[lang]/blog/page.tsx", "utf8"),
  ]);

  assert.match(blog, /params\.set\("q", search\.trim\(\)\)/);
  assert.match(blog, /name="q"/);
  assert.match(blog, /aria-label="Search articles"/);
  assert.match(blog, /aria-pressed=\{!selectedTopic\}/);
  assert.match(blog, /aria-pressed=\{isActive\}/);
  assert.match(blog, /initialSearch\?: string/);
  assert.match(blog, /const \[searchQuery, setSearchQuery\] = useState\(initialSearch\)/);
  assert.match(blogRoute, /q\?: string/);
  assert.match(blogRoute, /initialSearch=\{query\?\.q \|\| ""\}/);
  assert.match(blogRoute, /key=\{`blog:\$\{query\?\.page \|\| "1"\}:\$\{query\?\.tag \|\| ""\}:\$\{query\?\.topic \|\| ""\}:\$\{query\?\.q \|\| ""\}`\}/);
});

test("search modal and lightbox provide keyboard-safe dialogs", async () => {
  const modal = await readFile("src/app/components/SearchModal.tsx", "utf8");
  const lightbox = await readFile("src/app/components/ArticleImageEnhancer.tsx", "utf8");

  assert.match(modal, /role="dialog"/);
  assert.match(modal, /onKeyDown=\{handleDialogKeyDown\}/);
  assert.match(modal, /<button\s+type="button"[\s\S]*?aria-label="Close search"/);
  assert.match(lightbox, /role="dialog"/);
  assert.match(lightbox, /window\.addEventListener\("keydown", handleKeyDown\)/);
  assert.match(lightbox, /image\.setAttribute\("tabindex", "0"\)/);
});

test("feedback and article rhythm use accessible status and shared heading spacing", async () => {
  const newsletter = await readFile("src/app/components/NewsletterSection.tsx", "utf8");
  const comments = await readFile("src/app/components/Comments.tsx", "utf8");
  const styles = await readFile("src/app/globals.css", "utf8");

  assert.match(newsletter, /role="status"\s+aria-live="polite"/);
  assert.match(comments, /role="status"\s+aria-live="polite"/);
  assert.match(styles, /\.article-content--reading\.prose :where\(h1, h2, h3, h4\)\s*\{[\s\S]*?margin-block:\s*var\(--article-block-space\)/);
  assert.match(styles, /--space-section:\s*2\.25rem/);
});
