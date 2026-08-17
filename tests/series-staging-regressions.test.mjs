import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationPath = "src/migrations/20260815_000001_add_series_landing_fields.ts";

test("ASCII topology panels retain rounded clipping and own mobile overflow", async () => {
  const globalStyles = await readFile("src/app/globals.css", "utf8");

  assert.match(
    globalStyles,
    /\.article-content figure\.topology-shell\s*\{[\s\S]*overflow: hidden;[\s\S]*border-radius: 0\.75rem/,
  );
  assert.match(
    globalStyles,
    /@media \(max-width: 640px\)[\s\S]*\.article-content figure\.topology-shell\s*\{[\s\S]*overflow-x: auto/,
  );
});

test("series landing content is draftable, ordered, localized, and data-safe", async () => {
  const [payloadConfig, payloadTypes, dataTypes, payloadAdapter, route, previewRoute, landing, migration, migrationsIndex] = await Promise.all([
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/payload-types.ts", "utf8"),
    readFile("src/app/data.ts", "utf8"),
    readFile("src/lib/cms/payload.ts", "utf8"),
    readFile("src/app/[lang]/blog/series/[seriesSlug]/page.tsx", "utf8"),
    readFile("src/app/[lang]/series-preview/[seriesSlug]/page.tsx", "utf8"),
    readFile("src/app/components/pages/SeriesLandingPage.tsx", "utf8"),
    readFile(migrationPath, "utf8"),
    readFile("src/migrations/index.ts", "utf8"),
  ]);

  assert.match(payloadConfig, /const Series:[\s\S]*name: "status"[\s\S]*value: "draft"[\s\S]*value: "published"/);
  assert.match(payloadConfig, /const Series:[\s\S]*name: "introductionRichVi"[\s\S]*type: "richText"/);
  assert.match(payloadConfig, /const Series:[\s\S]*name: "introductionRichEn"[\s\S]*type: "richText"/);
  assert.match(payloadConfig, /const Series:[\s\S]*listField\("learningPointsVi"/);
  assert.match(payloadConfig, /const Series:[\s\S]*listField\("learningPointsEn"/);
  assert.match(payloadConfig, /const Series:[\s\S]*name: "coverImage"[\s\S]*relationTo: "media"/);
  assert.match(payloadConfig, /const Posts:[\s\S]*name: "chapterOrder"[\s\S]*position: "sidebar"/);
  assert.match(payloadTypes, /export interface Series[\s\S]*status: 'draft' \| 'published'/);
  assert.match(payloadTypes, /export interface Post[\s\S]*chapterOrder\?: number \| null/);
  assert.match(dataTypes, /export interface Series[\s\S]*introduction\?: string/);
  assert.match(dataTypes, /export interface Series[\s\S]*learningPoints\?: string\[\]/);
  assert.match(payloadAdapter, /export async function getCmsSeriesBySlug/);
  assert.match(payloadAdapter, /export async function getCmsSeriesPosts/);
  assert.match(payloadAdapter, /sortPostsByChapter/);
  assert.match(route, /getCmsSeriesBySlug/);
  assert.match(route, /getCmsSeriesPosts/);
  assert.match(route, /<SeriesLandingPage/);
  assert.match(previewRoute, /SERIES_PREVIEW_ENABLED/);
  assert.match(previewRoute, /robots:[\s\S]*index: false[\s\S]*follow: false/);
  assert.match(landing, /learningPoints/);
  assert.match(landing, /chapterOrder/);
  assert.match(landing, /status === "draft"/);
  assert.doesNotMatch(landing, /devopsvn\.tech|Docker Basics — A Complete Series/);

  assert.match(migration, /CREATE TYPE "public"\."enum_series_status" AS ENUM\('draft', 'published'\)/);
  assert.match(migration, /UPDATE "series" SET "status" = 'published'/);
  assert.match(migration, /ADD COLUMN "introduction_rich_vi" jsonb/);
  assert.match(migration, /ADD COLUMN "introduction_rich_en" jsonb/);
  assert.match(migration, /CREATE TABLE "series_learning_points_vi"/);
  assert.match(migration, /CREATE TABLE "series_learning_points_en"/);
  assert.match(migration, /series_cover_image_id_media_id_fk/);
  assert.match(migrationsIndex, /20260815_000001_add_series_landing_fields/);
});

test("staging deploy uses an isolated Compose project and immutable image without production promotion", async () => {
  const [workflow, stagingEnv, compose, runbook, robots] = await Promise.all([
    readFile(".github/workflows/deploy-staging.yml", "utf8"),
    readFile(".env.staging.example", "utf8"),
    readFile("docker-compose.yml", "utf8"),
    readFile("docs/STAGING_DEPLOYMENT.md", "utf8"),
    readFile("src/app/robots.ts", "utf8"),
  ]);

  assert.match(workflow, /branches:\s*\n\s*- develop/);
  assert.match(workflow, /node-version: 24/);
  assert.match(workflow, /environment: staging/);
  assert.match(workflow, /--tag "\$\{IMAGE\}:\$\{GITHUB_SHA\}"/);
  assert.match(workflow, /APP_IMAGE="\$\{AWS_ECR_REGISTRY\}\/\$\{AWS_ECR_REPOSITORY\}:\$\{\{ github\.sha \}\}"/);
  assert.doesNotMatch(workflow, /--tag "\$\{IMAGE\}:production"/);
  assert.match(workflow, /DEPLOY_BRANCH="\$\{\{ github\.ref_name \}\}"/);
  assert.match(stagingEnv, /^COMPOSE_PROJECT_NAME=linuxunity-staging$/m);
  assert.match(stagingEnv, /^SITE_DOMAIN=dev\.linuxunity\.com$/m);
  assert.match(stagingEnv, /^POSTGRES_DB=payload_staging$/m);
  assert.match(stagingEnv, /^REDIS_KEY_PREFIX=linuxunity:staging$/m);
  assert.match(stagingEnv, /^SERIES_PREVIEW_ENABLED=true$/m);
  assert.match(compose, /SERIES_PREVIEW_ENABLED: \$\{SERIES_PREVIEW_ENABLED:-false\}/);
  assert.match(compose, /SITE_ENVIRONMENT: \$\{SITE_ENVIRONMENT:-production\}/);
  assert.match(robots, /SITE_ENVIRONMENT === "staging"[\s\S]*disallow: "\/"/);
  assert.match(runbook, /dev\.linuxunity\.com/);
  assert.match(runbook, /không được dùng chung/i);
  assert.match(runbook, /payload migrate/);
  assert.match(runbook, /\/api\/payload\/series/);
});
