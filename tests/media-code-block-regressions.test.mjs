import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
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

test("malformed protocol-relative Payload media URLs become same-origin paths", async () => {
  const script = `
    const { sanitizeArticleHtml } = require("./src/lib/utils/security.ts");
    process.stdout.write(sanitizeArticleHtml(
      '<img src=//api/payload/media/file/example.png srcset="/uploads/imported/example.png 320w, //api/payload/media/file/example.png 640w"><source src=//api/payload/media/file/source.png>'
    ));
  `;
  const { stdout } = await execFileAsync(
    process.execPath,
    ["--require", "tsx/cjs", "--eval", script],
    { cwd: process.cwd() },
  );

  assert.match(stdout, /src="\/api\/payload\/media\/file\/example\.png"/);
  assert.match(stdout, /srcset="\/uploads\/imported\/example\.png 320w, \/api\/payload\/media\/file\/example\.png 640w"/);
  assert.match(stdout, /src="\/api\/payload\/media\/file\/source\.png"/);
  assert.doesNotMatch(stdout, /\/\/api\/payload/);
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
  assert.match(route, /Location: `\/uploads\/imported\/\$\{encodeURIComponent\(mediaFilename\)\}`/);
  assert.doesNotMatch(route, /redirectURL|Response\.redirect|0\.0\.0\.0/);
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
  const [codeBlock, copyButton, copyUtility, downloadButton, renderer, payloadCms, payloadConfig, highlighter, carousel] = await Promise.all([
    readFile("src/app/components/CodeBlock/CodeBlock.tsx", "utf8"),
    readFile("src/app/components/CodeBlock/CopyButton.tsx", "utf8"),
    readFile("src/app/components/CodeBlock/copyText.ts", "utf8"),
    readFile("src/app/components/CodeBlock/DownloadButton.tsx", "utf8"),
    readFile("src/app/components/RichTextRenderer/Renderer.tsx", "utf8"),
    readFile("src/lib/cms/payload.ts", "utf8"),
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/lib/content/highlight.ts", "utf8"),
    readFile("src/app/components/FeaturedPostsCarousel.tsx", "utf8"),
  ]);

  assert.match(codeBlock, /const isLong = totalLines > 20/);
  assert.match(codeBlock, /<CopyCodeButton code=\{code\}/);
  assert.doesNotMatch(codeBlock, /<DownloadCodeButton/);
  assert.doesNotMatch(codeBlock, /useEffect|querySelectorAll|createElement|showModal/);
  assert.match(copyButton, /import \{ Check, Copy, LoaderCircle, TriangleAlert \}/);
  assert.match(copyButton, /<Copy className="code-copy-button__icon"/);
  assert.match(copyButton, /code-copy-button__label/);
  assert.doesNotMatch(copyButton, /code-copy-button__symbol|⧉/);
  assert.match(copyButton, /aria-live="polite"/);
  assert.match(copyButton, /disabled=\{state === "copying"\}/);
  assert.match(copyButton, /clearTimeout\(resetTimer\.current\)/);
  assert.doesNotMatch(copyUtility, /Promise\.race|clipboardTimeout/);
  assert.match(copyUtility, /document\.execCommand\("copy"\)/);
  assert.match(downloadButton, /sanitizeFilename/);
  assert.match(renderer, /from "html-react-parser"/);
  assert.match(renderer, /<CodeBlock/);
  assert.match(payloadCms, /Code: renderCodeSnippet/);
  assert.match(payloadCms, /codeSnippet: renderCodeSnippet/);
  assert.match(payloadCms, /data-code-explanation/);
  assert.doesNotMatch(payloadCms, /data-filename/);
  assert.match(payloadCms, /topology-shell--ascii/);
  assert.match(payloadCms, /data-mermaid="true"/);
  assert.match(payloadCms, /resolveCodeBlockLanguage\(configuredLanguage, fenced\.language\)/);
  assert.match(payloadCms, /asString\(fields\.language, "auto"\)/);
  assert.doesNotMatch(payloadCms, /asString\(fields\.language, "text"\)/);
  assert.match(payloadCms, /fileTree:[\s\S]*terminal:/);
  assert.match(payloadConfig, /name: "language",[\s\S]*defaultValue: "auto"/);
  assert.match(highlighter, /detectCodeLanguageFromSource\(rawSource, originalLanguage\)/);
  assert.match(highlighter, /const language = detection\.language/);
  assert.doesNotMatch(highlighter, /\|\|\s*"text"/);
  assert.match(carousel, /w-full shrink-0/);
  assert.doesNotMatch(carousel, /min-w-full/);
});

