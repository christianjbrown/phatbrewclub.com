import type { Beer, Paginated, PhatEvent, TapList, Venue } from './types'

/**
 * Two different addresses for the same service, deliberately.
 *
 * CMS_INTERNAL is used for server-side data fetching and can be a cluster-only
 * name like http://cms:3000. CMS_PUBLIC is what ends up in `src` attributes, so
 * it must be resolvable from a visitor's browser. Using one value for both is
 * how you ship a page full of broken images that works fine in local dev.
 */
const CMS_INTERNAL =
  process.env.CMS_INTERNAL_URL ?? process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3011'
const CMS_PUBLIC = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3011'

/** Seconds. Content changes rarely; the CMS webhook revalidates on publish. */
const TTL = 300

type Query = Record<string, string | number | undefined>

async function api<T>(path: string, query: Query = {}, tags: string[] = []): Promise<T> {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) if (v !== undefined) qs.set(k, String(v))
  const url = `${CMS_INTERNAL}/api/${path}${qs.size ? `?${qs}` : ''}`

  const res = await fetch(url, { next: { revalidate: TTL, tags } })
  if (!res.ok) throw new Error(`CMS ${res.status} for ${path}`)
  return res.json() as Promise<T>
}

export const getVenues = () =>
  api<Paginated<Venue>>('venues', { depth: 1, limit: 10, sort: 'name' }, ['venues']).then((r) => r.docs)

export const getVenue = (slug: string) =>
  api<Paginated<Venue>>('venues', { depth: 1, limit: 1, 'where[slug][equals]': slug }, ['venues'])
    .then((r) => r.docs[0] ?? null)

export const getBeers = (category?: string) =>
  api<Paginated<Beer>>(
    'beers',
    { depth: 1, limit: 100, sort: 'name', ...(category ? { 'where[category][equals]': category } : {}) },
    ['beers'],
  ).then((r) => r.docs)

export const getBeer = (slug: string) =>
  api<Paginated<Beer>>('beers', { depth: 2, limit: 1, 'where[slug][equals]': slug }, ['beers'])
    .then((r) => r.docs[0] ?? null)

export const getTapList = (venueId: number | string) =>
  api<Paginated<TapList>>('tap-lists', { depth: 2, limit: 1, 'where[venue][equals]': String(venueId) }, ['tap-lists'])
    .then((r) => r.docs[0] ?? null)

export const getEvents = (limit = 50) =>
  api<Paginated<PhatEvent>>('events', { depth: 1, limit, sort: 'startsAt' }, ['events']).then((r) => r.docs)

export const getEvent = (slug: string) =>
  api<Paginated<PhatEvent>>('events', { depth: 1, limit: 1, 'where[slug][equals]': slug }, ['events'])
    .then((r) => r.docs[0] ?? null)

/**
 * For build-time callers (generateStaticParams, sitemap) the CMS may simply not
 * be reachable — it is not running inside the image build, and in production a
 * momentary CMS blip should not fail a deploy. These callers degrade to an empty
 * list; the routes then render on demand at runtime instead of being prebuilt.
 */
export const safeList = async <T>(fn: () => Promise<T[]>): Promise<T[]> => {
  try {
    return await fn()
  } catch (err) {
    console.warn(`[cms] unreachable at build time, falling back to on-demand rendering: ${
      err instanceof Error ? err.message : String(err)
    }`)
    return []
  }
}

/** Media URLs come back relative to the CMS; make them absolute for next/image. */
export const mediaUrl = (m?: { url?: string } | null): string | null => {
  if (!m?.url) return null
  return m.url.startsWith('http') ? m.url : `${CMS_PUBLIC}${m.url}`
}
