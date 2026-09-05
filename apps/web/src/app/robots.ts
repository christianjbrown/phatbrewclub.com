import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Rendered per request, not baked at build. Metadata routes are static by
// default, which meant the built image always shipped the non-demo rules
// regardless of what SITE_IS_DEMO said at runtime.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  // Demo deployments are closed to crawlers entirely, and advertise no sitemap.
  // The real rules stay intact for an actual production deploy.
  if (process.env.SITE_IS_DEMO === 'true') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: `${SITE}/sitemap.xml`,
  }
}
