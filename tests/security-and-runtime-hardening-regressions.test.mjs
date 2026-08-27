import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("production authentication and OAuth failures do not expose fallback secrets or provider internals", async () => {
  const [session, githubCallback, googleCallback, oauth] = await Promise.all([
    readFile("src/lib/auth/session.ts", "utf8"),
    readFile("src/app/api/auth/github/callback/route.ts", "utf8"),
    readFile("src/app/api/auth/google/callback/route.ts", "utf8"),
    readFile("src/lib/auth/oauth.ts", "utf8"),
  ]);

  assert.match(session, /if \(process\.env\.NODE_ENV === "production"\) \{/);
  assert.match(session, /AUTH_SESSION_SECRET or PAYLOAD_SECRET must be configured in production/);
  assert.match(session, /crypto\.timingSafeEqual/);
  assert.doesNotMatch(githubCallback, /error instanceof Error \? error\.message/);
  assert.doesNotMatch(googleCallback, /error instanceof Error \? error\.message/);
  assert.match(githubCallback, /\{ error: "GitHub OAuth failed" \}/);
  assert.match(googleCallback, /\{ error: "Google OAuth failed" \}/);
  assert.match(oauth, /AbortSignal\.timeout\(10_000\)/);
});

test("public mutation endpoints avoid URL secrets, subscription enumeration, and unbounded search work", async () => {
  const [revalidate, newsletter, searchRoute, search] = await Promise.all([
    readFile("src/app/api/revalidate/route.ts", "utf8"),
    readFile("src/app/api/newsletter/route.ts", "utf8"),
    readFile("src/app/api/search/route.ts", "utf8"),
    readFile("src/lib/search/posts.ts", "utf8"),
  ]);

  assert.match(revalidate, /x-revalidate-secret/);
  assert.match(revalidate, /crypto\.timingSafeEqual/);
  assert.doesNotMatch(revalidate, /searchParams\.get\("secret"\)/);
  assert.doesNotMatch(newsletter, /subscriber:\s*\{/);
  assert.doesNotMatch(newsletter, /You are already subscribed/);
  assert.match(searchRoute, /slice\(0, 200\)/);
  assert.match(search, /const MAX_SEARCH_QUERY_LENGTH = 200/);
  assert.match(search, /query\.trim\(\)\.slice\(0, MAX_SEARCH_QUERY_LENGTH\)/);
});

test("production runtime blocks automatic schema push and sends defensive transport headers", async () => {
  const [payloadConfig, nginxTemplate, compose, dockerfile] = await Promise.all([
    readFile("src/payload.config.ts", "utf8"),
    readFile("deploy/nginx/docker-entrypoint.d/30-render-site-conf.sh", "utf8"),
    readFile("docker-compose.yml", "utf8"),
    readFile("Dockerfile", "utf8"),
  ]);

  assert.match(payloadConfig, /push: false/);
  assert.doesNotMatch(payloadConfig, /push: true/);
  assert.match(payloadConfig, /PAYLOAD_SECRET must be configured in production/);
  assert.match(payloadConfig, /PAYLOAD_BUILD_SECRET === "true"/);
  assert.doesNotMatch(payloadConfig, /secret: process\.env\.PAYLOAD_SECRET \|\| "development-payload-secret-change-me"/);
  assert.match(dockerfile, /FROM deps AS builder\nENV PAYLOAD_BUILD_SECRET=true/);
  assert.match(nginxTemplate, /Strict-Transport-Security "max-age=31536000" always/);
  assert.doesNotMatch(nginxTemplate, /includeSubDomains/);
  assert.match(nginxTemplate, /Permissions-Policy "camera=\(\), geolocation=\(\), microphone=\(\), payment=\(\), usb=\(\)" always/);
  assert.match(compose, /payload_media:\/app\/public\/uploads/);
});

test("Payload direct REST and GraphQL routes cannot mutate collections anonymously", async () => {
  const [payloadConfig, projects] = await Promise.all([
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/collections/Projects.ts", "utf8"),
  ]);

  assert.match(payloadConfig, /const Users: CollectionConfig[\s\S]*?access: \{[\s\S]*?create: authenticated,[\s\S]*?update: authenticated,[\s\S]*?delete: authenticated/);
  assert.match(payloadConfig, /const Media: CollectionConfig[\s\S]*?access: \{[\s\S]*?create: authenticated,[\s\S]*?update: authenticated,[\s\S]*?delete: authenticated/);
  assert.match(payloadConfig, /const Posts: CollectionConfig[\s\S]*?access: \{[\s\S]*?create: authenticated,[\s\S]*?update: authenticated,[\s\S]*?delete: authenticated/);
  assert.match(payloadConfig, /const Comments: CollectionConfig[\s\S]*?create: authenticated/);
  assert.match(projects, /access: \{[\s\S]*?create: authenticated,[\s\S]*?update: authenticated,[\s\S]*?delete: authenticated/);
});
