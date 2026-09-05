import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_sizes_square_sizes_square_filename_idx";
  ALTER TABLE "menus_sections_items" ADD COLUMN "image_id" integer;
  ALTER TABLE "menus_sections_items" ADD COLUMN "image_credit" varchar;
  ALTER TABLE "menus_sections_items" ADD CONSTRAINT "menus_sections_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "menus_sections_items_image_idx" ON "menus_sections_items" USING btree ("image_id");
  ALTER TABLE "media" DROP COLUMN "sizes_square_url";
  ALTER TABLE "media" DROP COLUMN "sizes_square_width";
  ALTER TABLE "media" DROP COLUMN "sizes_square_height";
  ALTER TABLE "media" DROP COLUMN "sizes_square_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_square_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_square_filename";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menus_sections_items" DROP CONSTRAINT "menus_sections_items_image_id_media_id_fk";
  
  DROP INDEX "menus_sections_items_image_idx";
  ALTER TABLE "media" ADD COLUMN "sizes_square_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_square_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_square_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_square_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_square_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_square_filename" varchar;
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  ALTER TABLE "menus_sections_items" DROP COLUMN "image_id";
  ALTER TABLE "menus_sections_items" DROP COLUMN "image_credit";`)
}
