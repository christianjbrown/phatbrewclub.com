import React from 'react'

/**
 * Wraps the CMS root, which does nothing but redirect to /admin. The scaffold
 * version carried Payload's own stylesheet and the metadata title "Payload
 * Blank Template", which is what the browser tab said on a live domain.
 */
export const metadata = {
  title: 'Phat Brew Club CMS',
  description: 'Content management for phatbrewclub.com.',
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
