import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("homepage fetches only six posts and three series without rendering the carousel", async () => {
  const [route, homepage, recent, publishedPosts, payloadCms] = await Promise.all([
    readFile("src/app/[lang]/page.tsx", "utf8"),
    readFile("src/app/components/pages/HomePage.tsx", "utf8"),
    readFile("src/app/components/RecentWritingSection.tsx", "utf8"),
    readFile("src/app/components/usePublishedPosts.ts", "utf8"),
    readFile("src/lib/cms/payload.ts", "utf8"),
  ]);

  assert.match(route, /getCmsPublishedPosts\(lang, 6\)/);
  assert.match(route, /getCmsSeries\(lang, 3\)/);
  assert.doesNotMatch(homepage, /FeaturedPostsCarousel/);
  assert.match(homepage, /localePath\("\/blog\/series"\)/);
  assert.match(homepage, />\s*Collections\s*</);
  assert.match(recent, /usePublishedPosts\(initialPosts, 6\)/);
  assert.match(recent, /\.slice\(0, 6\)/);
  assert.match(publishedPosts, /&limit=\$\{requestedLimit\}/);
  assert.match(payloadCms, /sort: requestedLimit === undefined \? "titleVi" : "-createdAt"/);
});

test("table of contents uses observer-based scroll spy and keeps active links visible", async () => {
  const toc = await readFile("src/app/components/TableOfContents.tsx", "utf8");

  assert.match(toc, /new IntersectionObserver/);
  assert.match(toc, /rootMargin: "-160px 0px -50% 0px"/);
  assert.match(toc, /scrollIntoView\(\{/);
  assert.match(toc, /block: "nearest"/);
  assert.match(toc, /behavior: "smooth"/);
  assert.match(toc, /sticky top-24 max-h-\[calc\(100vh-6rem\)\] overflow-y-auto/);
  assert.doesNotMatch(toc, /addEventListener\("scroll"/);
});

test("media deployment initializes volume ownership and installs the Sharp WASM fallback", async () => {
  const [compose, dockerfile, packageJson] = await Promise.all([
    readFile("docker-compose.yml", "utf8"),
    readFile("Dockerfile", "utf8"),
    readFile("package.json", "utf8"),
  ]);

  assert.match(compose, /media-permissions:[\s\S]*user: "0:0"/);
  assert.match(compose, /chown -R 1001:1001 \/app\/public\/uploads/);
  assert.match(compose, /condition: service_completed_successfully/);
  assert.equal(
    (dockerfile.match(/npm install --no-save --package-lock=false --force @img\/sharp-wasm32@0\.34\.5/g) || []).length,
    2,
  );
  const dependencies = JSON.parse(packageJson).dependencies;
  assert.equal(dependencies.sharp, "0.34.5");
});
