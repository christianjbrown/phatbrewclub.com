import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

/**
 * Every tag lib/payload.ts attaches to a read, so a publish can clear the one
 * it affects.
 *
 * Four were missing — posts, merch, function-packages and settings — which
 * meant publishing a news post or changing a social link did not match any
 * known tag and fell through to "clear everything". Harmless while nothing
 * called this endpoint, and wasteful the moment something does.
 */
const TAGS = [
  'venues',
  'beers',
  'tap-lists',
  'events',
  'menus',
  'pages',
  'posts',
  'merch',
  'function-packages',
  'settings',
] as const

/**
 * Called by the CMS after a publish so pages refresh immediately rather than
 * waiting out the 300-second revalidate window.
 */
export async function POST(req: Request) {
  const secret = req.headers.get('x-revalidate-secret')
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, error: 'bad secret' }, { status: 401 })
  }

  let collection: string | undefined
  try {
    collection = ((await req.json()) as { collection?: string })?.collection
  } catch {
    // no body is fine — fall through and revalidate everything
  }

  const toClear = collection && (TAGS as readonly string[]).includes(collection) ? [collection] : TAGS
  toClear.forEach((t) => revalidateTag(t, 'max'))

  return NextResponse.json({ revalidated: true, tags: toClear, at: Date.now() })
}
