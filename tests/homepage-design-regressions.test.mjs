import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("compact newsletter uses one concise label aligned with the footer explore column", async () => {
  const [newsletter, footer] = await Promise.all([
    readFile("src/app/components/NewsletterSection.tsx", "utf8"),
    readFile("src/app/components/Footer.tsx", "utf8"),
  ]);

  assert.match(newsletter, />\s*Subscribe for updates\s*</);
  assert.doesNotMatch(newsletter, />\s*Get notified when a new post is published\.\s*</);
  assert.match(newsletter, /aria-labelledby="footer-newsletter-title"/);
  assert.match(footer, /lg:grid-cols-\[minmax\(0,1fr\)_10rem_17rem\]/);
});

test("homepage Journey lockup is larger and centered below Unity", async () => {
  const globalStyles = await readFile("src/app/globals.css", "utf8");

  assert.match(globalStyles, /\.hero-unity-lockup\s*\{[\s\S]*align-items: center/);
  assert.match(globalStyles, /\.hero-journey-word\s*\{[\s\S]*font-size: 0\.875em/);
  assert.match(globalStyles, /\.hero-journey-word\s*\{[\s\S]*margin-left: 1\.9em/);
});

test("authors support ordered optional social links and a responsive four-column team grid", async () => {
  const [payloadConfig, dataTypes, mapper, teamSection, article] = await Promise.all([
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/app/data.ts", "utf8"),
    readFile("src/lib/cms/payload.ts", "utf8"),
    readFile("src/app/components/MeetTheTeamSection.tsx", "utf8"),
    readFile("src/app/components/ArticleClient.tsx", "utf8"),
  ]);

  assert.match(payloadConfig, /name: "socials",\s*type: "group"/);
  assert.match(payloadConfig, /name: "twitter"/);
  assert.match(payloadConfig, /name: "website"/);
  assert.match(payloadConfig, /name: "order",\s*type: "number",\s*defaultValue: 0/);
  assert.match(dataTypes, /socials\?:\s*\{/);
  assert.match(mapper, /sort: "order"/);
  assert.match(mapper, /socials:\s*\{/);
  assert.match(teamSection, /Our People/i);
  assert.match(teamSection, /lg:grid-cols-4/);
  assert.match(teamSection, /member\.socials\?\.linkedin/);
  assert.match(teamSection, /member\.socials\?\.github/);
  assert.match(teamSection, /member\.socials\?\.twitter/);
  assert.match(teamSection, /member\.socials\?\.website/);
  assert.match(article, /author\.linkedin\s*&&/);
  assert.match(article, /author\.github\s*&&/);
});

test("article table removes inherited paragraph space below its final cell content", async () => {
  const globalStyles = await readFile("src/app/globals.css", "utf8");

  assert.match(globalStyles, /\.article-content \.article-table :where\(th, td\) > :last-child\s*\{\s*margin-bottom: 0/);
  assert.match(globalStyles, /\.article-content \.article-table :where\(th, td\) > :first-child\s*\{\s*margin-top: 0/);
});
