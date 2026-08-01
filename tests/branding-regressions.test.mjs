import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

test("App Router serves cache-busted penguin metadata icons", async () => {
  const [layout, icon, appleIcon] = await Promise.all([
    readFile("src/app/[lang]/layout.tsx", "utf8"),
    stat("src/app/icon.png"),
    stat("src/app/apple-icon.png"),
  ]);

  assert.doesNotMatch(layout, /\/favicon\.ico/);
  assert.ok(icon.size > 10_000);
  assert.ok(appleIcon.size > 5_000);
});
