import type { NextConfig } from 'next'

/**
 * The image host allow-list must be static.
 *
 * This used to be derived from NEXT_PUBLIC_CMS_URL and NEXT_PUBLIC_MEDIA_URL,
 * which are inlined at build time — and the container build passes neither, so
 * production baked in `localhost:3011` and `localhost:9000`. Every request to
 * /_next/image answered 400, while local development worked perfectly. That is
 * the same build-time-versus-runtime trap that made the noindex header do
 * nothing, and it would have been a silent landmine for anyone reaching for
 * next/image later.
 *
 * Nothing on the site uses next/image today: derivatives are generated once on
 * upload and served straight from object storage with a year-long immutable
 * cache, so no resizing happens at request time. The allow-list is kept narrow
 * and correct anyway, because an image optimiser that will proxy any host is an
 * open proxy.
 */
const IMAGE_HOSTS: { protocol: 'http' | 'https'; hostname: string; port?: string }[] = [
  { protocol: 'https', hostname: 'storage.googleapis.com' },
  { protocol: 'https', hostname: 'cms.pbc.christianbrown.uk' },
  // Local development: MinIO and the CMS.
  { protocol: 'http', hostname: 'localhost', port: '9000' },
  { protocol: 'http', hostname: 'localhost', port: '3011' },
]

const config: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: IMAGE_HOSTS.map((h) => ({ ...h, pathname: '/**' })),
    formats: ['image/avif', 'image/webp'],
    // Widths the optimiser will answer for. Anything else is a 400, so the
    // endpoint cannot be walked through thousands of sizes to burn CPU.
    deviceSizes: [640, 828, 1080, 1200, 1600, 1920],
    imageSizes: [400, 440, 800],
    qualities: [75, 80],
    // Derivatives are immutable, so there is no reason to re-fetch or re-encode.
    minimumCacheTTL: 31536000,
  },
}

export default config
