import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("featured carousel preserves the full representative image inside the slide", async () => {
  const carousel = await readFile("src/app/components/FeaturedPostsCarousel.tsx", "utf8");

  assert.match(carousel, /const postCover = post\.heroImage\?\.src \|\| post\.seo\.ogImage \|\| post\.thumbnail/);
  assert.match(carousel, /className="object-contain"/);
  assert.doesNotMatch(carousel, /object-cover|group-hover\/slide:scale/);
  assert.match(carousel, /className="relative min-h-64 bg-slate-950 lg:min-h-full"/);
  assert.match(carousel, /sizes="\(min-width: 1024px\) 40vw, 100vw"/);
});

test("featured carousel pins compact metadata and Read action to one bottom row", async () => {
  const carousel = await readFile("src/app/components/FeaturedPostsCarousel.tsx", "utf8");

  assert.match(carousel, /<div className="flex flex-1 flex-col justify-center">/);
  assert.match(carousel, /<div className="mt-auto flex items-center gap-2 pt-8 sm:gap-4">/);
  assert.match(carousel, /className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap text-xs text-slate-300 sm:gap-3 sm:text-sm"/);
  assert.match(carousel, /className="h-6 w-6 border-white\/15 bg-slate-700 text-white sm:h-8 sm:w-8"/);
  assert.match(carousel, /className="shrink-0 inline-flex items-center gap-1\.5 text-xs font-bold text-teal-200[^\"]*sm:gap-2 sm:text-sm/);
});

test("featured carousel uses reduced heading scale", async () => {
  const carousel = await readFile("src/app/components/FeaturedPostsCarousel.tsx", "utf8");

  assert.match(carousel, /text-lg font-bold leading-tight[^\"]*sm:text-xl lg:text-2xl/);
});
