import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Media explicitly accepts SVG uploads and sanitizes their markup before storage", async () => {
  const config = await readFile("src/payload.config.ts", "utf8");

  assert.match(config, /mimeTypes:\s*\["image\/\*",\s*"image\/svg\+xml"\]/);
  assert.match(config, /sanitizeSvgUpload/);
  assert.match(config, /beforeChange:\s*\[/);
});

test("SVG upload sanitization removes active content while preserving safe vector markup", async () => {
  const { sanitizeSvgUpload } = await import("../src/lib/media/sanitize-svg-upload.ts");
  const result = sanitizeSvgUpload(`<?xml version="1.0"?>
    <svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">
      <script>alert(1)</script>
      <foreignObject><iframe src="https://attacker.example"></iframe></foreignObject>
      <a href="javascript:alert(1)"><rect width="10" height="10" /></a>
      <rect width="20" height="20" fill="#0f766e" />
    </svg>`);

  assert.match(result, /<svg\b/i);
  assert.match(result, /fill="#0f766e"/);
  assert.doesNotMatch(result, /<script\b|<foreignObject\b|\bonload\s*=|javascript:/i);
});

test("SVG upload sanitization rejects files that are not SVG documents", async () => {
  const { sanitizeSvgUpload } = await import("../src/lib/media/sanitize-svg-upload.ts");

  assert.throws(() => sanitizeSvgUpload("<html><body>not an SVG</body></html>"), /valid SVG/i);
});
