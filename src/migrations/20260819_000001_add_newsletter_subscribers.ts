import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_newsletter_subscribers_status" AS ENUM('pending', 'confirmed');

    CREATE TABLE "newsletter_subscribers" (
      "id" serial PRIMARY KEY NOT NULL,
      "email" varchar NOT NULL,
      "status" "enum_newsletter_subscribers_status" DEFAULT 'pending' NOT NULL,
      "confirmed_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "newsletter_subscribers_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "newsletter_subscribers_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");
    CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers" USING btree ("status");
    CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" USING btree ("created_at");
    CREATE INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");
    CREATE INDEX "payload_preferences_rels_newsletter_subscribers_id_idx" ON "payload_preferences_rels" USING btree ("newsletter_subscribers_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "newsletter_subscribers_created_at_idx";
    DROP INDEX IF EXISTS "newsletter_subscribers_status_idx";
    DROP INDEX IF EXISTS "newsletter_subscribers_email_idx";
    DROP TABLE IF EXISTS "newsletter_subscribers";
    DROP TYPE IF EXISTS "public"."enum_newsletter_subscribers_status";
  `)
}
