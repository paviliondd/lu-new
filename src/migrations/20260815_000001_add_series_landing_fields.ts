import { sql } from "@payloadcms/db-postgres";
import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_series_status" AS ENUM('draft', 'published');

    ALTER TABLE "series" ADD COLUMN "status" "enum_series_status" DEFAULT 'draft';
    ALTER TABLE "series" ADD COLUMN "cover_image_id" integer;
    ALTER TABLE "series" ADD COLUMN "introduction_rich_vi" jsonb;
    ALTER TABLE "series" ADD COLUMN "introduction_rich_en" jsonb;

    UPDATE "series" SET "status" = 'published' WHERE "status" = 'draft';
    ALTER TABLE "series" ALTER COLUMN "status" SET NOT NULL;

    CREATE TABLE "series_learning_points_vi" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "value" varchar
    );

    CREATE TABLE "series_learning_points_en" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "value" varchar
    );

    ALTER TABLE "series" ADD CONSTRAINT "series_cover_image_id_media_id_fk"
      FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
    ALTER TABLE "series_learning_points_vi" ADD CONSTRAINT "series_learning_points_vi_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."series"("id")
      ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "series_learning_points_en" ADD CONSTRAINT "series_learning_points_en_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."series"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "series_status_idx" ON "series" USING btree ("status");
    CREATE INDEX "series_cover_image_idx" ON "series" USING btree ("cover_image_id");
    CREATE INDEX "series_learning_points_vi_order_idx" ON "series_learning_points_vi" USING btree ("_order");
    CREATE INDEX "series_learning_points_vi_parent_id_idx" ON "series_learning_points_vi" USING btree ("_parent_id");
    CREATE INDEX "series_learning_points_en_order_idx" ON "series_learning_points_en" USING btree ("_order");
    CREATE INDEX "series_learning_points_en_parent_id_idx" ON "series_learning_points_en" USING btree ("_parent_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "series" DROP CONSTRAINT "series_cover_image_id_media_id_fk";
    ALTER TABLE "series_learning_points_vi" DROP CONSTRAINT "series_learning_points_vi_parent_id_fk";
    ALTER TABLE "series_learning_points_en" DROP CONSTRAINT "series_learning_points_en_parent_id_fk";

    DROP TABLE "series_learning_points_vi" CASCADE;
    DROP TABLE "series_learning_points_en" CASCADE;

    DROP INDEX "series_status_idx";
    DROP INDEX "series_cover_image_idx";
    ALTER TABLE "series" DROP COLUMN "status";
    ALTER TABLE "series" DROP COLUMN "cover_image_id";
    ALTER TABLE "series" DROP COLUMN "introduction_rich_vi";
    ALTER TABLE "series" DROP COLUMN "introduction_rich_en";
    DROP TYPE "public"."enum_series_status";
  `);
}
