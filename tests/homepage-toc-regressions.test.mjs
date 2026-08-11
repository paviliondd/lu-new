import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("homepage fetches six posts, three series, and CMS authors without rendering the carousel", async () => {
  const [route, homepage, publishedPosts, payloadCms] = await Promise.all([
    readFile("src/app/[lang]/page.tsx", "utf8"),
    readFile("src/app/components/pages/HomePage.tsx", "utf8"),
    readFile("src/app/components/usePublishedPosts.ts", "utf8"),
    readFile("src/lib/cms/payload.ts", "utf8"),
  ]);

  assert.match(route, /getCmsPublishedPosts\(lang, 6\)/);
  assert.match(route, /getCmsSeries\(lang, 3\)/);
  assert.match(route, /getCmsAuthors\(\)/);
  assert.doesNotMatch(homepage, /FeaturedPostsCarousel/);
  assert.match(homepage, /localePath\("\/blog\/series"\)/);
  assert.match(homepage, /collectionsLabel|Collections/);
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
  assert.match(toc, /w-52 xl:block/);
  assert.match(toc, /border-l-2 py-1\.5 pl-4/);
  assert.match(toc, /MobileTableOfContents/);
  assert.match(toc, /xl:hidden/);
  assert.doesNotMatch(toc, /addEventListener\("scroll"/);
});

test("media deployment uses S3 instead of a local volume and shares x64-v1 Sharp with Next", async () => {
  const [compose, dockerfile, packageJson] = await Promise.all([
    readFile("docker-compose.yml", "utf8"),
    readFile("Dockerfile", "utf8"),
    readFile("package.json", "utf8"),
  ]);

  assert.match(compose, /S3_MEDIA_BUCKET/);
  assert.match(compose, /MEDIA_CDN_URL/);
  assert.doesNotMatch(compose, /payload_media|media-permissions/);
  assert.match(compose, /translation-work-permissions:[\s\S]*chown -R 1001:1001 \/app\/\.translation-work/);
  assert.match(compose, /condition: service_completed_successfully/);
  assert.doesNotMatch(dockerfile, /sharp-wasm32|versions\.emscripten/);
  assert.equal(
    (dockerfile.match(/rm -rf node_modules\/next\/node_modules\/sharp/g) || []).length,
    2,
  );
  assert.equal((dockerfile.match(/Next and Payload must share Sharp 0\.33\.5/g) || []).length, 2);
  const parsedPackage = JSON.parse(packageJson);
  const dependencies = parsedPackage.dependencies;
  assert.equal(dependencies.sharp, "0.33.5");
});
