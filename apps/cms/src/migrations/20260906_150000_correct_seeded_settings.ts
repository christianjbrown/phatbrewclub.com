import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Correct the settings an earlier seed wrote, now that the site reads them.
 *
 * While nothing read these fields their contents did not matter, and the seed
 * had drifted: a seven-item nav with no drop-downs, "Book a table" on a button
 * that was changed to "Book", and a bare "Phat Brew Club" as the site title.
 * The moment the header and the metadata started reading Site settings, all
 * three of those went live — News and the homebrew comp dropped out of the
 * menu, both sub-menus disappeared, and the home page lost the descriptive
 * half of its title. This puts the stored values back to what the site was
 * serving before.
 *
 * The seed would normally do this, but it refuses to run against production
 * without explicit admin credentials, which is a guard worth keeping.
 *
 * Guarded on there being no drop-down rows: the intended nav has two, so their
 * absence identifies the stale list. If anyone has since built a nav of their
 * own with sub-menus, this leaves it alone.
 */
const NAV: [string, string, [string, string][]?][] = [
  ['Venues', '/venues', [['West Perth', '/venues/west-perth'], ['Hillarys', '/venues/hillarys']]],
  ['Beers', '/beers'],
  ["What's on", '/whats-on'],
  ['News', '/news'],
  ['Functions', '/functions', [['West Perth', '/functions/west-perth'], ['Hillarys', '/functions/hillarys']]],
  ['Shop', '/shop'],
  ['Homebrew comp', '/homebrew-comp'],
  ['About', '/about'],
  ['Contact', '/contact'],
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const stale = await db.execute(sql`
    SELECT (SELECT count(*) FROM "settings_main_nav_children") AS children,
           (SELECT id FROM "settings" ORDER BY id LIMIT 1) AS settings_id`)
  const row = (stale.rows ?? stale)[0] as { children: string | number; settings_id: number | null }
  if (!row?.settings_id || Number(row.children) > 0) return

  // One statement per execute. A parameterised query is sent as a prepared
  // statement, and Postgres refuses to put more than one command in one — the
  // multi-statement blocks in the migrations above get away with it only
  // because none of them interpolate a value.
  await db.execute(sql`
    UPDATE "settings" SET
      "booking_label" = 'Book',
      "default_title" = 'Phat Brew Club — craft brewery in West Perth and Hillarys'
    WHERE "id" = ${row.settings_id}`)
  await db.execute(sql`DELETE FROM "settings_main_nav" WHERE "_parent_id" = ${row.settings_id}`)

  for (const [order, [label, url, children]] of NAV.entries()) {
    const id = `nav${String(order + 1).padStart(2, '0')}${Date.now().toString(36)}`
    await db.execute(sql`
      INSERT INTO "settings_main_nav" ("_order", "_parent_id", "id", "label", "url")
      VALUES (${order + 1}, ${row.settings_id}, ${id}, ${label}, ${url})`)
    for (const [childOrder, [childLabel, childUrl]] of (children ?? []).entries()) {
      await db.execute(sql`
        INSERT INTO "settings_main_nav_children" ("_order", "_parent_id", "id", "label", "url")
        VALUES (${childOrder + 1}, ${id}, ${`${id}c${childOrder + 1}`}, ${childLabel}, ${childUrl})`)
    }
  }
}

/**
 * Nothing to undo. This corrects content rather than changing shape, and
 * putting an out-of-date menu back is not an improvement.
 */
export async function down({ db: _db }: MigrateDownArgs): Promise<void> {}
