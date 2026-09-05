import type { Media } from './types'

export type Shot = { thumb: string; full: string; alt: string }

/**
 * Plain data mapping, deliberately not in the Lightbox component file. That
 * file is 'use client', which makes everything it exports a client function —
 * and a server component calling one throws at request time rather than at
 * build. Keeping this here lets the page build its props on the server and pass
 * them down.
 */
export const toShots = (
  gallery: Media[] | null | undefined,
  thumb: (m: Media) => string | null,
  full: (m: Media) => string | null,
  fallbackAlt: string,
): Shot[] =>
  (gallery ?? [])
    .map((m) => {
      const t = thumb(m)
      const f = full(m)
      return t && f ? { thumb: t, full: f, alt: m.alt || fallbackAlt } : null
    })
    .filter((s): s is Shot => s !== null)
