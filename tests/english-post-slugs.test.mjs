import assert from "node:assert/strict";
import test from "node:test";

import { localizePost, slugifyText } from "../src/i18n/config.ts";

test("slugifyText produces clean URL slugs", () => {
  assert.equal(
    slugifyText("AWS Lambda Execution Model: Handler, Context, Timeout và Concurrency"),
    "aws-lambda-execution-model-handler-context-timeout-va-concurrency"
  );
  assert.equal(
    slugifyText("Phân tích kiến trúc hiện tại của LinuxUnity"),
    "phan-tich-kien-truc-hien-tai-cua-linuxunity"
  );
});

test("localizePost auto-generates English slug when locale is en", () => {
  const post = {
    slug: "phan-tich-kien-truc-linuxunity-truoc-khi-trien-khai-aws",
    title: "Phân tích kiến trúc hiện tại của LinuxUnity",
    title_en: "Analyzing LinuxUnity's Current Architecture Before AWS Deployment",
    description: "Mô tả tiếng Việt",
    description_en: "English description",
    content: "<p>Nội dung</p>",
    content_en: "<p>Content</p>",
    readTime: "5 phút đọc",
    readTime_en: "5 min read",
  };

  const viLocalized = localizePost(post, "vi");
  assert.equal(viLocalized.slug, "phan-tich-kien-truc-linuxunity-truoc-khi-trien-khai-aws");

  const enLocalized = localizePost(post, "en");
  assert.equal(
    enLocalized.slug,
    "analyzing-linuxunitys-current-architecture-before-aws-deployment"
  );
});
