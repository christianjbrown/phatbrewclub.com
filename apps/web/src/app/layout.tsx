import type { Metadata } from 'next'
import './globals.css'
import { LiveChat } from '@/components/LiveChat'
import { getSettings, mediaSize } from '@/lib/cms'

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

/**
 * The site-wide title, description and social image come from Site settings.
 *
 * They were hard-coded here, which meant the one line the brewery is most
 * likely to want to change — the sentence Google prints under their name — was
 * the one line they could not. The values below are the fallback for an empty
 * CMS, not the source of truth.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const title =
    settings.defaultTitle?.trim() || 'Phat Brew Club — craft brewery in West Perth and Hillarys'
  const description =
    settings.defaultDescription?.trim() ||
    'Independent Perth brewery with two venues: Phat HQ in West Perth and The Trophy Room at Hillarys Boat Harbour. Twenty taps, brewed on site.'
  const image = mediaSize(settings.defaultImage, 'hero')

  return {
    metadataBase: new URL(SITE),
    title: { default: title, template: '%s | Phat Brew Club' },
    description,
    openGraph: {
      type: 'website',
      locale: 'en_AU',
      siteName: 'Phat Brew Club',
      title,
      description,
      ...(image ? { images: [{ url: image, alt: settings.defaultImage?.alt }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      ...(image ? { images: [{ url: image, alt: settings.defaultImage?.alt }] } : {}),
    },
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
