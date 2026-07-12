import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

test("Payload media schema fields stay covered by migrations and generated types", async () => {
  const [config, migrationIndex, migration, types] = await Promise.all([
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/migrations/index.ts", "utf8"),
    readFile("src/migrations/20260712_160000_add_media_filename_slug_and_sizes.ts", "utf8"),
    readFile("src/payload-types.ts", "utf8"),
  ]);

  assert.match(config, /name:\s*"filenameSlug"/);
  assert.match(config, /imageSizes:\s*\[/);
  assert.match(migrationIndex, /20260712_160000_add_media_filename_slug_and_sizes/);
  assert.match(migration, /"filename_slug"/);
  assert.match(migration, /"sizes"\s+jsonb/);
  assert.match(types, /filenameSlug\?:/);
  assert.match(types, /sizes\?:/);
});
