import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Phat Brew Club',
    short_name: 'Phat',
    description: 'Independent Perth brewery with two venues.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#FF6F20',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
}
