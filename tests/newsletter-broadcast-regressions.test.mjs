import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("a new Payload publication awaits its newsletter delivery and records an outcome", async () => {
  const config = await readFile("src/payload.config.ts", "utf8");

  assert.match(config, /import \{ broadcastNewPostNotification \} from "\.\/lib\/newsletter\/smtp"/);
  assert.match(config, /const isNewlyPublished = .*status === "published"/);
  assert.match(config, /const result = await broadcastNewPostNotification\(\{ title, slug, excerpt \}\)/);
  assert.match(config, /\[Newsletter broadcast\] Publishing notification/);
  assert.match(config, /\[Newsletter broadcast\] Completed/);
  assert.doesNotMatch(config, /import\("\.\/lib\/newsletter\/smtp"\)\.then/);
});
