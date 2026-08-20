import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

// Repairs deployments where the collection table was created before Payload's
// lock/preferences relation columns were included in its migration.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "newsletter_subscribers_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "newsletter_subscribers_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk"
        FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_newsletter_subscribers_fk"
        FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_newsletter_subscribers_id_idx"
      ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_newsletter_subscribers_id_idx"
      ON "payload_preferences_rels" USING btree ("newsletter_subscribers_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_preferences_rels_newsletter_subscribers_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_newsletter_subscribers_id_idx";
    ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_newsletter_subscribers_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_newsletter_subscribers_fk";
    ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "newsletter_subscribers_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "newsletter_subscribers_id";
  `)
}
