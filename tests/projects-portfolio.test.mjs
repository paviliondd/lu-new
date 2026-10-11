import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { projects, getProject } from "../src/content/projects/projects.ts";
import { validateProject } from "../src/content/projects/schema.ts";

test("project content is valid, unique, and sorted newest first", () => {
  assert.equal(projects.length, 5);
  assert.equal(new Set(projects.map(({ slug }) => slug)).size, projects.length);
  const dates = projects.map(({ startDate }) => Date.parse(startDate));
  assert.deepEqual(dates, [...dates].sort((a, b) => b - a));
});

test("LinuxUnity project documents production topology and the isolated staging data flow", () => {
  const project = getProject("linuxunity-platform");
  assert.ok(project);
  assert.equal(project.title, "LinuxUnity.com Publishing Platform");
  assert.equal(project.placeholder, undefined);
  assert.match(project.architectureAlt || "", /production.*staging/i);
  assert.match(project.architectureCaption || "", /data flow/i);
  assert.ok(project.architectureComponents?.some(({ name }) => /staging/i.test(name)));
  assert.ok(project.implementation.some(({ description }) => /dev\.linuxunity\.com/i.test(description)));
  assert.ok(project.implementation.some(({ description }) => /Payload.*Postgres.*Redis/i.test(description)));
});

test("sample project slugs resolve and missing slugs do not", () => {
  assert.equal(getProject("production-ready-eks-platform")?.title, "Production-ready EKS Platform");
  assert.equal(getProject("serverless-api")?.title, "Serverless API on AWS");
  assert.equal(getProject("serverless-registration-system")?.title, "AWS Serverless Event Registration System");
  assert.equal(getProject("aws-landing-zone")?.title, "AWS Multi-account Landing Zone");
  assert.equal(getProject("linuxunity-platform")?.title, "LinuxUnity.com Publishing Platform");
  assert.equal(getProject("missing-project"), undefined);
});

test("project validation rejects malformed content", () => {
  assert.throws(() => validateProject({ ...projects[0], slug: "Invalid Slug" }), /Invalid project slug/);
  assert.throws(() => validateProject({ ...projects[0], highlights: ["1", "2", "3", "4"] }), /Invalid card content/);
  assert.throws(() => validateProject({ ...projects[0], repositoryUrl: "javascript:alert(1)" }), /must use http/);
});

test("blog navigation retains but hides the absolute Project URL from shared desktop and mobile lists", async () => {
  const [navigation, header, translations] = await Promise.all([
    readFile("src/config/navigation.ts", "utf8"),
    readFile("src/app/components/Header.tsx", "utf8"),
    readFile("src/app/components/LanguageProvider.tsx", "utf8"),
  ]);
  assert.match(navigation, /https:\/\/project\.linuxunity\.com/);
  assert.match(navigation, /external:\s*true/);
  assert.match(navigation, /hidden:\s*true/);
  assert.match(header, /filter\(\(link\)\s*=>\s*!\(\"hidden\" in link && link\.hidden\)\)/);
  assert.equal((header.match(/navLinks\.map/g) || []).length, 2);
  assert.match(translations, /project:\s*"Project"/);
});

test("timeline uses semantic project links and client-side filter state", async () => {
  const timeline = await readFile("src/app/(projects)/projects/components/ProjectTimeline.tsx", "utf8");
  assert.match(timeline, /useState/);
  assert.match(timeline, /aria-pressed/);
  assert.match(timeline, /<Link className="project-card" href={`\/\$\{project\.slug\}`}>/);
  assert.match(timeline, /visibleProjects\.map/);
});

test("project subdomain uses clean English routes and the shared theme controls", async () => {
  const [proxy, layout, styles, page, detail, header] = await Promise.all([
    readFile("src/proxy.ts", "utf8"),
    readFile("src/app/(projects)/layout.tsx", "utf8"),
    readFile("src/app/(projects)/projects/projects.css", "utf8"),
    readFile("src/app/(projects)/projects/page.tsx", "utf8"),
    readFile("src/app/(projects)/projects/[slug]/page.tsx", "utf8"),
    readFile("src/app/(projects)/projects/components/ProjectHeader.tsx", "utf8"),
  ]);
  assert.match(proxy, /pathname === "\/projects"/);
  assert.match(proxy, /projectUrl\.pathname = `\/projects\$\{pathname\}`/);
  assert.match(layout, /<html lang="en"/);
  assert.match(layout, /suppressHydrationWarning/);
  assert.match(layout, /import \{ Inter, Geist_Mono \}/);
  assert.match(layout, /--font-site-sans/);
  assert.match(layout, /<ThemeScript \/>/);
  assert.match(styles, /html\.dark \.projects-site/);
  assert.match(styles, /color-scheme: dark/);
  assert.match(page, /Hands-on cloud infrastructure/);
  assert.match(detail, /https:\/\/project\.linuxunity\.com\/\$\{project\.slug\}/);
  assert.match(header, /label: "Blog"[\s\S]*label: "Projects"[\s\S]*label: "About"/);
  assert.match(header, /href="https:\/\/linuxunity\.com" aria-label="LinuxUnity home"/);
  assert.match(header, /<ThemeToggle \/>/);
  assert.doesNotMatch(header, /Code2|siteConfig\.social\.github/);
});

test("detail routes statically generate known slugs and omit unavailable optional actions", async () => {
  const detail = await readFile("src/app/(projects)/projects/[slug]/page.tsx", "utf8");
  assert.match(detail, /generateStaticParams/);
  assert.match(detail, /if \(!project\) notFound\(\)/);
  assert.match(detail, /project\.repositoryUrl &&/);
  assert.match(detail, /<GitHubMark \/>/);
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
  assert.match(seed, /payload\.update/);
});

test("Payload manages projects in a collection isolated from blog posts", async () => {
  const [collection, config, cms, migration, seedMigration, migrationIndex] = await Promise.all([
    readFile("src/collections/Projects.ts", "utf8"),
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/lib/cms/projects.ts", "utf8"),
    readFile("src/migrations/20260803_000001_add_projects_collection.ts", "utf8"),
    readFile("src/migrations/20260803_000002_seed_projects_when_empty.ts", "utf8"),
    readFile("src/migrations/index.ts", "utf8"),
  ]);
  assert.match(collection, /slug:\s*"projects"/);
  assert.match(collection, /group:\s*"Project Portfolio"/);
  assert.doesNotMatch(collection, /label:\s*"SEO"/);
  assert.doesNotMatch(collection, /name:\s*"seoTitle"/);
  assert.match(config, /collections:\s*\[Users, Media, Authors, Series, Posts, Comments, NewsletterSubscribers, Projects\]/);
  assert.doesNotMatch(collection, /relationTo:\s*"posts"/);
  assert.match(cms, /if \(!payload\) return fallbackProjects/);
  assert.match(cms, /return result\.docs\.flatMap/);
  assert.match(cms, /linuxunity-platform.*architecture\.svg/);
  assert.doesNotMatch(cms, /mergeProjects/);
  assert.match(migration, /CREATE TABLE "projects"/);
  assert.match(seedMigration, /if \(existing\.totalDocs > 0\) return/);
  assert.match(seedMigration, /payload\.create/);
  assert.doesNotMatch(seedMigration, /payload\.update|payload\.delete/);
  assert.match(migrationIndex, /20260803_000002_seed_projects_when_empty/);
});
