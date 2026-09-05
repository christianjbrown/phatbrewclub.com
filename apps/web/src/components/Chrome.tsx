import Link from 'next/link'
import { Newsletter } from './Newsletter'
import { getSettings } from '@/lib/payload'
import { FacebookIcon, InstagramIcon, TikTokIcon, UntappdIcon, YouTubeIcon } from './SocialIcons'
import type { Venue } from '@/lib/types'

const NAV: [string, string, [string, string][]?][] = [
  ['Venues', '/venues', [['West Perth', '/venues/west-perth'], ['Hillarys', '/venues/hillarys']]],
  ['Beers', '/beers'],
  ["What's on", '/whats-on'],
  ['News', '/news'],
  ['Functions', '/functions', [['West Perth', '/functions/west-perth'], ['Hillarys', '/functions/hillarys']]],
  ['Shop', '/shop'],
  ['Homebrew comp', '/homebrew-comp'],
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
      <Link className="brand" href="/" aria-label="Phat Brew Club home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* 240px source for a 120px slot, so it stays sharp on dense screens.
            WebP with a PNG fallback: both carry the transparent background the
            mark needs against the orange bar. */}
        <picture>
          <source srcSet="/logo.webp" type="image/webp" />
          <img src="/logo.png" alt="Phat Brew Club" width={120} height={120} />
        </picture>
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
      {/* A plain GET form in the header, so search works with no JavaScript and
          a result is a shareable URL. */}
      <form className="hd-search" action="/search" method="get" role="search">
        <label className="sr-only" htmlFor="hd-q">Search</label>
        <input id="hd-q" name="q" type="search" placeholder="Search" autoComplete="off" />
      </form>
      <Link className="book" href="/venues">Book</Link>
    </div>
  </header>
)

export const Footer = async ({ venues }: { venues: Venue[] }) => {
  const settings = await getSettings()
  const socials: [string, string][] = (
    [
      // Each venue runs its own Instagram, so one generic link sent half the
      // audience to the wrong account.
      ...venues
        .filter((v) => v.instagram)
        .map((v) => [`Instagram · ${v.shortName}`, v.instagram] as [string, string | null | undefined]),
      ['Facebook', settings.facebook],
      ['TikTok', settings.tiktok],
      ['YouTube', settings.youtube],
      ['Untappd', settings.untappd],
    ] as [string, string | null | undefined][]
  )
    .filter((s) => Boolean(s[1]))
    .map(([label, url]) => [label, url as string])

  return (
  <footer>
    <div className="wrap">
      <div className="grid g4">
        {venues.map((v) => (
          <div key={v.id}>
            <h2 className="fh">{v.shortName.toUpperCase()}</h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', margin: '0 0 8px' }}>
              {v.address.street}, {v.address.suburb} {v.address.state} {v.address.postcode}
            </p>
            <Link href={`/venues/${v.slug}`}>Venue</Link>
            {' · '}
            <Link href={`/venues/${v.slug}/menu`}>Menu</Link>
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
      <Newsletter />
      {socials.length ? (
        <p className="socials">
          {socials.map(([label, url]) => {
            const Icon = {
              Instagram: InstagramIcon,
              'Instagram · West Perth': InstagramIcon,
              'Instagram · Hillarys': InstagramIcon,
              Facebook: FacebookIcon,
              TikTok: TikTokIcon,
              YouTube: YouTubeIcon,
              Untappd: UntappdIcon,
            }[label] ?? UntappdIcon
            return (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer me">
                <Icon />
                {label}
              </a>
            )
          })}
        </p>
      ) : null}
      <p className="legal">Phat Brew Club · Independent brewery, Western Australia</p>
    </div>
  </footer>
  )
}
