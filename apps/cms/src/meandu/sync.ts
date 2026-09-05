import { getPayload } from 'payload'
import config from '../payload.config.js'
import { MENU_QUERY, VENUE_QUERY, type MenuCategory } from './queries.js'

const GATEWAY = process.env.MEANDU_GATEWAY ?? 'https://ap1-guest-gateway.meandu.app/graphql'
const ENABLED = process.env.MEANDU_SYNC_ENABLED === 'true'
const CATEGORIES = (process.env.MEANDU_CATEGORIES ?? 'beers-ciders,food').split(',').map((s) => s.trim())

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'

const gql = async <T>(query: string, variables: Record<string, unknown>, operationName: string): Promise<T> => {
  const res = await fetch(GATEWAY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ query, variables, operationName }),
  })
  if (!res.ok) throw new Error(`gateway HTTP ${res.status}`)
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] }
  if (json.errors?.length) throw new Error(`gateway: ${json.errors[0]!.message}`)
  if (!json.data) throw new Error('gateway returned no data')
  return json.data
}

/**
 * Refuse to write anything that does not look like a menu. The contract is
 * undocumented, so a shape change must fail loudly and leave the previous
 * snapshot in place — a stale menu is recoverable, a blank one loses a
 * customer mid-decision.
 */
const assertUsable = (cat: MenuCategory | null | undefined, where: string): MenuCategory => {
  if (!cat) throw new Error(`${where}: no category returned`)
  if (!Array.isArray(cat.menuSections)) throw new Error(`${where}: menuSections is not an array`)
  const items = cat.menuSections.flatMap((s) => s.menuItems ?? [])
  if (items.length === 0) throw new Error(`${where}: zero items, refusing to overwrite`)
  if (!items.every((i) => typeof i.name === 'string' && i.name.length > 0)) {
    throw new Error(`${where}: an item has no name`)
  }
  return cat
}

/** Loose match: me&u writes names differently from the CMS ("West Is Best" vs
 *  "West is Best Lager"), so compare on letters and digits only. */
const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '')

const run = async () => {
  if (!ENABLED) {
    console.log('meandu-sync: disabled (MEANDU_SYNC_ENABLED is not "true") — exiting without writing')
    return
  }

  const payload = await getPayload({ config })
  const { docs: venues } = await payload.find({ collection: 'venues', limit: 50, depth: 0 })

  let updated = 0
  let skipped = 0

  for (const venue of venues as unknown as { id: number | string; shortName: string; meanduSlug?: string }[]) {
    if (!venue.meanduSlug) {
      console.log(`  ${venue.shortName}: no meanduSlug set, skipping`)
      skipped++
      continue
    }

    try {
      const { guestVenue } = await gql<{ guestVenue: { id: string; name: string } | null }>(
        VENUE_QUERY, { venueSlug: venue.meanduSlug }, 'venue',
      )
      if (!guestVenue) throw new Error(`venue "${venue.meanduSlug}" not found upstream`)

      for (const categorySlug of CATEGORIES) {
        // Each category is handled independently. Venues do not all carry the
        // same ones — Hillarys publishes food but no drinks category — and one
        // absent category must not cost a venue the menus it does have.
        try {
          const { guestMenuCategory } = await gql<{ guestMenuCategory: MenuCategory | null }>(
            MENU_QUERY,
            { venueSlug: venue.meanduSlug, orderingType: 'MENU', categorySlug },
            'menu',
          )
          const cat = assertUsable(guestMenuCategory, `${venue.shortName}/${categorySlug}`)

          const sections = cat.menuSections
            .filter((s) => !s.isUnavailable)
            .map((s) => ({
              name: s.name,
              items: (s.menuItems ?? [])
                .filter((i) => i.isAvailable !== false)
                .map((i) => ({
                  name: i.name,
                  price: i.priceData?.displayPrice ?? '',
                  dietary: (i.dietaryTags ?? []).join(', '),
                  description: i.descriptionPlain ?? '',
                })),
            }))

          const data = {
            name: `${venue.shortName} — ${cat.name}`,
            venue: venue.id,
            meanduId: cat.id,
            syncedAt: new Date().toISOString(),
            sections,
          }

          const found = await payload.find({
            collection: 'menus',
            where: { meanduId: { equals: cat.id } },
            limit: 1,
          })
          if (found.totalDocs) {
            await payload.update({ collection: 'menus', id: found.docs[0]!.id, data: data as never })
          } else {
            await payload.create({ collection: 'menus', data: data as never })
          }

          const count = sections.reduce((n, s) => n + s.items.length, 0)
          console.log(`  ${venue.shortName}/${categorySlug}: ${sections.length} sections, ${count} items`)
          updated++

          // The "On Tap" section is the live tap list. Mirror it so the site can
          // answer "what is pouring right now" without anyone retyping it.
          const onTap = cat.menuSections.find((sec) => /on tap/i.test(sec.name))
          if (onTap) {
            const { docs: allBeers } = await payload.find({ collection: 'beers', limit: 200, depth: 0 })
            const byName = new Map(
              (allBeers as unknown as { id: number | string; name: string }[]).map((b) => [norm(b.name), b.id]),
            )

            const taps = (onTap.menuItems ?? [])
              .filter((i) => i.isAvailable !== false)
              .map((item, idx) => {
                const key = norm(item.name)
                // Try exact, then containment either way, so "West Is Best" and
                // "West is Best Lager" resolve to the same beer.
                let beerId = byName.get(key)
                if (!beerId) {
                  for (const [name, id] of byName) {
                    if (name.length > 4 && (key.includes(name) || name.includes(key))) { beerId = id; break }
                  }
                }
                return {
                  tapNumber: idx + 1,
                  ...(beerId ? { beer: beerId } : { guestName: item.name, guestStyle: '' }),
                  price: item.priceData?.displayPrice ?? '',
                  kegBlown: false,
                }
              })

            const matched = taps.filter((t) => 'beer' in t).length
            const tapData = {
              venue: venue.id,
              taps,
              source: 'meandu' as const,
              syncedAt: new Date().toISOString(),
            }
            const existing = await payload.find({
              collection: 'tap-lists',
              where: { venue: { equals: venue.id } },
              limit: 1,
            })
            if (existing.totalDocs) {
              await payload.update({ collection: 'tap-lists', id: existing.docs[0]!.id, data: tapData as never })
            } else {
              await payload.create({ collection: 'tap-lists', data: tapData as never })
            }
            console.log(
              `  ${venue.shortName}: tap list refreshed, ${taps.length} taps (${matched} matched to a beer, ${taps.length - matched} guest)`,
            )
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          // "Not Found" means the venue simply does not publish this category.
          const absent = /not found/i.test(msg)
          console.log(
            `  ${venue.shortName}/${categorySlug}: ${absent ? 'not published by this venue' : msg}`,
          )
          skipped++
        }
      }
    } catch (err) {
      console.error(
        `  ${venue.shortName}: ${err instanceof Error ? err.message : String(err)} — previous snapshot left in place`,
      )
      skipped++
    }
  }

  console.log(`meandu-sync: ${updated} menus updated, ${skipped} skipped`)
  process.exit(0)
}

run().catch((err) => {
  console.error(`meandu-sync failed: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})
