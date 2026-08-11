import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("blog pagination synchronizes client state with the route page parameter", async () => {
  const [listPage, route] = await Promise.all([
    readFile("src/app/components/pages/BlogListPage.tsx", "utf8"),
    readFile("src/app/[lang]/blog/page.tsx", "utf8"),
  ]);

  assert.match(route, /initialPage=\{Math\.max\(1, Number\(query\?\.page \|\| 1\)\)\}/);
  assert.match(route, /key=\{`blog:\$\{query\?\.page \|\| "1"\}:\$\{query\?\.tag \|\| ""\}:\$\{query\?\.topic \|\| ""\}`\}/);
  assert.match(listPage, /onClick=\{\(\) => setCurrentPage\(page\)\}/);
});
