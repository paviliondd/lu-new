import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("footer stays focused and the journey pipeline remains motion-safe", async () => {
  const [footer, home, hero, styles, newsletter, smtp] = await Promise.all([
    readFile("src/app/components/Footer.tsx", "utf8"),
    readFile("src/app/components/pages/HomePage.tsx", "utf8"),
    readFile("src/app/components/HeroRecentWritingSection.tsx", "utf8"),
    readFile("src/app/globals.css", "utf8"),
    readFile("src/app/components/NewsletterSection.tsx", "utf8"),
    readFile("src/lib/newsletter/smtp.ts", "utf8"),
  ]);

  assert.match(footer, /<p[^>]*>Explore<\/p>/);
  assert.doesNotMatch(footer, /Cloud infrastructure notes|Explore · Learn · Share/);
  assert.match(footer, /<NewsletterSection compact \/>/);
  assert.match(footer, /lg:grid-cols-\[minmax\(0,1fr\)_10rem_minmax\(0,1fr\)\]/);
  assert.match(footer, /lg:text-left/);
  assert.doesNotMatch(footer, /GitHub|LinkedIn|RSS/);
  assert.match(home, /<NewsletterSection \/>/);
  assert.match(newsletter, /if \(compact\) \{/);
  assert.match(newsletter, />\s*Newsletter\s*<\/h2>/);
  assert.match(newsletter, /aria-label="Subscribe"/);
  assert.match(newsletter, /max-w-\[17rem\]/);
  assert.match(newsletter, /Enter your email address to subscribe\./);
  assert.doesNotMatch(newsletter, /required/);
  assert.match(newsletter, /placeholder="Your email address\.\.\."/);
  assert.match(smtp, /https:\/\/linuxunity\.com\/vi\/blog/);
  assert.match(hero, /pipeline-flow/);
  assert.match(styles, /@keyframes pipelineFlow/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
