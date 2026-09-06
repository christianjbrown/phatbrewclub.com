import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Drop-down items under a main-nav link, and the end of settings.instagram.
 *
 * The header's Venues and Functions entries both have sub-menus, so a flat
 * list of links could never describe the real navigation. Without the nested
 * array, moving the nav into the CMS would have meant losing the drop-downs.
 *
 * Instagram goes because the venues run separate accounts and the footer
 * builds its links from the venues. The column was read by nothing, so the one
 * Instagram field visible in Site settings did nothing at all when edited.
 *
 * Written by hand, like the migrations above it. The generator diffs against
 * the Drizzle snapshot rather than the database, and the snapshots stopped at
 * add_functions_pack, so it offers to re-create everything since.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "settings_main_nav_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  ALTER TABLE "settings_main_nav_children" ADD CONSTRAINT "settings_main_nav_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_main_nav"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "settings_main_nav_children_order_idx" ON "settings_main_nav_children" USING btree ("_order");
  CREATE INDEX "settings_main_nav_children_parent_id_idx" ON "settings_main_nav_children" USING btree ("_parent_id");
  ALTER TABLE "settings" DROP COLUMN "instagram";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE "settings_main_nav_children" CASCADE;
  ALTER TABLE "settings" ADD COLUMN "instagram" varchar;`)
}
