import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * What an event costs, when the cost is not admission.
 *
 * Every priced event on this site is a food or drink special: the $25 on Mega
 * Burger Monday is the burger, not the door. It was rendered under a heading
 * reading ENTRY, and quoted to search engines in the Event schema as the price
 * of attending.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "events" ADD COLUMN "price_note" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_price_note" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "events" DROP COLUMN "price_note";
  ALTER TABLE "_events_v" DROP COLUMN "version_price_note";`)
}
