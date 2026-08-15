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
  assert.match(payloadCms, /Thành viên LinuxUnity chia sẻ kinh nghiệm thực tế/);
  assert.match(payloadCms, /A LinuxUnity team member sharing practical Cloud and DevOps experience/);
});

test("homepage Journey word is larger and starts below the i in Unity", async () => {
  const globalStyles = await readFile("src/app/globals.css", "utf8");

  assert.match(globalStyles, /\.hero-unity-lockup\s*\{[\s\S]*align-items: flex-start/);
  assert.match(globalStyles, /\.hero-unity-lockup\s*\{[\s\S]*width: fit-content/);
  assert.match(globalStyles, /\.hero-unity-lockup\s*\{[\s\S]*margin-inline: auto/);
  assert.match(globalStyles, /\.hero-journey-word\s*\{[\s\S]*font-size: 0\.875em/);
  assert.match(globalStyles, /\.hero-journey-word\s*\{[\s\S]*margin-left: 3\.7em/);
});

test("table of contents keeps active links visible without scrolling the document", async () => {
  const toc = await readFile("src/app/components/TableOfContents.tsx", "utf8");

  assert.match(toc, /new IntersectionObserver/);
  assert.match(toc, /rootMargin: "-160px 0px -50% 0px"/);
  assert.match(toc, /tocContainerRef/);
  assert.match(toc, /container\.scrollTo\(\{/);
  assert.match(toc, /behavior: "smooth"/);
  assert.doesNotMatch(toc, /scrollIntoView\(/);
  assert.match(toc, /sticky top-24 max-h-\[calc\(100vh-6rem\)\] overflow-y-auto/);
  assert.match(toc, /w-full pl-8 2xl:col-start-3 2xl:row-start-1 2xl:block/);
  assert.match(toc, /border-l-2 py-1\.5 pl-4/);
  assert.match(toc, /MobileTableOfContents/);
  assert.match(toc, /2xl:hidden/);
  assert.doesNotMatch(toc, /addEventListener\("scroll"/);
});

test("media deployment uses persistent local storage while S3 is disabled and shares secure Sharp with Next", async () => {
  const [compose, dockerfile, packageJson, sharpPatch, containerWorkflow] = await Promise.all([
    readFile("docker-compose.yml", "utf8"),
    readFile("Dockerfile", "utf8"),
    readFile("package.json", "utf8"),
    readFile("patches/sharp+0.35.3.patch", "utf8"),
    readFile(".github/workflows/validate-container.yml", "utf8"),
  ]);

  assert.doesNotMatch(compose, /S3_MEDIA_BUCKET|S3_MEDIA_REGION|S3_MEDIA_PREFIX|MEDIA_CDN_URL|S3_MEDIA_ACCESS_KEY_ID|S3_MEDIA_SECRET_ACCESS_KEY/);
  assert.match(compose, /payload_media:\/app\/public\/uploads/);
  assert.match(compose, /media-permissions:[\s\S]*chown -R 1001:1001 \/app\/public\/uploads/);
  assert.match(compose, /translation-work-permissions:[\s\S]*chown -R 1001:1001 \/app\/\.translation-work/);
  assert.match(compose, /condition: service_completed_successfully/);
  assert.match(dockerfile, /ARG LIBVIPS_VERSION=8\.18\.3/);
  assert.match(dockerfile, /-march=x86-64 -mtune=generic/);
  assert.match(dockerfile, /-mno-ssse3 -mno-sse4\.1 -mno-sse4\.2 -mno-popcnt -mno-avx -mno-avx2/);
  assert.match(dockerfile, /xz-utils/);
  assert.match(dockerfile, /-Dauto_features=disabled/);
  assert.match(dockerfile, /-Dhighway=disabled/);
  assert.match(dockerfile, /-Dorc=disabled/);
  assert.match(dockerfile, /SHARP_FORCE_GLOBAL_LIBVIPS=1/);
  assert.match(dockerfile, /npm explore sharp -- npm run build/);
  assert.match(dockerfile, /COPY --from=libvips-builder \/opt\/vips-legacy \/opt\/vips-legacy/);
  assert.match(dockerfile, /LD_LIBRARY_PATH=\/opt\/vips-legacy\/lib/);
  assert.doesNotMatch(dockerfile, /sharp-wasm32/);
  assert.equal(
    (dockerfile.match(/node_modules\/@img\/sharp-linux-x64/g) || []).length,
    6,
  );
  assert.equal(
    (dockerfile.match(/node_modules\/@img\/sharp-libvips-linux-x64/g) || []).length,
    6,
  );
  assert.equal(
    (dockerfile.match(/node_modules\/next\/node_modules\/sharp/g) || []).length,
    3,
  );
  assert.match(dockerfile, /sharp\.versions\.sharp !== '0\.35\.3'/);
  assert.match(dockerfile, /sharp\.versions\.vips !== '8\.18\.3'/);
  assert.match(dockerfile, /sharp\(input,[\s\S]*?\.png\(\)\.toBuffer\(\)/);
  assert.doesNotMatch(sharpPatch, /loadedPrebuilt/);
  assert.match(sharpPatch, /err\.code\?\.endsWith/);
  assert.match(containerWorkflow, /pull_request:/);
  assert.match(containerWorkflow, /target: runner/);
  assert.match(containerWorkflow, /push: false/);
  assert.match(containerWorkflow, /docker run --rm --entrypoint node/);
  const parsedPackage = JSON.parse(packageJson);
  const dependencies = parsedPackage.dependencies;
  const devDependencies = parsedPackage.devDependencies;
  assert.equal(dependencies.sharp, "0.35.3");
  assert.equal(devDependencies["node-addon-api"], "8.9.0");
  assert.equal(devDependencies["node-gyp"], "12.4.0");
});
