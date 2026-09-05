import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "sizes_can_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_can_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_can_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_can_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_can_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_can_filename" varchar;
  CREATE INDEX "media_sizes_can_sizes_can_filename_idx" ON "media" USING btree ("sizes_can_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_sizes_can_sizes_can_filename_idx";
  ALTER TABLE "media" DROP COLUMN "sizes_can_url";
  ALTER TABLE "media" DROP COLUMN "sizes_can_width";
  ALTER TABLE "media" DROP COLUMN "sizes_can_height";
  ALTER TABLE "media" DROP COLUMN "sizes_can_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_can_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_can_filename";`)
}
