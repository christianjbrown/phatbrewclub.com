import type {
  Beer, FunctionPackage, Menu, Merch, Page, PhatEvent, Post, Settings, TapList, Venue,
} from '../types'

/**
 * What a CMS has to provide for this website to render.
 *
 * Two implementations satisfy it — Payload and WordPress — and the same
 * container serves both, choosing at boot from CMS_KIND. That is what makes
 * "the same site, a different CMS" a claim rather than a slogan: if the two
 * front ends ever differed by so much as a rebuild, every number a comparison
 * produced would be about the image instead of the platform.
 */
export type SearchHit = { title: string; href: string; kind: string; detail?: string }

/**
 * Seconds. Deliberately shared rather than set per adapter: if one site
 * revalidated on a different window the comparison would be measuring cache
 * policy.
 */
export const TTL = 300

export type CmsAdapter = {
  getVenues(): Promise<Venue[]>
  getVenue(slug: string): Promise<Venue | null>
  getBeers(category?: string): Promise<Beer[]>
  getBeer(slug: string): Promise<Beer | null>
  getTapList(venueId: number | string): Promise<TapList | null>
  getEvents(limit?: number): Promise<PhatEvent[]>
  getEvent(slug: string): Promise<PhatEvent | null>
  getPage(slug: string): Promise<Page | null>
  getPosts(): Promise<Post[]>
  getPost(slug: string): Promise<Post | null>
  getMenus(venueId: number | string): Promise<Menu[]>
  getMerch(): Promise<Merch[]>
  getFunctionPackages(venueId: number | string): Promise<FunctionPackage[]>
  getSettings(): Promise<Settings>
  search(q: string): Promise<SearchHit[]>
}

/**
 * Let a build proceed when the CMS is unreachable.
 *
 * generateStaticParams and the sitemap both call this, so a momentary CMS blip
 * degrades a route to on-demand rendering rather than failing the container
 * build. Transport-independent, so it lives here rather than in either adapter.
 */
export const safeList = async <T>(fn: () => Promise<T[]>): Promise<T[]> => {
  try {
    return await fn()
  } catch {
    return []
  }
}
