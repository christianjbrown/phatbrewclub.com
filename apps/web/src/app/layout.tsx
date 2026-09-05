import type { Metadata } from 'next'
import './globals.css'

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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  )
}