test("Payload Admin keeps local media and safely renders Lexical blocks when client schema is missing", async () => {
  const [payloadConfig, packageJsonSource, dockerfile, importMap, lexicalPatch] = await Promise.all([
    readFile("src/payload.config.ts", "utf8"),
    readFile("package.json", "utf8"),
    readFile("Dockerfile", "utf8"),
    readFile("src/app/(payload)/admin/importMap.js", "utf8"),
    readFile("patches/@payloadcms+richtext-lexical+3.88.0.patch", "utf8"),
  ]);
  const packageJson = JSON.parse(packageJsonSource);

  assert.match(payloadConfig, /slug: "codeSnippet"/);
  assert.match(payloadConfig, /disableBlockName: true/);
  assert.match(payloadConfig, /blocks: \[codeBlock\]/);
  assert.doesNotMatch(payloadConfig, /const (?:noteBlock|topologyBlock)/);
  assert.doesNotMatch(payloadConfig, /slug: "Code"/);
  assert.doesNotMatch(payloadConfig, /s3Storage|S3_MEDIA_|MEDIA_CDN_URL/);
  assert.equal(packageJson.dependencies["@payloadcms/storage-s3"], undefined);
  assert.doesNotMatch(importMap, /@payloadcms\/storage-s3/);
  assert.equal(packageJson.scripts.postinstall, "patch-package");
  assert.equal(packageJson.dependencies["patch-package"], undefined);
  assert.equal(packageJson.devDependencies["patch-package"], "8.0.1");
  assert.equal((dockerfile.match(/COPY patches \.\/patches/g) || []).length, 1);
  assert.match(dockerfile, /FROM deps AS deps-prod/);
  assert.match(dockerfile, /npm ci --include=optional[\s\S]*npm prune --omit=dev/);
  assert.doesNotMatch(dockerfile, /npm ci --omit=dev/);
  assert.match(lexicalPatch, /blocksField\?\.blockReferences/);
});

test("production dependencies stay above audited security floors", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  const dependencies = packageJson.dependencies;

  assert.equal(dependencies.next, "16.3.0");
  assert.equal(dependencies.payload, "3.88.0");
  assert.equal(dependencies["@payloadcms/db-postgres"], "3.88.0");
  assert.equal(dependencies["@payloadcms/next"], "3.88.0");
  assert.equal(dependencies["@payloadcms/richtext-lexical"], "3.88.0");
  assert.equal(dependencies["@payloadcms/ui"], "3.88.0");
  assert.equal(dependencies.sharp, "0.35.3");
  assert.equal(dependencies.mermaid, "11.16.1");
  assert.equal(packageJson.overrides.dompurify, "3.4.13");
});

