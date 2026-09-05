import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

const TAGS = ['venues', 'beers', 'tap-lists', 'events', 'menus', 'pages'] as const

/**
 * Called by Payload after a publish so the static pages refresh immediately
 * rather than waiting out the revalidate window.
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
