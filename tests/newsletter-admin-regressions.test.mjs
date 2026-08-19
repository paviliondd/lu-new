import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationPath = "src/migrations/20260819_000001_add_newsletter_subscribers.ts";

test("newsletter subscribers are managed and confirmed from Payload Admin", async () => {
  const [config, store, cms, migration, migrationIndex] = await Promise.all([
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/lib/newsletter/store.ts", "utf8"),
    readFile("src/lib/cms/payload.ts", "utf8"),
    readFile(migrationPath, "utf8"),
    readFile("src/migrations/index.ts", "utf8"),
  ]);

  assert.match(config, /const NewsletterSubscribers: CollectionConfig/);
  assert.match(config, /slug: "newsletter-subscribers"/);
  assert.match(config, /defaultColumns: \["email", "status", "createdAt", "confirmedAt"\]/);
  assert.match(config, /\{ label: "Confirmed", value: "confirmed" \}/);
  assert.match(config, /collections: \[Users, Media, Authors, Series, Posts, Comments, NewsletterSubscribers, Projects\]/);
  assert.match(store, /addPayloadNewsletterSubscriber/);
  assert.match(cms, /collection: "newsletter-subscribers"/);
  assert.match(store, /status: "pending"/);
  assert.match(migration, /CREATE TYPE "public"\."enum_newsletter_subscribers_status" AS ENUM\('pending', 'confirmed'\)/);
  assert.match(migration, /CREATE TABLE "newsletter_subscribers"/);
  assert.match(migration, /newsletter_subscribers_email_idx/);
  assert.match(migration, /payload_locked_documents_rels.*newsletter_subscribers_id/s);
  assert.match(migration, /payload_preferences_rels.*newsletter_subscribers_id/s);
  assert.match(migrationIndex, /20260819_000001_add_newsletter_subscribers/);
  assert.match(migrationIndex, /20260819_000002_repair_newsletter_subscriber_relations/);
});
