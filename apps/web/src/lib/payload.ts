import type { Beer, Paginated, PhatEvent, TapList, Venue } from './types'

const CMS = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3011'

/** Seconds. Content changes rarely; the CMS webhook revalidates on publish. */
const TTL = 300

type Query = Record<string, string | number | undefined>

async function api<T>(path: string, query: Query = {}, tags: string[] = []): Promise<T> {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) if (v !== undefined) qs.set(k, String(v))
  const url = `${CMS}/api/${path}${qs.size ? `?${qs}` : ''}`

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

/** Media URLs come back relative to the CMS; make them absolute for next/image. */
export const mediaUrl = (m?: { url?: string } | null): string | null => {
  if (!m?.url) return null
  return m.url.startsWith('http') ? m.url : `${CMS}${m.url}`
}
