import Link from 'next/link'
import type { Venue } from '@/lib/types'

const NAV: [string, string, [string, string][]?][] = [
  ['Venues', '/venues', [['West Perth', '/venues/west-perth'], ['Hillarys', '/venues/hillarys']]],
  ['Beers', '/beers'],
  ["What's on", '/whats-on'],
  ['News', '/news'],
  ['Functions', '/functions', [['West Perth', '/functions/west-perth'], ['Hillarys', '/functions/hillarys']]],
  ['Shop', '/shop'],
  ['About', '/about'],
  ['Contact', '/contact'],
]

/**
 * The homebrew comp sits in the footer, not the primary nav. On the old site it
 * held a top-level slot on every page for four months after it finished; it
 * belongs in the nav while it is running and nowhere else, which is a content
 * decision the CMS can now make rather than a deploy.
 */

export const Header = ({ current }: { current?: string }) => (
  <header>
    <div className="hd">
      <Link href="/" aria-label="Phat Brew Club home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Phat Brew Club" width={58} height={58} />
      </Link>
      <nav aria-label="Main">
        <ul>
          {NAV.map(([label, href, sub]) =>
            sub ? (
              <li className="has-sub" key={href}>
                <Link href={href} aria-haspopup="true" {...(current === href ? { 'aria-current': 'page' as const } : {})}>
                  {label}
                  <span className="caret" aria-hidden="true">▾</span>
                </Link>
                <ul className="sub">
                  {sub.map(([sl, sh]) => (
                    <li key={sh}><Link href={sh}>{sl}</Link></li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={href}>
                <Link href={href} {...(current === href ? { 'aria-current': 'page' as const } : {})}>{label}</Link>
              </li>
            ),
          )}
        </ul>
      </nav>
      <Link className="book" href="/venues">Book a table</Link>
    </div>
  </header>
)

export const Footer = ({ venues }: { venues: Venue[] }) => (
  <footer>
    <div className="wrap">
      <div className="grid g4">
        {venues.map((v) => (
          <div key={v.id}>
            <h2 className="fh">{v.shortName.toUpperCase()}</h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', margin: '0 0 8px' }}>
              {v.address.street}, {v.address.suburb} {v.address.state} {v.address.postcode}
            </p>
            <Link href={`/venues/${v.slug}`}>Hours and menus</Link>
          </div>
        ))}
        <div>
          <h2 className="fh">EXPLORE</h2>
          <Link href="/beers">Beers</Link><br />
          <Link href="/whats-on">What&apos;s on</Link><br />
          <Link href="/news">News</Link><br />
          <Link href="/shop">Shop</Link><br />
          <Link href="/about">About</Link>
        </div>
        <div>
          <h2 className="fh">ENQUIRIES</h2>
          <Link href="/functions/west-perth">Functions</Link><br />
          <Link href="/contact">Contact</Link><br />
          <Link href="/homebrew-comp">Homebrew comp</Link>
        </div>
      </div>
      <p className="legal">Phat Brew Club · Independent brewery, Western Australia</p>
    </div>
  </footer>
)
