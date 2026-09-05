import { NextResponse } from 'next/server'

/**
 * Sends X-Robots-Tag on every response when this is a demo deployment.
 *
 * This lives in middleware rather than next.config's headers(), which is
 * evaluated at build time and therefore cannot see a runtime environment
 * variable. The first production deploy shipped with no noindex at all for
 * exactly that reason: the image was built without SITE_IS_DEMO set, so the
 * header block compiled away to nothing.
 *
 * This is a redesign concept for a real business, hosted on a domain we
 * control. It must never be indexed, or it could compete with — or be mistaken
 * for — the real phatbrewclub.com.
 */
export function middleware() {
  const res = NextResponse.next()
  if (process.env.SITE_IS_DEMO === 'true') {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return res
}

export const config = {
  // Everything except Next's own static output, which crawlers do not index.
  matcher: ['/((?!_next/static|_next/image|favicon.png).*)'],
}
