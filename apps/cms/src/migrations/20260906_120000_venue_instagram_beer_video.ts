import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Per-venue Instagram, and a video id on beers.
 *
 * Each venue runs its own Instagram account — phatbrewclub for West Perth,
 * phatbrewclubhillarys for Hillarys — so one site-wide handle sent half the
 * audience to the wrong place.
 *
 * The video is the brewery's own West Is Best film, which their homepage
 * embeds and ours did not.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "venues" ADD COLUMN "instagram" varchar;
  ALTER TABLE "_venues_v" ADD COLUMN "version_instagram" varchar;
  ALTER TABLE "beers" ADD COLUMN "video_id" varchar;
  ALTER TABLE "_beers_v" ADD COLUMN "version_video_id" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "venues" DROP COLUMN "instagram";
  ALTER TABLE "_venues_v" DROP COLUMN "version_instagram";
  ALTER TABLE "beers" DROP COLUMN "video_id";
  ALTER TABLE "_beers_v" DROP COLUMN "version_video_id";`)
}
