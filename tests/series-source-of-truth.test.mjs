import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Payload is authoritative for series when the CMS query succeeds", async () => {
  const source = await readFile("src/lib/cms/payload.ts", "utf8");
  const seriesLoader = source.slice(
    source.indexOf("async function getPayloadSeries"),
    source.indexOf("export const getCmsSeries"),
  );

  assert.match(seriesLoader, /if \(!payload\) return .*fallback/);
  assert.match(seriesLoader, /return requestedLimit === undefined \? payloadSeries : payloadSeries\.slice/);
  assert.doesNotMatch(seriesLoader, /mergeSeries/);
  assert.doesNotMatch(seriesLoader, /cachedJson\(`series:list:/);
});

test("home and series list share the compact accessible series row", async () => {
  const [row, home, list] = await Promise.all([
    readFile("src/app/components/SeriesRow.tsx", "utf8"),
    readFile("src/app/components/pages/HomePage.tsx", "utf8"),
    readFile("src/app/components/pages/SeriesListPage.tsx", "utf8"),
  ]);

  assert.match(home, /<SeriesRow key=\{item\.slug\} item=\{item\}/);
  assert.match(list, /<SeriesRow key=\{item\.slug\} item=\{item\}/);
  assert.match(row, /focus-visible:ring-2/);
  assert.match(row, /dark:bg-slate-900\/80/);
  assert.doesNotMatch(row, /item\.description/);
});
