import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "venues_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "_venues_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "venues" ADD COLUMN "hours_label" varchar;
  ALTER TABLE "venues" ADD COLUMN "public_holiday_note" varchar;
  ALTER TABLE "_venues_v" ADD COLUMN "version_hours_label" varchar;
  ALTER TABLE "_venues_v" ADD COLUMN "version_public_holiday_note" varchar;
  ALTER TABLE "venues_faqs" ADD CONSTRAINT "venues_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_version_faqs" ADD CONSTRAINT "_venues_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "venues_faqs_order_idx" ON "venues_faqs" USING btree ("_order");
  CREATE INDEX "venues_faqs_parent_id_idx" ON "venues_faqs" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_version_faqs_order_idx" ON "_venues_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_venues_v_version_faqs_parent_id_idx" ON "_venues_v_version_faqs" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "venues_faqs" CASCADE;
  DROP TABLE "_venues_v_version_faqs" CASCADE;
  ALTER TABLE "venues" DROP COLUMN "hours_label";
  ALTER TABLE "venues" DROP COLUMN "public_holiday_note";
  ALTER TABLE "_venues_v" DROP COLUMN "version_hours_label";
  ALTER TABLE "_venues_v" DROP COLUMN "version_public_holiday_note";`)
}
