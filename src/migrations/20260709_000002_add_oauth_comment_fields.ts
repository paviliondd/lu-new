import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_users_provider" AS ENUM('github', 'google');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_comments_provider" AS ENUM('github', 'google');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "provider" "enum_users_provider";
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "provider_id" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" varchar;

    ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "user_id" integer;
    ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "provider" "enum_comments_provider";
    ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "provider_user_id" varchar;
    ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "username" varchar;

    DO $$ BEGIN
      ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "users_provider_idx" ON "users" USING btree ("provider");
    CREATE INDEX IF NOT EXISTS "users_provider_id_idx" ON "users" USING btree ("provider_id");
    CREATE INDEX IF NOT EXISTS "comments_user_idx" ON "comments" USING btree ("user_id");
    CREATE INDEX IF NOT EXISTS "comments_provider_idx" ON "comments" USING btree ("provider");
    CREATE INDEX IF NOT EXISTS "comments_provider_user_id_idx" ON "comments" USING btree ("provider_user_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "comments_provider_user_id_idx";
    DROP INDEX IF EXISTS "comments_provider_idx";
    DROP INDEX IF EXISTS "comments_user_idx";
    DROP INDEX IF EXISTS "users_provider_id_idx";
    DROP INDEX IF EXISTS "users_provider_idx";
    ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_user_id_users_id_fk";
    ALTER TABLE "comments" DROP COLUMN IF EXISTS "username";
    ALTER TABLE "comments" DROP COLUMN IF EXISTS "provider_user_id";
    ALTER TABLE "comments" DROP COLUMN IF EXISTS "provider";
    ALTER TABLE "comments" DROP COLUMN IF EXISTS "user_id";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_url";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "provider_id";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "provider";
    DROP TYPE IF EXISTS "public"."enum_comments_provider";
    DROP TYPE IF EXISTS "public"."enum_users_provider";
  `)
}
