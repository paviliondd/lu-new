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

    CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");
    CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers" USING btree ("status");
    CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" USING btree ("created_at");
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
