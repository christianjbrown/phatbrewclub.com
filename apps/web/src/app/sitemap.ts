import type { MetadataRoute } from 'next'
import { getBeers, getEvents, getVenues, safeList } from '@/lib/payload'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [venues, beers, events] = await Promise.all([
    safeList(getVenues),
    safeList(() => getBeers()),
    safeList(() => getEvents(100)),
  ])
  const now = new Date()

  const statics = ['', '/venues', '/beers', '/whats-on', '/about', '/contact', '/shop', '/functions']

  return [
    ...statics.map((p) => ({ url: `${SITE}${p}`, lastModified: now, priority: p === '' ? 1 : 0.7 })),
    ...venues.map((v) => ({ url: `${SITE}/venues/${v.slug}`, lastModified: now, priority: 0.9 })),
    ...venues.map((v) => ({ url: `${SITE}/functions/${v.slug}`, lastModified: now, priority: 0.6 })),
    ...beers.map((b) => ({ url: `${SITE}/beers/${b.slug}`, lastModified: now, priority: 0.6 })),
    // Past events drop out of the sitemap on their own, which the old site could not do.
    ...events
      .filter((e) => new Date(e.startsAt) >= now)
      .map((e) => ({ url: `${SITE}/whats-on/${e.slug}`, lastModified: now, priority: 0.5 })),
  ]
}
