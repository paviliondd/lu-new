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
  const [config, route] = await Promise.all([
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/app/(payload)/api/payload/[[...slug]]/route.ts", "utf8"),
  ]);

  assert.match(config, /normalizeLegacyMediaSizes\(data\)/);
  assert.match(config, /resolveMediaDiskFile\(uploadDir, currentFilename/);
  assert.match(config, /req,\s*context:\s*\{\s*mediaRenameInProgress:\s*true/);
  assert.match(config, /Unable to rename media file/);
  assert.match(config, /renamedFiles\.reverse\(\)/);
  assert.match(route, /payloadResponse\.status !== 404/);
  assert.match(route, /"uploads", "imported", mediaFilename/);
  assert.match(route, /path\.posix\.basename/);
  assert.match(route, /path\.win32\.basename/);
});

test("code block controls and carousel regression fixes stay present", async () => {
  const [codeBlock, copyButton, renderer, payloadCms, carousel] = await Promise.all([
    readFile("src/app/components/CodeBlock/CodeBlock.tsx", "utf8"),
    readFile("src/app/components/CodeBlock/CopyButton.tsx", "utf8"),
    readFile("src/app/components/RichTextRenderer/Renderer.tsx", "utf8"),
    readFile("src/lib/cms/payload.ts", "utf8"),
    readFile("src/app/components/FeaturedPostsCarousel.tsx", "utf8"),
  ]);

  assert.match(codeBlock, /const isLong = totalLines > 10/);
  assert.match(codeBlock, /aria-controls/);
  assert.match(codeBlock, /noExplanationLabel/);
  assert.match(copyButton, /clipboardTimeoutMs/);
  assert.match(copyButton, /Promise\.race/);
  assert.match(renderer, /noExplanationLabel=\{noExplanationLabel\}/);
  assert.match(payloadCms, /Code:\s*\(\{ node \}/);
  assert.match(payloadCms, /data-code-explanation/);
  assert.match(carousel, /w-full shrink-0/);
  assert.doesNotMatch(carousel, /min-w-full/);
});
