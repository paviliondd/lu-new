import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { hasArticleContent } from "../src/payload.config.ts";

test("hasArticleContent detects empty vs valid post content", () => {
  assert.equal(hasArticleContent(null), false);
  assert.equal(hasArticleContent({}), false);
  assert.equal(hasArticleContent({ status: "published" }), false);
  assert.equal(hasArticleContent({ contentVi: "   ", contentEn: "" }), false);
  assert.equal(
    hasArticleContent({
      contentRichVi: {
        root: {
          children: [{ text: "" }],
        },
      },
    }),
    false
  );

  assert.equal(hasArticleContent({ contentVi: "Bài viết chia sẻ DevOps" }), true);
  assert.equal(hasArticleContent({ contentEn: "DevOps guide article" }), true);
  assert.equal(
    hasArticleContent({
      contentRichVi: {
        root: {
          children: [
            {
              children: [{ text: "Nội dung bài viết" }],
            },
          ],
        },
      },
    }),
    true
  );
});

test("post detail rendering has a valid fallback author and keeps Payload authoritative", async () => {
  const [cms, articlePage, data] = await Promise.all([
    readFile("src/lib/cms/payload.ts", "utf8"),
    readFile("src/app/[lang]/blog/[slug]/page.tsx", "utf8"),
    readFile("src/app/data.ts", "utf8"),
  ]);

  const detailLoader = cms.slice(
    cms.indexOf("async function getPayloadPostBySlug"),
    cms.indexOf("export const getCmsPostBySlug"),
  );

  assert.match(data, /nhatnghia:\s*\{/);
  assert.match(articlePage, /team\[post\.author\] \|\| team\.nhatnghia/);
  assert.match(detailLoader, /if \(!payload\) \{\s*const fallbackPost = await getFallbackPostBySlug/);
  assert.match(detailLoader, /if \(!doc\) return null/);
});

test("draft preview requests the latest Payload draft only for a Payload Admin session", async () => {
  const [payloadCms, articlePage, legacyArticlePage, seriesPreviewPage, previewAuth] = await Promise.all([
    readFile("src/lib/cms/payload.ts", "utf8"),
    readFile("src/app/[lang]/blog/[slug]/page.tsx", "utf8"),
    readFile("src/app/blog/[slug]/page.tsx", "utf8"),
    readFile("src/app/[lang]/series-preview/[seriesSlug]/page.tsx", "utf8"),
    readFile("src/lib/cms/preview-auth.ts", "utf8"),
  ]);
  const draftFlags = payloadCms.match(/draft: allowDraft/g) || [];

  assert.equal(draftFlags.length, 2);
  assert.match(payloadCms, /if \(allowDraft\) return fetchPost\(\)/);
  assert.match(previewAuth, /export async function canPreviewPayloadDraft\(\)/);
  assert.match(previewAuth, /payload\.auth\(\{ headers: await headers\(\) \}\)/);
  assert.match(articlePage, /canPreviewPayloadDraft/);
  assert.match(articlePage, /query\?\.preview === "true" && \(await canPreviewPayloadDraft\(\)\)/);
  assert.match(legacyArticlePage, /query\?\.preview === "true" && \(await canPreviewPayloadDraft\(\)\)/);
  assert.match(seriesPreviewPage, /if \(!\(await canPreviewPayloadDraft\(\)\)\) notFound\(\);/);
});

test("Payload preview URL changes after each saved revision", async () => {
  const payloadConfig = await readFile("src/payload.config.ts", "utf8");

  assert.match(payloadConfig, /previewRevision/);
  assert.match(payloadConfig, /data\?\.updatedAt/);
  assert.match(payloadConfig, /preview=true&revision=/);
});
