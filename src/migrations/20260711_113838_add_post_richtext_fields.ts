import { sql } from "@payloadcms/db-postgres";
import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts" ALTER COLUMN "content_vi" DROP NOT NULL;
    ALTER TABLE "posts" ALTER COLUMN "content_en" DROP NOT NULL;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "content_rich_vi" jsonb;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "content_rich_en" jsonb;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "content_rich_en";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "content_rich_vi";
  `);
}
