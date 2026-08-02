import { sql } from "@payloadcms/db-postgres";
import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_projects_publication_status" AS ENUM('draft', 'published');
    CREATE TYPE "public"."enum_projects_project_status" AS ENUM('completed', 'in-progress', 'archived');
    CREATE TYPE "public"."enum_projects_category" AS ENUM('AWS', 'DevOps', 'Linux', 'Kubernetes', 'Observability');
    CREATE TYPE "public"."enum_projects_type" AS ENUM('Personal Project', 'Lab', 'Open Source');
    CREATE TYPE "public"."enum_projects_implementation_phase" AS ENUM('Design', 'Provision', 'Build', 'Secure', 'Observe', 'Optimize');

    CREATE TABLE "projects" (
      "id" serial PRIMARY KEY NOT NULL,
      "publication_status" "enum_projects_publication_status" DEFAULT 'draft' NOT NULL,
      "project_status" "enum_projects_project_status" DEFAULT 'in-progress' NOT NULL,
      "featured" boolean DEFAULT false,
      "placeholder" boolean DEFAULT false,
      "published_at" timestamp(3) with time zone,
      "category" "enum_projects_category" NOT NULL,
      "type" "enum_projects_type" NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "summary" varchar NOT NULL,
      "description" varchar,
      "start_date" timestamp(3) with time zone NOT NULL,
      "end_date" timestamp(3) with time zone,
      "display_date" varchar NOT NULL,
      "role" varchar NOT NULL,
      "repository_url" varchar,
      "demo_url" varchar,
      "article_url" varchar,
      "thumbnail_id" integer,
      "architecture_image_id" integer,
      "architecture_alt" varchar,
      "architecture_caption" varchar,
      "problem" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "projects_tags" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL);
    CREATE TABLE "projects_highlights" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL);
    CREATE TABLE "projects_metrics" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "label" varchar NOT NULL, "value" varchar NOT NULL);
    CREATE TABLE "projects_architecture_components" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL);
    CREATE TABLE "projects_gallery" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "image_id" integer, "alt" varchar NOT NULL, "caption" varchar);
    CREATE TABLE "projects_constraints" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL);
    CREATE TABLE "projects_success_criteria" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL);
    CREATE TABLE "projects_implementation" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "phase" "enum_projects_implementation_phase" NOT NULL, "title" varchar NOT NULL, "description" varchar NOT NULL, "tools" varchar, "output" varchar NOT NULL, "link_label" varchar, "link_url" varchar);
    CREATE TABLE "projects_decisions" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "decision" varchar NOT NULL, "choice" varchar NOT NULL, "reason" varchar NOT NULL);
    CREATE TABLE "projects_security" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL);
    CREATE TABLE "projects_observability" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL);
    CREATE TABLE "projects_results" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL);
    CREATE TABLE "projects_challenges" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "problem" varchar NOT NULL, "solution" varchar NOT NULL, "lesson" varchar NOT NULL);

    ALTER TABLE "projects" ADD CONSTRAINT "projects_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "projects" ADD CONSTRAINT "projects_architecture_image_id_media_id_fk" FOREIGN KEY ("architecture_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "projects_tags" ADD CONSTRAINT "projects_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "projects_highlights" ADD CONSTRAINT "projects_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "projects_metrics" ADD CONSTRAINT "projects_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "projects_architecture_components" ADD CONSTRAINT "projects_architecture_components_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "projects_constraints" ADD CONSTRAINT "projects_constraints_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "projects_success_criteria" ADD CONSTRAINT "projects_success_criteria_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "projects_implementation" ADD CONSTRAINT "projects_implementation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "projects_decisions" ADD CONSTRAINT "projects_decisions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "projects_security" ADD CONSTRAINT "projects_security_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "projects_observability" ADD CONSTRAINT "projects_observability_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "projects_results" ADD CONSTRAINT "projects_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "projects_challenges" ADD CONSTRAINT "projects_challenges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "projects_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
    CREATE INDEX "projects_start_date_idx" ON "projects" USING btree ("start_date");
    CREATE INDEX "projects_thumbnail_idx" ON "projects" USING btree ("thumbnail_id");
    CREATE INDEX "projects_architecture_image_idx" ON "projects" USING btree ("architecture_image_id");
    CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
    CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
    CREATE INDEX "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
    CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
    CREATE INDEX "projects_tags_order_idx" ON "projects_tags" USING btree ("_order"); CREATE INDEX "projects_tags_parent_id_idx" ON "projects_tags" USING btree ("_parent_id");
    CREATE INDEX "projects_highlights_order_idx" ON "projects_highlights" USING btree ("_order"); CREATE INDEX "projects_highlights_parent_id_idx" ON "projects_highlights" USING btree ("_parent_id");
    CREATE INDEX "projects_metrics_order_idx" ON "projects_metrics" USING btree ("_order"); CREATE INDEX "projects_metrics_parent_id_idx" ON "projects_metrics" USING btree ("_parent_id");
    CREATE INDEX "projects_architecture_components_order_idx" ON "projects_architecture_components" USING btree ("_order"); CREATE INDEX "projects_architecture_components_parent_id_idx" ON "projects_architecture_components" USING btree ("_parent_id");
    CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order"); CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
    CREATE INDEX "projects_constraints_order_idx" ON "projects_constraints" USING btree ("_order"); CREATE INDEX "projects_constraints_parent_id_idx" ON "projects_constraints" USING btree ("_parent_id");
    CREATE INDEX "projects_success_criteria_order_idx" ON "projects_success_criteria" USING btree ("_order"); CREATE INDEX "projects_success_criteria_parent_id_idx" ON "projects_success_criteria" USING btree ("_parent_id");
    CREATE INDEX "projects_implementation_order_idx" ON "projects_implementation" USING btree ("_order"); CREATE INDEX "projects_implementation_parent_id_idx" ON "projects_implementation" USING btree ("_parent_id");
    CREATE INDEX "projects_decisions_order_idx" ON "projects_decisions" USING btree ("_order"); CREATE INDEX "projects_decisions_parent_id_idx" ON "projects_decisions" USING btree ("_parent_id");
    CREATE INDEX "projects_security_order_idx" ON "projects_security" USING btree ("_order"); CREATE INDEX "projects_security_parent_id_idx" ON "projects_security" USING btree ("_parent_id");
    CREATE INDEX "projects_observability_order_idx" ON "projects_observability" USING btree ("_order"); CREATE INDEX "projects_observability_parent_id_idx" ON "projects_observability" USING btree ("_parent_id");
    CREATE INDEX "projects_results_order_idx" ON "projects_results" USING btree ("_order"); CREATE INDEX "projects_results_parent_id_idx" ON "projects_results" USING btree ("_parent_id");
    CREATE INDEX "projects_challenges_order_idx" ON "projects_challenges" USING btree ("_order"); CREATE INDEX "projects_challenges_parent_id_idx" ON "projects_challenges" USING btree ("_parent_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_projects_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_projects_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "projects_id";
    DROP TABLE IF EXISTS "projects_challenges" CASCADE;
    DROP TABLE IF EXISTS "projects_results" CASCADE;
    DROP TABLE IF EXISTS "projects_observability" CASCADE;
    DROP TABLE IF EXISTS "projects_security" CASCADE;
    DROP TABLE IF EXISTS "projects_decisions" CASCADE;
    DROP TABLE IF EXISTS "projects_implementation" CASCADE;
    DROP TABLE IF EXISTS "projects_success_criteria" CASCADE;
    DROP TABLE IF EXISTS "projects_constraints" CASCADE;
    DROP TABLE IF EXISTS "projects_gallery" CASCADE;
    DROP TABLE IF EXISTS "projects_architecture_components" CASCADE;
    DROP TABLE IF EXISTS "projects_metrics" CASCADE;
    DROP TABLE IF EXISTS "projects_highlights" CASCADE;
    DROP TABLE IF EXISTS "projects_tags" CASCADE;
    DROP TABLE IF EXISTS "projects" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_projects_implementation_phase";
    DROP TYPE IF EXISTS "public"."enum_projects_type";
    DROP TYPE IF EXISTS "public"."enum_projects_category";
    DROP TYPE IF EXISTS "public"."enum_projects_project_status";
    DROP TYPE IF EXISTS "public"."enum_projects_publication_status";
  `);
}
