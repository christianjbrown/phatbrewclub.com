import Link from 'next/link'
import type { Venue } from '@/lib/types'

const NAV: [string, string, [string, string][]?][] = [
  ['Venues', '/venues', [['West Perth', '/venues/west-perth'], ['Hillarys', '/venues/hillarys']]],
  ['Beers', '/beers'],
  ["What's on", '/whats-on'],
  ['Functions', '/functions', [['West Perth', '/functions/west-perth'], ['Hillarys', '/functions/hillarys']]],
  ['Shop', '/shop'],
  ['About', '/about'],
  ['Contact', '/contact'],
]

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
      <a className="book" href="#book">Book a table</a>
    </div>
  </header>
)

export const Footer = ({ venues }: { venues: Venue[] }) => (
  <footer>
    <div className="wrap">
      <div className="grid g4">
        {venues.map((v) => (
          <div key={v.id}>
            <h4>{v.shortName.toUpperCase()}</h4>
            <p style={{ fontSize: 15, color: 'var(--muted)', margin: '0 0 8px' }}>
              {v.address.street}, {v.address.suburb} {v.address.state} {v.address.postcode}
            </p>
            {v.phone ? <a href={`tel:${v.phone.replace(/\s/g, '')}`}>{v.phone}</a> : null}
            <br />
            <Link href={`/venues/${v.slug}`}>Hours and menus</Link>
          </div>
        ))}
        <div>
          <h4>EXPLORE</h4>
          <Link href="/beers">Beers</Link><br />
          <Link href="/whats-on">What&apos;s on</Link><br />
          <Link href="/shop">Shop</Link><br />
          <Link href="/about">About</Link>
        </div>
        <div>
          <h4>ENQUIRIES</h4>
          <Link href="/functions/west-perth">Functions</Link><br />
          <Link href="/contact">Contact</Link>
        </div>
      </div>
      <p className="legal">Phat Brew Club · Independent brewery, Western Australia</p>
    </div>
  </footer>
)
