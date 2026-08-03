import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { projects, getProject } from "../src/content/projects/projects.ts";
import { validateProject } from "../src/content/projects/schema.ts";

test("project content is valid, unique, and sorted newest first", () => {
  assert.equal(projects.length, 4);
  assert.equal(new Set(projects.map(({ slug }) => slug)).size, projects.length);
  const dates = projects.map(({ startDate }) => Date.parse(startDate));
  assert.deepEqual(dates, [...dates].sort((a, b) => b - a));
});

test("sample project slugs resolve and missing slugs do not", () => {
  assert.equal(getProject("production-ready-eks-platform")?.title, "Production-ready EKS Platform");
  assert.equal(getProject("serverless-api")?.title, "Serverless API on AWS");
  assert.equal(getProject("serverless-registration-system")?.title, "AWS Serverless Event Registration System");
  assert.equal(getProject("aws-landing-zone")?.title, "AWS Multi-account Landing Zone");
  assert.equal(getProject("missing-project"), undefined);
});

test("project validation rejects malformed content", () => {
  assert.throws(() => validateProject({ ...projects[0], slug: "Invalid Slug" }), /Invalid project slug/);
  assert.throws(() => validateProject({ ...projects[0], highlights: ["1", "2", "3", "4"] }), /Invalid card content/);
  assert.throws(() => validateProject({ ...projects[0], repositoryUrl: "javascript:alert(1)" }), /must use http/);
});

test("blog navigation exposes the absolute Project URL on shared desktop and mobile lists", async () => {
  const [navigation, header, translations] = await Promise.all([
    readFile("src/config/navigation.ts", "utf8"),
    readFile("src/app/components/Header.tsx", "utf8"),
    readFile("src/app/components/LanguageProvider.tsx", "utf8"),
  ]);
  assert.match(navigation, /https:\/\/project\.linuxunity\.com/);
  assert.match(navigation, /external:\s*true/);
  assert.equal((header.match(/navLinks\.map/g) || []).length, 2);
  assert.match(translations, /project:\s*"Project"/);
});

test("timeline uses semantic project links and client-side filter state", async () => {
  const timeline = await readFile("src/app/(projects)/projects/components/ProjectTimeline.tsx", "utf8");
  assert.match(timeline, /useState/);
  assert.match(timeline, /aria-pressed/);
  assert.match(timeline, /<Link className="project-card" href={`\/projects\/\$\{project\.slug\}`}>/);
  assert.match(timeline, /visibleProjects\.map/);
});

test("detail routes statically generate known slugs and omit unavailable optional actions", async () => {
  const detail = await readFile("src/app/(projects)/projects/[slug]/page.tsx", "utf8");
  assert.match(detail, /generateStaticParams/);
  assert.match(detail, /if \(!project\) notFound\(\)/);
  assert.match(detail, /project\.repositoryUrl &&/);
  assert.match(detail, /project\.demoUrl &&/);
  assert.match(detail, /project\.articleUrl &&/);
  assert.ok(projects.every((project) => !project.metrics?.length));
});

test("every architecture asset is present and real projects retain their evidence", async () => {
  for (const project of projects) {
    assert.ok(project.architectureImage);
    const asset = await stat(`public${project.architectureImage}`);
    assert.ok(asset.size > 500);
  }
  assert.equal(getProject("serverless-registration-system")?.placeholder, undefined);
  assert.equal(getProject("serverless-registration-system")?.repositoryUrl, "https://github.com/paviliondd/serverless-registration-system");
  const seed = await readFile("scripts/seed-payload-projects.mjs", "utf8");
  assert.match(seed, /placeholder: project\.placeholder \|\| false/);
});

test("Payload manages projects in a collection isolated from blog posts", async () => {
  const [collection, config, cms, migration] = await Promise.all([
    readFile("src/collections/Projects.ts", "utf8"),
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/lib/cms/projects.ts", "utf8"),
    readFile("src/migrations/20260803_000001_add_projects_collection.ts", "utf8"),
  ]);
  assert.match(collection, /slug:\s*"projects"/);
  assert.match(collection, /group:\s*"Project Portfolio"/);
  assert.doesNotMatch(collection, /label:\s*"SEO"/);
  assert.doesNotMatch(collection, /name:\s*"seoTitle"/);
  assert.match(config, /collections:\s*\[Users, Media, Authors, Series, Posts, Comments, Projects\]/);
  assert.doesNotMatch(collection, /relationTo:\s*"posts"/);
  assert.match(cms, /if \(!payload\) return fallbackProjects/);
  assert.match(cms, /return result\.docs\.flatMap/);
  assert.doesNotMatch(cms, /mergeProjects/);
  assert.match(migration, /CREATE TABLE "projects"/);
});
