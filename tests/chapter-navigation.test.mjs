import assert from "node:assert/strict";
import test from "node:test";
import {
  parseChapterNumber,
  sortPostsByChapter,
  getChapterNavigation,
} from "../src/lib/utils/chapter.ts";

test("parseChapterNumber extracts chapter numbers correctly", () => {
  assert.equal(parseChapterNumber("[Ansible] Phần 1. Giới thiệu về Ansible"), 1);
  assert.equal(parseChapterNumber("[Ansible] Phần 2. Cài đặt và làm quen"), 2);
  assert.equal(parseChapterNumber("Chapter 3: Working with a Private Repo"), 3);
  assert.equal(parseChapterNumber("Chap 04: Advanced Playbooks"), 4);
  assert.equal(parseChapterNumber("Bài 5: Ansible Roles"), 5);
  assert.equal(parseChapterNumber("Random Title Without Chapter"), null);
});

test("sortPostsByChapter sorts posts in logical chapter order", () => {
  const posts = [
    { slug: "post-3", title: "Phần 3. Advanced", date: "2026-07-10" },
    { slug: "post-1", title: "Phần 1. Intro", date: "2026-07-01" },
    { slug: "post-2", title: "Phần 2. Basics", date: "2026-07-05" },
  ];
  const sorted = sortPostsByChapter(posts);
  assert.deepEqual(
    sorted.map((p) => p.slug),
    ["post-1", "post-2", "post-3"]
  );
});

test("getChapterNavigation returns correct prev and next posts", () => {
  const p1 = {
    slug: "post-1",
    title: "[Ansible] Phần 1. Intro",
    category: "Ansible",
    date: "2026-07-01",
  };
  const p2 = {
    slug: "post-2",
    title: "[Ansible] Phần 2. Setup",
    category: "Ansible",
    date: "2026-07-05",
  };
  const p3 = {
    slug: "post-3",
    title: "[Ansible] Phần 3. Roles",
    category: "Ansible",
    date: "2026-07-10",
  };
  const allPosts = [p3, p1, p2];

  const nav1 = getChapterNavigation(p1, allPosts);
  assert.equal(nav1.prevPost, null);
  assert.equal(nav1.nextPost?.slug, "post-2");
  assert.equal(nav1.groupTitle, "Ansible");

  const nav2 = getChapterNavigation(p2, allPosts);
  assert.equal(nav2.prevPost?.slug, "post-1");
  assert.equal(nav2.nextPost?.slug, "post-3");

  const nav3 = getChapterNavigation(p3, allPosts);
  assert.equal(nav3.prevPost?.slug, "post-2");
  assert.equal(nav3.nextPost, null);
});