test("article body and technical panels share one balanced width while the TOC occupies the right track", async () => {
  const [articleClient, articleLoading, globalStyles, tableOfContents, renderer] = await Promise.all([
    readFile("src/app/components/ArticleClient.tsx", "utf8"),
    readFile("src/app/[lang]/blog/[slug]/loading.tsx", "utf8"),
    readFile("src/app/globals.css", "utf8"),
    readFile("src/app/components/TableOfContents.tsx", "utf8"),
    readFile("src/app/components/RichTextRenderer/Renderer.tsx", "utf8"),
  ]);

  assert.match(articleClient, /<header className="article-reading-frame/);
  assert.doesNotMatch(articleClient, /\{post\.description\}/);
  assert.match(articleClient, /className="article-reading-frame relative aspect-\[2\/1\]/);
  assert.match(articleClient, /max-w-\[1536px\]/);
  assert.match(
    articleClient,
    /2xl:grid-cols-\[minmax\(0,1fr\)_minmax\(0,56\.25rem\)_minmax\(0,1fr\)\]/,
  );
  assert.match(articleClient, /2xl:col-start-2 2xl:row-start-1/);
  assert.match(articleLoading, /2xl:col-start-2 2xl:row-start-1/);
  assert.match(articleLoading, /2xl:col-start-3 2xl:row-start-1/);
  assert.match(articleClient, /max-w-\[56\.25rem\]/);
  assert.match(globalStyles, /--article-column-width: 56\.25rem/);
  assert.match(globalStyles, /--article-reading-width: var\(--article-column-width\)/);
  assert.match(globalStyles, /\.article-reading-frame\s*\{[\s\S]*max-width: var\(--article-column-width\)/);
  assert.match(
    globalStyles,
    /--article-wide-width: min\(100%, var\(--article-column-width\)\)/,
  );
  assert.match(
    globalStyles,
    /\.article-content__body > :where\(h1, h2, h3, h4, p, ul, ol, blockquote, hr, aside\)[\s\S]*width: min\(100%, var\(--article-reading-width\)\)/,
  );
  assert.match(
    globalStyles,
    /\.article-content__body :where\(h1, h2, h3, h4\)[\s\S]*margin-inline: auto/,
  );
  assert.match(tableOfContents, /className="hidden w-full pl-8 2xl:col-start-3 2xl:row-start-1 2xl:block"/);
  assert.match(tableOfContents, /className="article-reading-frame[^\"]*2xl:hidden"/);
  assert.match(renderer, /article-content[\s\S]*max-w-full/);
  assert.doesNotMatch(renderer, /max-w-\[46rem\]/);
  assert.doesNotMatch(articleClient, /max-w-\[(?:1120|1200)px\]|minmax\(0,(?:46|50)rem\)/);
});

test("mobile code and topology panels stay compact and support touch scrolling", async () => {
  const [codeStyles, globalStyles] = await Promise.all([
    readFile("src/app/components/CodeBlock/code-theme.css", "utf8"),
    readFile("src/app/globals.css", "utf8"),
  ]);

  assert.match(codeStyles, /\.code-card__viewport\s*\{[\s\S]*overflow-x: auto;[\s\S]*overflow-y: hidden;[\s\S]*touch-action: pan-x pan-y/);
  assert.match(codeStyles, /@media \(max-width: 639px\)[\s\S]*\.code-card__header\s*\{[\s\S]*min-height: 2rem/);
  assert.match(codeStyles, /@media \(max-width: 639px\)[\s\S]*\.code-card__language\s*\{[\s\S]*display: inline-flex/);
  assert.match(codeStyles, /@media \(max-width: 639px\)[\s\S]*\.code-copy-button__label\s*\{[\s\S]*display: none/);
  assert.match(codeStyles, /@media \(max-width: 639px\)[\s\S]*\.code-card__code\s*\{[\s\S]*font-size: 0\.75rem;[\s\S]*line-height: 1\.55/);
  assert.match(globalStyles, /@media \(max-width: 640px\)[\s\S]*\.topology-shell\s*\{[\s\S]*overflow-x: auto;[\s\S]*overscroll-behavior-inline: contain/);
  assert.match(globalStyles, /@media \(max-width: 640px\)[\s\S]*pre\[data-topology-ascii="true"\][\s\S]*font-size: 0\.75rem;[\s\S]*line-height: 1\.45/);
  assert.match(globalStyles, /@media \(max-width: 640px\)[\s\S]*\.mermaid-shell__stage\s*\{[\s\S]*min-height: 10rem;[\s\S]*touch-action: pan-x pan-y/);
});

test("post view tracking and totals are fully disabled without dropping the legacy CMS column", async () => {
  const [articleClient, articleInteractions, postCard, hero, postListRow, payloadAdapter, payloadConfig, searchRoute] = await Promise.all([
    readFile("src/app/components/ArticleClient.tsx", "utf8"),
    readFile("src/app/components/ArticleInteractions.tsx", "utf8"),
    readFile("src/app/components/PostCard.tsx", "utf8"),
    readFile("src/app/components/HeroRecentWritingSection.tsx", "utf8"),
    readFile("src/app/components/PostListRow.tsx", "utf8"),
    readFile("src/lib/cms/payload.ts", "utf8"),
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/app/api/search/route.ts", "utf8"),
  ]);

  assert.doesNotMatch(articleClient, /ArticleViewCount|post\.views/);
  assert.doesNotMatch(articleInteractions, /ArticleViewCount|\/view|\bEye\b/);
  assert.doesNotMatch(postCard, /\bEye\b|formatCompactViews|post\.views|t\("views"\)/);
  assert.doesNotMatch(hero, /\bEye\b|post\.views|featuredPost\.views/);
  assert.doesNotMatch(postListRow, /\bEye\b|formatCompactViews|\{post\.views/);
  assert.doesNotMatch(payloadAdapter, /getLocalPostViews|incrementPayloadPostView|withLocalView/);
  assert.doesNotMatch(searchRoute, /\bviews\b/);
  assert.doesNotMatch(payloadConfig, /defaultColumns:\s*\[[^\]]*"views"/);
  assert.match(
    payloadConfig,
    /name: "views", type: "number", defaultValue: 0, min: 0, access: \{ read: \(\) => false \}, admin: \{ hidden: true \}/,
  );
  await assert.rejects(access("src/app/api/posts/[slug]/view/route.ts"), { code: "ENOENT" });
  await assert.rejects(access("src/lib/views/store.ts"), { code: "ENOENT" });
  assert.match(postListRow, /h-16 w-24[\s\S]*sm:h-20 sm:w-32/);
  assert.match(postListRow, /sizes="\(min-width: 640px\) 128px, 96px"/);
});

test("plain topology preserves alignment and article tables honor Markdown column alignment", async () => {
  const [globalStyles, renderer] = await Promise.all([
    readFile("src/app/globals.css", "utf8"),
    readFile("src/app/components/RichTextRenderer/Renderer.tsx", "utf8"),
  ]);

  assert.match(renderer, /isAsciiTopology\(fencedCode\.source, topologyLanguage\)/);
  assert.match(renderer, /data-topology-ascii="true"/);
  assert.match(globalStyles, /\.article-content \.topology-shell > pre\[data-topology-ascii="true"\][\s\S]*white-space: pre/);
  assert.match(globalStyles, /\.article-content \.topology-shell > pre\[data-topology-ascii="true"\][\s\S]*tab-size: 2/);
  assert.match(globalStyles, /\.article-content \.article-table table\s*\{[\s\S]*width: max-content;[\s\S]*min-width: 100%/);
  assert.match(globalStyles, /vertical-align: top/);
  assert.match(globalStyles, /:where\(th, td\)\[align="center"\][\s\S]*text-align: center/);
  assert.match(globalStyles, /:where\(th, td\)\[align="right"\][\s\S]*text-align: right/);
});

test("blog keeps its featured carousel while removing the visible Featured labels", async () => {
  const [blogList, carousel] = await Promise.all([
    readFile("src/app/components/pages/BlogListPage.tsx", "utf8"),
    readFile("src/app/components/FeaturedPostsCarousel.tsx", "utf8"),
  ]);

  assert.match(blogList, /import FeaturedPostsCarousel/);
  assert.match(blogList, /const featuredPosts = useMemo\([\s\S]*allPublishedPosts\.filter\(\(post\) => post\.status === "published"\)\.slice\(0, 3\)/);
  assert.match(blogList, /<FeaturedPostsCarousel posts=\{featuredPosts\}/);
  assert.match(blogList, /const reservedSlugs = new Set\(featuredPosts\.map\(\(post\) => post\.slug\)\)/);
  assert.match(carousel, /aria-label="Previous featured post"/);
  assert.match(carousel, /aria-label="Next featured post"/);
  assert.doesNotMatch(carousel, />\s*Featured\s*</);
});
