import type { Metadata } from 'next'
import './globals.css'
import { LiveChat } from '@/components/LiveChat'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/**
 * Rendered per request rather than prerendered at build.
 *
 * The CMS is a separate service, so it is deliberately not reachable during the
 * container build — and in production a momentary CMS blip must not fail a
 * deploy. Caching still happens, one layer down: every CMS read is a tagged
 * `fetch` with a 300s window, and the publish webhook clears those tags, so an
 * edit still appears immediately. HTML caching is the CDN's job, which is the
 * layer the old site had switched off entirely (`cache-control: no-cache`).
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Phat Brew Club — craft brewery in West Perth and Hillarys',
    template: '%s | Phat Brew Club',
  },
  description:
    'Independent Perth brewery with two venues: Phat HQ in West Perth and The Trophy Room at Hillarys Boat Harbour. Twenty taps, brewed on site.',
  openGraph: { type: 'website', locale: 'en_AU', siteName: 'Phat Brew Club' },
  twitter: { card: 'summary_large_image' },
  // The brand's own icons, at the sizes each surface actually asks for.
  icons: {
    icon: [
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: { title: 'Phat Brew Club', statusBarStyle: 'black-translucent' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Read per request, not through NEXT_PUBLIC_, which is inlined at build time.
  // Both must be present: half a pair points the widget at nothing.
  const tawkProperty = process.env.TAWK_PROPERTY_ID
  const tawkWidget = process.env.TAWK_WIDGET_ID

  return (
    <html lang="en-AU">
      <head>
        {/* Self-hosted, so no preconnect to a third-party font host is needed.
            Preloaded because the first paint depends on it. */}
        <link
          rel="preload"
          href="/fonts/rubik-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
        {tawkProperty && tawkWidget ? (
          <LiveChat propertyId={tawkProperty} widgetId={tawkWidget} />
        ) : null}
      </body>
    </html>
  )
}
