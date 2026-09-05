import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

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
