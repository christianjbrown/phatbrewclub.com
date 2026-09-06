import type { Metadata } from 'next'
import { getSettings, mediaSize } from './payload'

/**
 * Open Graph and canonical URLs, in one place.
 *
 * Every page had a title and a description and no og:image at all, so a link
 * shared to Instagram, Facebook or a group chat showed a bare grey box — for a
 * brewery, where nearly all the traffic arrives through exactly those channels.
 *
 * The image is always a real one from the page: the venue's photograph, the
 * beer's can, the event's poster. The site-wide fallback is the hero still, not
 * a logo on a flat colour — a card wants a photograph.
 */
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/** The hero video's poster frame. 1280x720, which is close enough to the 1.91:1
 *  cards want that neither Facebook nor Twitter crops anything important.
 *
 *  Only reached when Site settings has no default image: the CMS one wins, so
 *  the picture on a shared link is a choice somebody made rather than whatever
 *  frame the homepage video happens to start on. */
const BUILT_IN_FALLBACK = { url: `${SITE}/video/hero-poster-1280.jpg`, width: 1280, height: 720 }

/** The SEO defaults tab in Site settings, in the shape this file wants. */
const defaults = async () => {
  const settings = await getSettings()
  const url = mediaSize(settings.defaultImage, 'hero')
  return {
    description: settings.defaultDescription?.trim() || undefined,
    image: url ? { url, alt: settings.defaultImage?.alt } : null,
  }
}

type Sized = Parameters<typeof mediaSize>[0]

/** Largest derivative available, which is what a social card should get. */
export const ogImage = (m: Sized, alt?: string) => {
  const url = mediaSize(m, 'hero')
  return url ? { url, alt: alt ?? undefined } : null
}

export const pageMeta = async ({
  title,
  description,
  path,
  image,
  type = 'website',
}: {
  title?: string
  description?: string
  /** Path only, e.g. /beers/west-is-best. Canonical is built from it. */
  path: string
  image?: { url: string; alt?: string } | null
  type?: 'website' | 'article'
}): Promise<Metadata> => {
  const url = `${SITE}${path === '/' ? '' : path}`
  const site = await defaults()
  const images = [image ?? site.image ?? BUILT_IN_FALLBACK]
  /**
   * A page's own description wins; the CMS default fills in behind it.
   *
   * The fallback has to be applied here rather than left to Next, because
   * metadata merges shallowly: any page that sets an openGraph block at all
   * replaces the layout's entirely, so an og:description inherited from the
   * layout would silently disappear from every page this function touches.
   */
  const desc = description ?? site.description

  return {
    ...(desc ? { description: desc } : {}),
    ...(title ? { title } : {}),
    alternates: { canonical: url },
    openGraph: {
      ...(title ? { title } : {}),
      ...(desc ? { description: desc } : {}),
      url,
      type,
      images,
    },
    twitter: { card: 'summary_large_image', images },
  }
}
