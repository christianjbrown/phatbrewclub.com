import type {
  Beer, FunctionPackage, Menu, Merch, Page, PhatEvent, Post, Settings, TapList, Venue,
} from '../types'
import { TTL, sortByText } from './contract'
import type { SearchHit } from './contract'

/**
 * The WordPress adapter.
 *
 * Deliberately thin. A plugin in the phatbrewclub-wp repository publishes a
 * `phat/v1` namespace that already returns the shapes in types.ts, so there is
 * nothing to map here — the reshaping lives beside the field definitions, in
 * PHP, where a change to the storage plugin never reaches this file.
 *
 * The cache tags and the window are the same strings the Payload adapter uses,
 * from the shared contract, because a difference in either would make the two
 * sites differ in a way that had nothing to do with the CMS.
 */
const WP_INTERNAL =
  process.env.WP_INTERNAL_URL ?? process.env.NEXT_PUBLIC_WP_URL ?? 'http://localhost:8090'

type Query = Record<string, string | number | undefined>

async function api<T>(path: string, query: Query = {}, tags: string[] = []): Promise<T> {
  /**
   * ?rest_route= rather than /wp-json/.
   *
   * The two are equivalent, but /wp-json only resolves through WordPress's
   * rewrite rules, and pretty permalinks are one `wp rewrite flush` away from
   * being off — which is exactly how the first deploy 404d every endpoint while
   * the admin looked perfectly healthy. This form goes straight to index.php and
   * works on any WordPress, however its permalinks are configured.
   */
  const qs = new URLSearchParams({ rest_route: `/phat/v1/${path}` })
  for (const [k, v] of Object.entries(query)) if (v !== undefined) qs.set(k, String(v))
  const url = `${WP_INTERNAL}/?${qs}`

  const res = await fetch(url, { next: { revalidate: TTL, tags } })

  // A 404 is a real answer for a by-slug lookup — the page does not exist —
  // rather than a failure, so it becomes null rather than an error.
  if (!res.ok && res.status !== 404) throw new Error(`WP ${res.status} for ${path}`)

  return (res.status === 404 ? null : await res.json()) as T
}

/**
 * A list endpoint that 404s has no items; it does not have null items.
 *
 * Without this the first deploy rendered a 500 on every page: WordPress
 * installs with plain permalinks so /wp-json did not resolve, every list came
 * back null, and the homepage called .find on it. A missing collection should
 * degrade to an empty page, the way the Payload adapter's safeList does.
 */
const list = async <T>(p: Promise<T[] | null>): Promise<T[]> => (await p) ?? []

export const getVenues = async () => sortByText(await list(api<Venue[] | null>('venues', {}, ['venues'])), (v) => v.name)
export const getVenue = (slug: string) => api<Venue | null>(`venues/${slug}`, {}, ['venues'])

export const getBeers = async (category?: string) =>
  sortByText(await list(api<Beer[] | null>('beers', { category }, ['beers'])), (b) => b.name)
export const getBeer = (slug: string) => api<Beer | null>(`beers/${slug}`, {}, ['beers'])

export const getTapList = (venueId: number | string) =>
  api<TapList | null>('tap-list', { venue: String(venueId) }, ['tap-lists'])

export const getEvents = (limit = 50) => list(api<PhatEvent[] | null>('events', { limit }, ['events']))
export const getEvent = (slug: string) => api<PhatEvent | null>(`events/${slug}`, {}, ['events'])

export const getPage = (slug: string) => api<Page | null>(`pages/${slug}`, {}, ['pages'])

export const getPosts = () => list(api<Post[] | null>('posts', {}, ['posts']))
export const getPost = (slug: string) => api<Post | null>(`posts/${slug}`, {}, ['posts'])

export const getMenus = (venueId: number | string) =>
  list(api<Menu[] | null>('menus', { venue: String(venueId) }, ['menus']))

export const getMerch = async () => sortByText(await list(api<Merch[] | null>('merch', {}, ['merch'])), (m) => m.title)

export const getFunctionPackages = async (venueId: number | string) =>
  sortByText(
    await list(api<FunctionPackage[] | null>('function-packages', { venue: String(venueId) }, ['function-packages'])),
    (f) => f.name,
  )

/**
 * Failing soft, exactly as the Payload adapter does: the footer's social links
 * and the announcement bar are not worth a 500 if the CMS blips.
 */
export const getSettings = async (): Promise<Settings> => {
  try {
    return await api<Settings>('settings', {}, ['settings'])
  } catch {
    return {}
  }
}

export const search = async (q: string): Promise<SearchHit[]> => {
  const term = q.trim()
  if (term.length < 2) return []

  try {
    return (await api<SearchHit[] | null>('search', { q: term }, ['beers', 'events', 'posts', 'pages'])) ?? []
  } catch {
    return []
  }
}
