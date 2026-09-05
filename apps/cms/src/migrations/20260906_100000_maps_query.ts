import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * An explicit Google Maps place name per venue.
 *
 * The Hillarys venue trades as The Trophy Room, and searching that name plus
 * its address put the map pin on The Breakwater next door. Google lists it as
 * "Phat Brew Club Hillarys", so the query needs to be settable rather than
 * derived from the name and address.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "venues" ADD COLUMN "maps_query" varchar;
  ALTER TABLE "_venues_v" ADD COLUMN "version_maps_query" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "venues" DROP COLUMN "maps_query";
  ALTER TABLE "_venues_v" DROP COLUMN "version_maps_query";`)
}
