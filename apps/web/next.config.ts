import type { NextConfig } from 'next'

const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3011'
const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL ?? 'http://localhost:9000'

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [cmsUrl, mediaUrl].map((u) => {
      const { protocol, hostname, port } = new URL(u)
      return { protocol: protocol.replace(':', '') as 'http' | 'https', hostname, port, pathname: '/**' }
    }),
    formats: ['image/avif', 'image/webp'],
  },
}

export default config
