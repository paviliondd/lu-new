import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Media explicitly accepts SVG uploads and sanitizes their markup before storage", async () => {
  const config = await readFile("src/payload.config.ts", "utf8");

  assert.match(config, /mimeTypes:\s*\["image\/\*",\s*"image\/svg\+xml",\s*"application\/xml"\]/);
  assert.match(config, /sanitizeSvgUpload/);
  assert.match(config, /application\/xml[\s\S]*isSvgUpload/);
  assert.match(config, /beforeChange:\s*\[/);
});

test("XML detected SVG files remain eligible for sanitization while XML files are not", async () => {
  const { isSvgUpload } = await import("../src/lib/media/sanitize-svg-upload.ts");
  const data = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" />');

  assert.equal(isSvgUpload({ data, mimetype: "application/xml", name: "topology.svg" }), true);
  assert.equal(isSvgUpload({ data, mimetype: "application/xml", name: "topology.xml" }), false);
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

test("SVG upload sanitization removes references whose unsafe protocols use XML entities", async () => {
  const { sanitizeSvgUpload } = await import("../src/lib/media/sanitize-svg-upload.ts");
  const result = sanitizeSvgUpload(`
    <svg xmlns="http://www.w3.org/2000/svg">
      <a href="jav&#x61;script:alert(1)"><rect width="10" height="10" /></a>
      <use xlink:href="data&#58;text/html,unsafe" />
      <use href="#safe-symbol" />
    </svg>
  `);

  assert.doesNotMatch(result, /\b(?:xlink:)?href\s*=\s*["']?(?:jav|data)/i);
  assert.match(result, /href="#safe-symbol"/);
});

test("SVG upload sanitization accepts harmless XML exporter preambles", async () => {
  const { sanitizeSvgUpload } = await import("../src/lib/media/sanitize-svg-upload.ts");
  const result = sanitizeSvgUpload(`
    <?xml version="1.0" encoding="UTF-8"?>
    <!-- Exported topology -->
    <!DOCTYPE svg SYSTEM "about:legacy-compat">
    <svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h10v10H0z" /></svg>
  `);

  assert.match(result, /^<svg\b/i);
  assert.doesNotMatch(result, /<\?xml|<!--|<!doctype/i);
});

test("SVG upload sanitization rejects files that are not SVG documents", async () => {
  const { sanitizeSvgUpload } = await import("../src/lib/media/sanitize-svg-upload.ts");

  assert.throws(() => sanitizeSvgUpload("<html><body>not an SVG</body></html>"), /valid SVG/i);
});
