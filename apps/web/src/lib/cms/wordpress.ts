import type {
  Beer, FunctionPackage, Menu, Merch, Page, PhatEvent, Post, Settings, TapList, Venue,
} from '../types'
import { TTL } from './contract'
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
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) if (v !== undefined) qs.set(k, String(v))
  const url = `${WP_INTERNAL}/wp-json/phat/v1/${path}${qs.size ? `?${qs}` : ''}`

  const res = await fetch(url, { next: { revalidate: TTL, tags } })

  // A 404 is a real answer for a by-slug lookup — the page does not exist —
  // rather than a failure, so it is left to the caller to turn into null.
  if (!res.ok && res.status !== 404) throw new Error(`WP ${res.status} for ${path}`)

  return (res.status === 404 ? null : await res.json()) as T
}

export const getVenues = () => api<Venue[]>('venues', {}, ['venues'])
export const getVenue = (slug: string) => api<Venue | null>(`venues/${slug}`, {}, ['venues'])

export const getBeers = (category?: string) => api<Beer[]>('beers', { category }, ['beers'])
export const getBeer = (slug: string) => api<Beer | null>(`beers/${slug}`, {}, ['beers'])

export const getTapList = (venueId: number | string) =>
  api<TapList | null>('tap-list', { venue: String(venueId) }, ['tap-lists'])

export const getEvents = (limit = 50) => api<PhatEvent[]>('events', { limit }, ['events'])
export const getEvent = (slug: string) => api<PhatEvent | null>(`events/${slug}`, {}, ['events'])

export const getPage = (slug: string) => api<Page | null>(`pages/${slug}`, {}, ['pages'])

export const getPosts = () => api<Post[]>('posts', {}, ['posts'])
export const getPost = (slug: string) => api<Post | null>(`posts/${slug}`, {}, ['posts'])

export const getMenus = (venueId: number | string) =>
  api<Menu[]>('menus', { venue: String(venueId) }, ['menus'])

export const getMerch = () => api<Merch[]>('merch', {}, ['merch'])

export const getFunctionPackages = (venueId: number | string) =>
  api<FunctionPackage[]>('function-packages', { venue: String(venueId) }, ['function-packages'])

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
    return await api<SearchHit[]>('search', { q: term }, ['beers', 'events', 'posts', 'pages'])
  } catch {
    return []
  }
}
