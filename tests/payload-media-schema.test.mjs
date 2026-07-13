import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

test("Payload media schema fields stay covered by migrations and generated types", async () => {
  const [config, migrationIndex, filenameMigration, sizeMigration, types] = await Promise.all([
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/migrations/index.ts", "utf8"),
    readFile("src/migrations/20260712_160000_add_media_filename_slug_and_sizes.ts", "utf8"),
    readFile("src/migrations/20260713_000001_add_media_image_size_columns.ts", "utf8"),
    readFile("src/payload-types.ts", "utf8"),
  ]);

  assert.match(config, /name:\s*"filenameSlug"/);
  assert.match(config, /imageSizes:\s*\[/);
  assert.match(config, /import sharp from "sharp"/);
  assert.match(config, /sharp,/);
  assert.match(config, /adminThumbnail:\s*mediaAdminThumbnail/);
  assert.match(config, /displayPreview:\s*true/);
  assert.match(config, /normalizeLegacyMediaSizes/);
  assert.match(config, /uploads\/imported/);
  assert.match(config, /\/api\/payload\/media\/file\//);
  assert.doesNotMatch(config, /doc\.url === `\/uploads\//);
  assert.match(migrationIndex, /20260712_160000_add_media_filename_slug_and_sizes/);
  assert.match(migrationIndex, /20260713_000001_add_media_image_size_columns/);
  assert.match(filenameMigration, /"filename_slug"/);
  for (const sizeName of ["card", "og", "article"]) {
    for (const fieldName of ["url", "width", "height", "mime_type", "filesize", "filename"]) {
      assert.match(sizeMigration, new RegExp(`"sizes_${sizeName}_${fieldName}"`));
    }
  }
  assert.match(types, /filenameSlug\?:/);
  assert.match(types, /sizes\?:/);
});
