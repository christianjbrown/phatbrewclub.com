/**
 * Mirrors me&u menus into the CMS so they are on-site and indexable, while
 * staff carry on authoring in me&u exactly as they do now.
 *
 * Deliberately conservative:
 *   - Off unless MEANDU_SYNC_ENABLED === 'true'.
 *   - On any failure it leaves the previous snapshot in place rather than
 *     writing an empty menu. A blank menu is worse than a stale one.
 *   - Writes are additive per venue; nothing else in the CMS is touched.
 *
 * Status: venue resolution is verified working against the live gateway.
 * The menu query below still needs confirming — me&u disables GraphQL
 * introspection, so the operation has to be captured from their own client
 * or, better, requested from me&u along with permission to mirror the data.
 * Until then this exits as "not configured" rather than guessing.
 */

const GATEWAY = process.env.MEANDU_GATEWAY ?? 'https://ap1-guest-gateway.meandu.app/graphql'
const CMS = process.env.CMS_INTERNAL_URL ?? 'http://localhost:3000'
const ENABLED = process.env.MEANDU_SYNC_ENABLED === 'true'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/140.0 Safari/537.36'

const gql = async (query, variables, operationName) => {
  const res = await fetch(GATEWAY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ query, variables, operationName }),
  })
  if (!res.ok) throw new Error(`gateway HTTP ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw new Error(`gateway: ${json.errors[0].message}`)
  return json.data
}

/** Verified working against the live gateway. */
const VENUE_QUERY = `query v($venueSlug: String!) {
  guestVenue(slug: $venueSlug) { id name }
}`

const resolveVenue = (slug) => gql(VENUE_QUERY, { venueSlug: slug }, 'v').then((d) => d.guestVenue)

const main = async () => {
  if (!ENABLED) {
    console.log('meandu-sync: disabled (MEANDU_SYNC_ENABLED is not "true") — exiting without writing')
    return
  }

  const venuesRes = await fetch(`${CMS}/api/venues?depth=0&limit=50`)
  if (!venuesRes.ok) throw new Error(`CMS HTTP ${venuesRes.status}`)
  const { docs: venues } = await venuesRes.json()

  let ok = 0
  let skipped = 0

  for (const venue of venues) {
    if (!venue.meanduSlug) {
      console.log(`  ${venue.shortName}: no meanduSlug set, skipping`)
      skipped++
      continue
    }
    try {
      const remote = await resolveVenue(venue.meanduSlug)
      if (!remote?.id) throw new Error('venue not found upstream')
      console.log(`  ${venue.shortName}: resolved upstream as ${remote.name} (${remote.id})`)

      // The menu fetch goes here once the operation is confirmed. Until then
      // we stop short of writing, so a half-known schema cannot blank a menu.
      console.log(`  ${venue.shortName}: menu query not yet confirmed — no write performed`)
      skipped++
    } catch (err) {
      // Loud, but non-fatal per venue: one venue failing must not take the
      // other's menu down with it.
      console.error(`  ${venue.shortName}: ${err.message} — leaving previous snapshot in place`)
      skipped++
    }
  }

  console.log(`meandu-sync: ${ok} updated, ${skipped} skipped`)
}

main().catch((err) => {
  console.error(`meandu-sync failed: ${err.message}`)
  process.exit(1)
})
