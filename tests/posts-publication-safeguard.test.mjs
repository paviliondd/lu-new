import assert from "node:assert/strict";
import test from "node:test";
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
