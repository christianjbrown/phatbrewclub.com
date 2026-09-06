import type { Metadata } from 'next'
import { mediaSize } from './payload'

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
 *  cards want that neither Facebook nor Twitter crops anything important. */
const FALLBACK = { url: `${SITE}/video/hero-poster-1280.jpg`, width: 1280, height: 720 }

type Sized = Parameters<typeof mediaSize>[0]

/** Largest derivative available, which is what a social card should get. */
export const ogImage = (m: Sized, alt?: string) => {
  const url = mediaSize(m, 'hero')
  return url ? { url, alt: alt ?? undefined } : null
}

export const pageMeta = ({
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
}): Metadata => {
  const url = `${SITE}${path === '/' ? '' : path}`
  const images = [image ?? FALLBACK]

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: url },
    openGraph: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      url,
      type,
      images,
    },
    twitter: { card: 'summary_large_image', images },
  }
}
