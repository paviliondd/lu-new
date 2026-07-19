import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { test } from "node:test";

const execFileAsync = promisify(execFile);

test("legacy WordPress table of contents is removed while article headings remain", async () => {
  const script = `
    const { sanitizeArticleHtml } = require("./src/lib/utils/security.ts");
    const result = sanitizeArticleHtml(
      '<div id="ez-toc-container"><p>Nội dung</p><ul><li>Section</li></ul></div><h2 id="section">Section</h2>'
    );
    process.stdout.write(result);
  `;
  const { stdout } = await execFileAsync(
    process.execPath,
    ["--require", "tsx/cjs", "--eval", script],
    { cwd: process.cwd() }
  );

  assert.doesNotMatch(stdout, /ez-toc-container|Nội dung/);
  assert.match(stdout, /<h2 id="section">Section<\/h2>/);
});

test("legacy media fallback and rename guards stay wired", async () => {
  const [config, route, payloadCms] = await Promise.all([
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/app/(payload)/api/payload/[[...slug]]/route.ts", "utf8"),
    readFile("src/lib/cms/payload.ts", "utf8"),
  ]);

  assert.match(config, /normalizeLegacyMediaSizes\(data\)/);
  assert.match(config, /resolveMediaDiskFile\(uploadDir, currentFilename/);
  assert.match(config, /req,\s*context:\s*\{\s*mediaRenameInProgress:\s*true/);
  assert.match(config, /Không thể đổi tên tệp media/);
  assert.match(config, /afterRead:[\s\S]*hydrateLegacyMediaDocument/);
  assert.match(config, /normalizeLegacyMediaDocumentURL\(doc\)/);
  assert.match(config, /if \(findMany\) return normalizedDoc/);
  assert.match(config, /renamedFiles\.reverse\(\)/);
  assert.match(route, /if \(!\(await mediaFileStats\(rootPath\)\)\)/);
  assert.match(route, /if \(importedResponse\) return importedResponse/);
  assert.match(route, /"uploads", "imported", mediaFilename/);
  assert.match(route, /path\.posix\.basename/);
  assert.match(route, /path\.win32\.basename/);
  assert.match(route, /return Response\.redirect\(redirectURL, 307\)/);
  assert.match(payloadCms, /preferredMediaURL as mediaUrl/);
});

test("legacy imported media URLs take priority without changing native media URLs", async () => {
  const { preferredMediaURL } = await import("../src/lib/cms/media-url.ts");

  assert.equal(
    preferredMediaURL({
      url: "/api/payload/media/file/legacy.png",
      thumbnailURL: "/uploads/imported/legacy.png",
    }),
    "/uploads/imported/legacy.png",
  );
  assert.equal(
    preferredMediaURL({
      url: "/api/payload/media/file/native.png",
      thumbnailURL: "/api/payload/media/file/native.png",
    }),
    "/api/payload/media/file/native.png",
  );
  assert.equal(
    preferredMediaURL({
      url: "/api/payload/media/file/native.png",
      sizes: { og: { url: "/api/payload/media/file/native-og.png" } },
    }),
    "/api/payload/media/file/native-og.png",
  );
});

test("code blocks render as stable React components with accessible copy and download", async () => {
  const [codeBlock, copyButton, copyUtility, downloadButton, renderer, payloadCms, carousel] = await Promise.all([
    readFile("src/app/components/CodeBlock/CodeBlock.tsx", "utf8"),
    readFile("src/app/components/CodeBlock/CopyButton.tsx", "utf8"),
    readFile("src/app/components/CodeBlock/copyText.ts", "utf8"),
    readFile("src/app/components/CodeBlock/DownloadButton.tsx", "utf8"),
    readFile("src/app/components/RichTextRenderer/Renderer.tsx", "utf8"),
    readFile("src/lib/cms/payload.ts", "utf8"),
    readFile("src/app/components/FeaturedPostsCarousel.tsx", "utf8"),
  ]);

  assert.match(codeBlock, /const isLong = totalLines > 20/);
  assert.match(codeBlock, /<CopyCodeButton code=\{code\}/);
  assert.match(codeBlock, /<DownloadCodeButton code=\{code\}/);
  assert.doesNotMatch(codeBlock, /useEffect|querySelectorAll|createElement|showModal/);
  assert.match(copyButton, /import \{ Check, Copy, LoaderCircle, TriangleAlert \}/);
  assert.match(copyButton, /<Copy className="code-copy-button__icon"/);
  assert.doesNotMatch(copyButton, /code-copy-button__symbol|code-copy-button__label|⧉/);
  assert.match(copyButton, /aria-live="polite"/);
  assert.match(copyButton, /disabled=\{state === "copying"\}/);
  assert.match(copyButton, /clearTimeout\(resetTimer\.current\)/);
  assert.doesNotMatch(copyUtility, /Promise\.race|clipboardTimeout/);
  assert.match(copyUtility, /document\.execCommand\("copy"\)/);
  assert.match(downloadButton, /sanitizeFilename/);
  assert.match(renderer, /from "html-react-parser"/);
  assert.match(renderer, /<CodeBlock/);
  assert.match(payloadCms, /Code:\s*\(\{ node \}/);
  assert.match(payloadCms, /data-code-explanation/);
  assert.match(payloadCms, /data-filename/);
  assert.match(carousel, /w-full shrink-0/);
  assert.doesNotMatch(carousel, /min-w-full/);
});

test("article title, hero, headings, media, and code share the reading column", async () => {
  const [articleClient, globalStyles] = await Promise.all([
    readFile("src/app/components/ArticleClient.tsx", "utf8"),
    readFile("src/app/globals.css", "utf8"),
  ]);

  assert.match(articleClient, /<header className="article-reading-frame/);
  assert.match(articleClient, /className="article-reading-frame relative aspect-\[2\/1\]/);
  assert.match(globalStyles, /--article-column-width: 46rem/);
  assert.match(globalStyles, /\.article-reading-frame\s*\{[\s\S]*max-width: var\(--article-column-width\)/);
  assert.match(
    globalStyles,
    /--article-wide-width: min\(100%, var\(--article-column-width\)\)/,
  );
  assert.match(
    globalStyles,
    /\.article-content__body :where\(h1, h2, h3, h4\)[\s\S]*margin-inline: auto/,
  );
  assert.match(articleClient, /xl:grid-cols-\[minmax\(0,820px\)_15rem\]/);
  assert.doesNotMatch(articleClient, /980px|1100px|1480px/);
});

test("featured carousel keeps autoplay and shows distinct following posts below", async () => {
  const [blogList, carousel] = await Promise.all([
    readFile("src/app/components/pages/BlogListPage.tsx", "utf8"),
    readFile("src/app/components/FeaturedPostsCarousel.tsx", "utf8"),
  ]);

  assert.match(blogList, /const featuredPosts = selectedTag \? \[\] : filteredPosts\.slice\(0, 3\)/);
  assert.match(blogList, /const followingPosts = selectedTag \? \[\] : filteredPosts\.slice\(3, 6\)/);
  assert.match(blogList, /<FeaturedPostsCarousel posts=\{featuredPosts\} followingPosts=\{followingPosts\}/);
  assert.match(carousel, /followingPosts: Post\[\]/);
  assert.match(carousel, /followingPosts\.map\(\(post\) =>/);
  assert.match(carousel, /window\.setInterval/);
  assert.match(carousel, /5500/);
  assert.doesNotMatch(carousel, /onClick=\{\(\) => selectSlide\(index\)\}[\s\S]*aria-pressed/);
});
