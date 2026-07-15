import { sql } from "@payloadcms/db-postgres";
import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "fit" varchar DEFAULT 'cover';

    UPDATE "media"
    SET "fit" = 'cover'
    WHERE "fit" IS NULL OR "fit" NOT IN ('cover', 'contain');

    UPDATE "media"
    SET "fit" = 'contain'
    FROM "posts"
    WHERE "posts"."slug" = 'ansible-inventory'
      AND "media"."id" = coalesce("posts"."seo_og_image_id", "posts"."cover_image_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" DROP COLUMN IF EXISTS "fit";
  `);
}
