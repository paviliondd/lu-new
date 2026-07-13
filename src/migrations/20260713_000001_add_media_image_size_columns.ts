import { sql } from "@payloadcms/db-postgres";
import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_url" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_width" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_height" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_mime_type" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_filesize" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_filename" varchar;

    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_og_url" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_og_width" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_og_height" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_og_mime_type" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_og_filesize" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_og_filename" varchar;

    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_article_url" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_article_width" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_article_height" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_article_mime_type" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_article_filesize" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_article_filename" varchar;

    UPDATE "media"
    SET
      "sizes_card_url" = coalesce("sizes_card_url", "sizes" #>> '{card,url}'),
      "sizes_card_width" = coalesce("sizes_card_width", nullif("sizes" #>> '{card,width}', '')::numeric),
      "sizes_card_height" = coalesce("sizes_card_height", nullif("sizes" #>> '{card,height}', '')::numeric),
      "sizes_card_mime_type" = coalesce("sizes_card_mime_type", "sizes" #>> '{card,mimeType}'),
      "sizes_card_filesize" = coalesce("sizes_card_filesize", nullif("sizes" #>> '{card,filesize}', '')::numeric),
      "sizes_card_filename" = coalesce("sizes_card_filename", "sizes" #>> '{card,filename}'),
      "sizes_og_url" = coalesce("sizes_og_url", "sizes" #>> '{og,url}'),
      "sizes_og_width" = coalesce("sizes_og_width", nullif("sizes" #>> '{og,width}', '')::numeric),
      "sizes_og_height" = coalesce("sizes_og_height", nullif("sizes" #>> '{og,height}', '')::numeric),
      "sizes_og_mime_type" = coalesce("sizes_og_mime_type", "sizes" #>> '{og,mimeType}'),
      "sizes_og_filesize" = coalesce("sizes_og_filesize", nullif("sizes" #>> '{og,filesize}', '')::numeric),
      "sizes_og_filename" = coalesce("sizes_og_filename", "sizes" #>> '{og,filename}'),
      "sizes_article_url" = coalesce("sizes_article_url", "sizes" #>> '{article,url}'),
      "sizes_article_width" = coalesce("sizes_article_width", nullif("sizes" #>> '{article,width}', '')::numeric),
      "sizes_article_height" = coalesce("sizes_article_height", nullif("sizes" #>> '{article,height}', '')::numeric),
      "sizes_article_mime_type" = coalesce("sizes_article_mime_type", "sizes" #>> '{article,mimeType}'),
      "sizes_article_filesize" = coalesce("sizes_article_filesize", nullif("sizes" #>> '{article,filesize}', '')::numeric),
      "sizes_article_filename" = coalesce("sizes_article_filename", "sizes" #>> '{article,filename}')
    WHERE "sizes" IS NOT NULL;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_article_filename";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_article_filesize";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_article_mime_type";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_article_height";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_article_width";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_article_url";

    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_og_filename";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_og_filesize";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_og_mime_type";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_og_height";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_og_width";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_og_url";

    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_filename";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_filesize";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_mime_type";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_height";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_width";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_url";
  `);
}
