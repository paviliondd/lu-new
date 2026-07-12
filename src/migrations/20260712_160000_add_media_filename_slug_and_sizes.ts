import { sql } from "@payloadcms/db-postgres";
import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "filename_slug" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes" jsonb;

    UPDATE "media"
    SET "filename_slug" = lower(
      regexp_replace(
        regexp_replace(coalesce("filename", ''), '\\.[^.]*$', ''),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      )
    )
    WHERE "filename_slug" IS NULL
      AND "filename" IS NOT NULL
      AND "filename" <> '';

    CREATE INDEX IF NOT EXISTS "media_filename_slug_idx" ON "media" USING btree ("filename_slug");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_filename_slug_idx";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "filename_slug";
  `);
}
