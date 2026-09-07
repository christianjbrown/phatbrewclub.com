import type { Beer, FunctionPackage, Menu, Merch, Page, Paginated, PhatEvent, Post, TapList, Venue, Settings } from '../types'

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

import { TTL, sortByText } from './contract'
import type { SearchHit } from './contract'

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
  api<Paginated<Venue>>('venues', { depth: 1, limit: 10, sort: 'name' }, ['venues'])
    .then((r) => sortByText(r.docs, (v) => v.name))

export const getVenue = (slug: string) =>
  api<Paginated<Venue>>('venues', { depth: 1, limit: 1, 'where[slug][equals]': slug }, ['venues'])
    .then((r) => r.docs[0] ?? null)

export const getBeers = (category?: string) =>
  api<Paginated<Beer>>(
    'beers',
    { depth: 1, limit: 100, sort: 'name', ...(category ? { 'where[category][equals]': category } : {}) },
    ['beers'],
  ).then((r) => sortByText(r.docs, (b) => b.name))

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


export const getPages = () =>
  api<Paginated<Page>>('pages', { depth: 2, limit: 50 }, ['pages']).then((r) => r.docs)

export const getPage = (slug: string) =>
  api<Paginated<Page>>('pages', { depth: 2, limit: 1, 'where[slug][equals]': slug }, ['pages'])
    .then((r) => r.docs[0] ?? null)

// depth 2, not 0: menu item photos are an upload relationship two levels down,
// and at depth 0 they come back as bare ids with no derivatives to pick from.
export const getMenus = (venueId: number | string) =>
  api<Paginated<Menu>>('menus', { depth: 2, limit: 10, 'where[venue][equals]': String(venueId) }, ['menus'])
    .then((r) => r.docs)

export const getPosts = () =>
  api<Paginated<Post>>('posts', { depth: 1, limit: 50, sort: '-publishedAt' }, ['posts']).then((r) => r.docs)

export const getPost = (slug: string) =>
  api<Paginated<Post>>('posts', { depth: 1, limit: 1, 'where[slug][equals]': slug }, ['posts'])
    .then((r) => r.docs[0] ?? null)

/**
 * Globals are a single document, so there is no docs array to unwrap. Failing
 * soft: the footer's social links are not worth a 500 if the CMS blips.
 */
export const getSettings = async (): Promise<Settings> => {
  try {
    return await api<Settings>('globals/settings', { depth: 1 }, ['settings'])
  } catch {
    return {}
  }
}

/**
 * The function spaces for one venue.
 *
 * The collection has existed since the start and nothing read it, so anything
 * entered here went nowhere — the same trap as the settings fields that edited
 * nothing. Empty is the honest default: the brewery publishes no space or price
 * detail today, so the page says so until they put some in here.
 */
export const getFunctionPackages = (venueId: number | string) =>
  api<Paginated<FunctionPackage>>(
    'function-packages',
    { depth: 1, limit: 20, sort: 'name', 'where[venue][equals]': String(venueId) },
    ['function-packages'],
  ).then((r) => sortByText(r.docs, (f) => f.name))

export const getMerch = () =>
  api<Paginated<Merch>>('merch', { depth: 1, limit: 50, sort: 'title' }, ['merch'])
    .then((r) => sortByText(r.docs, (m) => m.title))


export const search = async (q: string): Promise<SearchHit[]> => {
  const term = q.trim()
  if (term.length < 2) return []

  const grab = async <T>(path: string, query: Query, map: (docs: T[]) => SearchHit[]) => {
    try {
      const r = await api<Paginated<T>>(path, query, [path])
      return map(r.docs)
    } catch {
      return []
    }
  }

  const [beers, events, posts, pages, merch] = await Promise.all([
    grab<Beer>('beers', { depth: 0, limit: 20, 'where[name][like]': term }, (d) =>
      d.map((b) => ({ title: b.name, href: `/beers/${b.slug}`, kind: 'Beer', detail: b.style ?? undefined })),
    ),
    grab<PhatEvent>('events', { depth: 0, limit: 20, 'where[title][like]': term }, (d) =>
      d.map((e) => ({ title: e.title, href: `/whats-on/${e.slug}`, kind: "What's on" })),
    ),
    grab<Post>('posts', { depth: 0, limit: 20, 'where[title][like]': term }, (d) =>
      d.map((p) => ({ title: p.title, href: `/news/${p.slug}`, kind: 'News' })),
    ),
    grab<Page>('pages', { depth: 0, limit: 20, 'where[title][like]': term }, (d) =>
      d.map((p) => ({ title: p.title, href: `/${p.slug}`, kind: 'Page' })),
    ),
    grab<Merch>('merch', { depth: 0, limit: 20, 'where[title][like]': term }, (d) =>
      d.map((m) => ({ title: m.title, href: '/shop', kind: 'Shop' })),
    ),
  ])

  return [...beers, ...events, ...posts, ...pages, ...merch]
}
