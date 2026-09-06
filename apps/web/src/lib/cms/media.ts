import type { Media } from '../types'

/**
 * Where a browser can reach the media.
 *
 * Payload returns CMS-relative URLs and WordPress returns absolute bucket ones,
 * so this is a no-op for one and load-bearing for the other. It must be the
 * public hostname rather than the internal one: this value ends up in a `src`
 * attribute, and using the cluster-internal name is how you ship a page full of
 * broken images that works perfectly in local development.
 */
const CMS_PUBLIC =
  process.env.NEXT_PUBLIC_CMS_URL ?? process.env.NEXT_PUBLIC_WP_URL ?? 'http://localhost:3011'

const absolute = (url: string) => (url.startsWith('http') ? url : `${CMS_PUBLIC}${url}`)

/**
 * Media helpers, shared by both adapters.
 *
 * These are pure functions over the Media shape and contain the hard-won part
 * of this file: the walk down the size ladder, and the aspect-ratio filter that
 * keeps a srcset from offering candidates of different shapes. Neither CMS gets
 * its own copy, because a difference here would show up as a layout shift on one
 * site and not the other, and be read as a platform difference.
 */
/** Media URLs come back relative to the CMS; make them absolute. */
export const mediaUrl = (m?: { url?: string } | null): string | null => {
  if (!m?.url) return null
  return absolute(m.url)
}

type Sized = {
  url?: string
  sizes?: Record<string, { url?: string | null; width?: number | null; height?: number | null } | undefined>
}

export type MediaSize = 'micro' | 'thumbnail' | 'small' | 'card' | 'hero'

/** Largest first, so a fallback walks down rather than off the edge. */
const SIZE_ORDER = ['hero', 'card', 'small', 'thumbnail', 'micro'] as const

/**
 * The dimensions a derivative actually has.
 *
 * Hard-coding width and height on an <img> reserves space during load, which is
 * worth having — but only if the numbers are true. The cards claimed 700x440
 * and 800x600 for artwork that is portrait, so the browser reserved a landscape
 * box and the CSS then cropped the picture to fill it. Ask the CMS instead.
 */
export const mediaDims = (
  m: Sized | null | undefined,
  size: MediaSize,
): { width: number; height: number } | undefined => {
  if (!m) return undefined
  const from = SIZE_ORDER.indexOf(size)
  for (const key of [size, ...SIZE_ORDER.slice(from + 1)]) {
    const s = m.sizes?.[key]
    if (s?.url && s.width && s.height) return { width: s.width, height: s.height }
  }
  return undefined
}

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
  size: MediaSize,
): string | null => {
  if (!m) return null

  const exact = m.sizes?.[size]?.url
  if (exact) return absolute(exact)

  // Walk down from the requested size through whatever was generated.
  const from = SIZE_ORDER.indexOf(size)
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

/**
 * Site search.
 *
 * Payload's REST `like` is a case-insensitive contains, which is enough for a
 * site this size and avoids standing up a search index for a few hundred
 * documents. Each collection is queried for the fields a visitor would actually
 * type — a beer's name and style, an event's title, a page's title — and the
 * results are merged.
 *
 * Collections are queried in parallel and a failure in one does not empty the
 * page: a search that returns beers but no events is more useful than an error.
 */
