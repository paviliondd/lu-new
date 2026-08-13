import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("footer keeps logo left, Explore centered, and Subscribe right", async () => {
  const [newsletter, footer] = await Promise.all([
    readFile("src/app/components/NewsletterSection.tsx", "utf8"),
    readFile("src/app/components/Footer.tsx", "utf8"),
  ]);

  assert.match(newsletter, />\s*Subscribe for updates\s*</);
  assert.doesNotMatch(newsletter, />\s*Get notified when a new post is published\.\s*</);
  assert.match(newsletter, /aria-labelledby="footer-newsletter-title"/);
  assert.match(footer, /lg:grid-cols-3/);
  assert.match(footer, /lg:justify-self-start/);
  assert.match(footer, /lg:justify-self-center lg:text-center/);
  assert.match(newsletter, /lg:justify-self-end lg:text-left/);
  assert.doesNotMatch(newsletter, /lg:mx-auto/);
});

test("homepage Journey starts below the i in Unity", async () => {
  const globalStyles = await readFile("src/app/globals.css", "utf8");

  assert.match(globalStyles, /\.hero-unity-lockup\s*\{[\s\S]*align-items: flex-start/);
  assert.match(globalStyles, /\.hero-journey-word\s*\{[\s\S]*font-size: 0\.875em/);
  assert.match(globalStyles, /\.hero-journey-word\s*\{[\s\S]*margin-left: 3\.7em/);
});

test("authors preserve the deployed Payload schema while the team grid remains responsive", async () => {
  const [payloadConfig, dataTypes, mapper, teamSection, article] = await Promise.all([
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/app/data.ts", "utf8"),
    readFile("src/lib/cms/payload.ts", "utf8"),
    readFile("src/app/components/MeetTheTeamSection.tsx", "utf8"),
    readFile("src/app/components/ArticleClient.tsx", "utf8"),
  ]);

  assert.match(payloadConfig, /name: "linkedin", type: "text"/);
  assert.match(payloadConfig, /name: "github", type: "text"/);
  assert.doesNotMatch(payloadConfig, /name: "socials",\s*type: "group"/);
  assert.doesNotMatch(payloadConfig, /name: "order",\s*type: "number"/);
  assert.doesNotMatch(dataTypes, /socials\?:\s*\{/);
  assert.match(mapper, /sort: "name"/);
  assert.doesNotMatch(mapper, /socials:\s*\{/);
  assert.match(teamSection, /Our crew/);
  assert.match(teamSection, /text-teal-700 dark:text-emerald-300/);
  assert.match(teamSection, /items-center gap-3 text-xs font-bold uppercase tracking-\[0\.16em\]/);
  assert.doesNotMatch(teamSection, /Our People|Our team/i);
  assert.doesNotMatch(teamSection, /The Team Behind LinuxUnity/);
  assert.doesNotMatch(teamSection, /Engineers, creators, and problem solvers\./);
  assert.match(teamSection, /<header className="mb-10">/);
  assert.match(teamSection, /lg:grid-cols-4/);
  assert.match(teamSection, /member\.linkedin/);
  assert.match(teamSection, /member\.github/);
  assert.match(article, /author\.linkedin\s*&&/);
  assert.match(article, /author\.github\s*&&/);
});

test("article table removes inherited paragraph space below its final cell content", async () => {
  const globalStyles = await readFile("src/app/globals.css", "utf8");

  assert.match(globalStyles, /\.article-content \.article-table :where\(th, td\) > :last-child\s*\{\s*margin-bottom: 0/);
  assert.match(globalStyles, /\.article-content \.article-table :where\(th, td\) > :first-child\s*\{\s*margin-top: 0/);
});

test("large team avatars request an image matching their rendered size", async () => {
  const [avatar, teamSection] = await Promise.all([
    readFile("src/app/components/AuthorAvatar.tsx", "utf8"),
    readFile("src/app/components/MeetTheTeamSection.tsx", "utf8"),
  ]);

  assert.match(avatar, /sizes\?: string/);
  assert.match(avatar, /sizes=\{sizes\}/);
  assert.match(avatar, /quality=\{90\}/);
  assert.match(teamSection, /sizes="88px"/);
});
