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
  assert.match(footer, /lg:grid-cols-3/);
  assert.match(footer, /lg:justify-self-start/);
  assert.match(footer, /lg:justify-self-center lg:text-center/);
  assert.match(footer, /lg:justify-center/);
  assert.match(newsletter, /lg:justify-self-end lg:text-left/);
  assert.doesNotMatch(footer, /GitHub|LinkedIn|RSS/);
  assert.match(home, /<NewsletterSection \/>/);
  assert.match(newsletter, /if \(compact\) \{/);
  assert.match(newsletter, />\s*Subscribe for updates\s*<\/h2>/);
  assert.doesNotMatch(newsletter, /Get notified when a new post is published\./);
  assert.match(newsletter, /aria-label="Subscribe"/);
  assert.match(newsletter, /max-w-\[17rem\]/);
  assert.match(newsletter, /Enter your email address to subscribe\./);
  assert.doesNotMatch(newsletter, /required/);
  assert.match(newsletter, /placeholder="Your email address\.\.\."/);
  assert.match(smtp, /https:\/\/linuxunity\.com\/vi\/blog/);
  assert.match(hero, /pipeline-node--\$\{idx\}/);
  assert.match(hero, /pipeline-connector--\$\{idx\}/);
  assert.match(styles, /@keyframes pipelineNodeExplore/);
  assert.match(styles, /@keyframes pipelineNodeLearn/);
  assert.match(styles, /@keyframes pipelineNodeShare/);
  assert.match(styles, /@keyframes pipelineConnectorLearn/);
  assert.match(styles, /@keyframes pipelineConnectorShare/);
  assert.match(styles, /30s[^;]*infinite/);
  assert.doesNotMatch(styles, /15s[^;]*infinite/);
  assert.match(styles, /#f97316|rgb\(249 115 22/);
  assert.match(styles, /#10b981|rgb\(16 185 129/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
