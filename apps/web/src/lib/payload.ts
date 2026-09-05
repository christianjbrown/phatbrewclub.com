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

const absolute = (url: string) => (url.startsWith('http') ? url : `${CMS_PUBLIC}${url}`)

/** Media URLs come back relative to the CMS; make them absolute. */
export const mediaUrl = (m?: { url?: string } | null): string | null => {
  if (!m?.url) return null
  return absolute(m.url)
}

type Sized = {
  url?: string
  sizes?: Record<string, { url?: string | null; width?: number | null } | undefined>
}

/**
 * A srcset across whatever derivatives exist, so a phone downloads an 800px
 * hero rather than the 1600px one. Without this the mobile LCP is dominated by
 * an image three times larger than the screen it lands on.
 */
export const mediaSrcSet = (m: Sized | null | undefined, sizes: string[]): string | undefined => {
  if (!m?.sizes) return undefined
  const parts = sizes
    .map((key) => m.sizes?.[key])
    .filter((v): v is { url?: string | null; width?: number | null } => Boolean(v?.url && v?.width))
    .map((v) => `${absolute(v.url!)} ${v.width}w`)
  return parts.length > 1 ? parts.join(', ') : undefined
}

/**
 * Payload generates thumbnail/card/hero/square variants on upload. Serving the
 * original into a small box is exactly the mistake the old site made — its logo
 * was requested at 2400px to render at 140px. Ask for the size you are actually
 * going to display, and fall back to the original only if it is missing.
 */
export const mediaSize = (m: Sized | null | undefined, size: 'thumbnail' | 'card' | 'hero' | 'square'): string | null => {
  if (!m) return null
  const variant = m.sizes?.[size]?.url
  if (variant) return absolute(variant)
  return m.url ? absolute(m.url) : null
}
