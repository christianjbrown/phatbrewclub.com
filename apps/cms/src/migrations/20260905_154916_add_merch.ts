import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_merch_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__merch_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "merch" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"price" numeric,
  	"sold_out" boolean DEFAULT false,
  	"shop_url" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_merch_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "merch_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_merch_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_price" numeric,
  	"version_sold_out" boolean DEFAULT false,
  	"version_shop_url" varchar,
  	"version_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__merch_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_merch_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "merch_id" integer;
  ALTER TABLE "merch_rels" ADD CONSTRAINT "merch_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."merch"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merch_rels" ADD CONSTRAINT "merch_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_merch_v" ADD CONSTRAINT "_merch_v_parent_id_merch_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."merch"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_merch_v_rels" ADD CONSTRAINT "_merch_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_merch_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_merch_v_rels" ADD CONSTRAINT "_merch_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "merch_slug_idx" ON "merch" USING btree ("slug");
  CREATE INDEX "merch_updated_at_idx" ON "merch" USING btree ("updated_at");
  CREATE INDEX "merch_created_at_idx" ON "merch" USING btree ("created_at");
  CREATE INDEX "merch__status_idx" ON "merch" USING btree ("_status");
  CREATE INDEX "merch_rels_order_idx" ON "merch_rels" USING btree ("order");
  CREATE INDEX "merch_rels_parent_idx" ON "merch_rels" USING btree ("parent_id");
  CREATE INDEX "merch_rels_path_idx" ON "merch_rels" USING btree ("path");
  CREATE INDEX "merch_rels_media_id_idx" ON "merch_rels" USING btree ("media_id");
  CREATE INDEX "_merch_v_parent_idx" ON "_merch_v" USING btree ("parent_id");
  CREATE INDEX "_merch_v_version_version_slug_idx" ON "_merch_v" USING btree ("version_slug");
  CREATE INDEX "_merch_v_version_version_updated_at_idx" ON "_merch_v" USING btree ("version_updated_at");
  CREATE INDEX "_merch_v_version_version_created_at_idx" ON "_merch_v" USING btree ("version_created_at");
  CREATE INDEX "_merch_v_version_version__status_idx" ON "_merch_v" USING btree ("version__status");
  CREATE INDEX "_merch_v_created_at_idx" ON "_merch_v" USING btree ("created_at");
  CREATE INDEX "_merch_v_updated_at_idx" ON "_merch_v" USING btree ("updated_at");
  CREATE INDEX "_merch_v_latest_idx" ON "_merch_v" USING btree ("latest");
  CREATE INDEX "_merch_v_rels_order_idx" ON "_merch_v_rels" USING btree ("order");
  CREATE INDEX "_merch_v_rels_parent_idx" ON "_merch_v_rels" USING btree ("parent_id");
  CREATE INDEX "_merch_v_rels_path_idx" ON "_merch_v_rels" USING btree ("path");
  CREATE INDEX "_merch_v_rels_media_id_idx" ON "_merch_v_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_merch_fk" FOREIGN KEY ("merch_id") REFERENCES "public"."merch"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_merch_id_idx" ON "payload_locked_documents_rels" USING btree ("merch_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merch" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merch_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_merch_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_merch_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "merch" CASCADE;
  DROP TABLE "merch_rels" CASCADE;
  DROP TABLE "_merch_v" CASCADE;
  DROP TABLE "_merch_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_merch_fk";
  
  DROP INDEX "payload_locked_documents_rels_merch_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "merch_id";
  DROP TYPE "public"."enum_merch_status";
  DROP TYPE "public"."enum__merch_v_version_status";`)
}
