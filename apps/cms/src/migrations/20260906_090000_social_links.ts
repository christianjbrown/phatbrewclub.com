import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * TikTok and YouTube on the settings global.
 *
 * The brewery links four accounts, not two. Instagram and Facebook were in the
 * sameAs block in their page source; TikTok only appears in the rendered
 * footer, so it took running the page to find, and the YouTube channel is
 * linked from nowhere on the site at all.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "settings" ADD COLUMN "tiktok" varchar;
  ALTER TABLE "settings" ADD COLUMN "youtube" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "settings" DROP COLUMN "tiktok";
  ALTER TABLE "settings" DROP COLUMN "youtube";`)
}
