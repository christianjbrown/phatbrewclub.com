import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Replace the "can" size with two new rungs, micro (240) and small (600).
 *
 * Written by hand rather than generated. The generator offered to rename
 * sizes_can_* to sizes_micro_*, which would have carried the old 440px
 * filenames into a column meaning 240px — every menu thumbnail would then point
 * at a file of the wrong size. These are separate columns; the can values are
 * dropped and the media re-uploaded.
 *
 * "can" existed to give the portrait crop the landscape sizes destroyed. Sizes
 * are pure resizes now, so at 440 it was doing nothing 400 did not.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "media" ADD COLUMN "sizes_micro_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_micro_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_micro_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_micro_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_micro_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_micro_filename" varchar;
  CREATE INDEX "media_sizes_micro_sizes_micro_filename_idx" ON "media" USING btree ("sizes_micro_filename");
  ALTER TABLE "media" ADD COLUMN "sizes_small_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_small_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_small_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_small_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_small_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_small_filename" varchar;
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  DROP INDEX "media_sizes_can_sizes_can_filename_idx";
  ALTER TABLE "media" DROP COLUMN "sizes_can_url";
  ALTER TABLE "media" DROP COLUMN "sizes_can_width";
  ALTER TABLE "media" DROP COLUMN "sizes_can_height";
  ALTER TABLE "media" DROP COLUMN "sizes_can_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_can_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_can_filename";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "media" ADD COLUMN "sizes_can_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_can_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_can_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_can_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_can_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_can_filename" varchar;
  CREATE INDEX "media_sizes_can_sizes_can_filename_idx" ON "media" USING btree ("sizes_can_filename");
  DROP INDEX "media_sizes_micro_sizes_micro_filename_idx";
  ALTER TABLE "media" DROP COLUMN "sizes_micro_url";
  ALTER TABLE "media" DROP COLUMN "sizes_micro_width";
  ALTER TABLE "media" DROP COLUMN "sizes_micro_height";
  ALTER TABLE "media" DROP COLUMN "sizes_micro_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_micro_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_micro_filename";
  DROP INDEX "media_sizes_small_sizes_small_filename_idx";
  ALTER TABLE "media" DROP COLUMN "sizes_small_url";
  ALTER TABLE "media" DROP COLUMN "sizes_small_width";
  ALTER TABLE "media" DROP COLUMN "sizes_small_height";
  ALTER TABLE "media" DROP COLUMN "sizes_small_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_small_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_small_filename";`)
}
