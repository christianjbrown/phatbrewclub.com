import type { Beer, Menu, Merch, Page, Paginated, PhatEvent, Post, TapList, Venue } from './types'

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

export const getPages = () =>
  api<Paginated<Page>>('pages', { depth: 2, limit: 50 }, ['pages']).then((r) => r.docs)

export const getPage = (slug: string) =>
  api<Paginated<Page>>('pages', { depth: 2, limit: 1, 'where[slug][equals]': slug }, ['pages'])
    .then((r) => r.docs[0] ?? null)

export const getMenus = (venueId: number | string) =>
  api<Paginated<Menu>>('menus', { depth: 0, limit: 10, 'where[venue][equals]': String(venueId) }, ['menus'])
    .then((r) => r.docs)

export const getPosts = () =>
  api<Paginated<Post>>('posts', { depth: 1, limit: 50, sort: '-publishedAt' }, ['posts']).then((r) => r.docs)

export const getPost = (slug: string) =>
  api<Paginated<Post>>('posts', { depth: 1, limit: 1, 'where[slug][equals]': slug }, ['posts'])
    .then((r) => r.docs[0] ?? null)

export const getMerch = () =>
  api<Paginated<Merch>>('merch', { depth: 1, limit: 50, sort: 'title' }, ['merch']).then((r) => r.docs)

/** Media URLs come back relative to the CMS; make them absolute. */
export const mediaUrl = (m?: { url?: string } | null): string | null => {
  if (!m?.url) return null
  return absolute(m.url)
}

type Sized = {
  url?: string
  sizes?: Record<string, { url?: string | null; width?: number | null; height?: number | null } | undefined>
}

/** Largest first, so a fallback walks down rather than off the edge. */
const SIZE_ORDER = ['hero', 'square', 'card', 'can', 'thumbnail'] as const

/**
 * Payload generates derivatives on upload but skips any target larger than the
 * source, since it will not upscale. Falling back to the original in that case
 * serves the biggest file on the page — the can artwork was shipping a 202KB
 * PNG to fill a 215px card.
 *
 * So: ask for a size, and if it is missing take the next smaller one that
 * exists. The original is a last resort, not the first fallback.
 */
export const mediaSize = (
  m: Sized | null | undefined,
  size: 'thumbnail' | 'card' | 'hero' | 'square' | 'can',
): string | null => {
  if (!m) return null

  const exact = m.sizes?.[size]?.url
  if (exact) return absolute(exact)

  // Walk down from the requested size through whatever was generated.
  const from = SIZE_ORDER.indexOf(size as (typeof SIZE_ORDER)[number])
  const candidates = from === -1 ? SIZE_ORDER : SIZE_ORDER.slice(from + 1)
  for (const key of candidates) {
    const url = m.sizes?.[key]?.url
    if (url) return absolute(url)
  }

  // Nothing generated at all (an SVG, or an upload smaller than every target).
  return m.url ? absolute(m.url) : null
}

/**
 * Candidates in one srcset must be the same shape.
 *
 * The browser picks a candidate on width alone and then draws it into the box
 * the layout has already reserved, so a differently-proportioned candidate is
 * silently stretched. The beer cards shipped `['thumbnail', 'can']`, which
 * offered a 400x300 landscape crop and a 440x550 portrait one for the same
 * 520x650 slot: every 1x screen got a squashed, top-and-bottom-cropped decal.
 * `['card', 'hero']` had the same fault at 4:3 against 16:9.
 *
 * Rather than trusting each call site to pair them correctly, drop any
 * candidate whose aspect ratio does not match the largest one — that is the
 * shape the layout was built around, and the one `mediaSize` returns for `src`.
 */
const ASPECT_TOLERANCE = 0.02

export const mediaSrcSet = (m: Sized | null | undefined, sizes: string[]): string | undefined => {
  if (!m?.sizes) return undefined
  const found = sizes
    .map((key) => m.sizes?.[key])
    .filter((v): v is { url?: string | null; width?: number | null; height?: number | null } =>
      Boolean(v?.url && v?.width),
    )
  if (found.length < 2) return undefined

  const ratio = (v: { width?: number | null; height?: number | null }) =>
    v.width && v.height ? v.width / v.height : null

  const largest = found.reduce((a, b) => ((b.width ?? 0) > (a.width ?? 0) ? b : a))
  const target = ratio(largest)

  const parts = found
    .filter((v) => {
      const r = ratio(v)
      // A derivative with no recorded height cannot be checked, so keep it
      // rather than dropping a usable candidate on missing metadata.
      if (target === null || r === null) return true
      return Math.abs(r - target) / target <= ASPECT_TOLERANCE
    })
    .map((v) => `${absolute(v.url!)} ${v.width}w`)

  return parts.length > 1 ? parts.join(', ') : undefined
}
