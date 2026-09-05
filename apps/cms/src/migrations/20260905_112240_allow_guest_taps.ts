import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tap_lists_taps" ALTER COLUMN "beer_id" DROP NOT NULL;
  ALTER TABLE "tap_lists_taps" ADD COLUMN "guest_name" varchar;
  ALTER TABLE "tap_lists_taps" ADD COLUMN "guest_style" varchar;
  ALTER TABLE "tap_lists_taps" ADD COLUMN "price" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tap_lists_taps" ALTER COLUMN "beer_id" SET NOT NULL;
  ALTER TABLE "tap_lists_taps" DROP COLUMN "guest_name";
  ALTER TABLE "tap_lists_taps" DROP COLUMN "guest_style";
  ALTER TABLE "tap_lists_taps" DROP COLUMN "price";`)
}
