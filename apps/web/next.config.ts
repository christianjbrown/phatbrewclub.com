import type { NextConfig } from 'next'

const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3011'
const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL ?? 'http://localhost:9000'

const config: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  /**
   * This is a redesign concept for a real business, hosted on a domain we
   * control. It must never be indexed, or it could compete with — or be
   * mistaken for — the real phatbrewclub.com.
   *
   * A header rather than only robots.txt: robots.txt asks a crawler not to
   * look, X-Robots-Tag tells it not to index what it already fetched. Set here
   * so it cannot be forgotten on a new route.
   */
  async headers() {
    if (process.env.SITE_IS_DEMO !== 'true') return []
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },

  images: {
    remotePatterns: [cmsUrl, mediaUrl].map((u) => {
      const { protocol, hostname, port } = new URL(u)
      return { protocol: protocol.replace(':', '') as 'http' | 'https', hostname, port, pathname: '/**' }
    }),
    formats: ['image/avif', 'image/webp'],
  },
}

export default config
