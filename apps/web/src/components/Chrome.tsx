import Link from 'next/link'
import { Newsletter } from './Newsletter'
import { getSettings } from '@/lib/cms'
import { FacebookIcon, InstagramIcon, TikTokIcon, UntappdIcon, YouTubeIcon } from './SocialIcons'
import type { NavLink, Settings, Venue } from '@/lib/types'

/**
 * The menu the site falls back to when Site settings has no links in it.
 *
 * It is a fallback, not the source of truth: the nav is editable in the CMS,
 * and this is what gets used before anyone has touched it, or if the list is
 * emptied by accident. A brewery should not need a deploy to add a page to its
 * own menu, and should not be able to leave itself with no menu at all.
 */
const DEFAULT_NAV: NavLink[] = [
  { label: 'Venues', url: '/venues', children: [
    { label: 'West Perth', url: '/venues/west-perth' },
    { label: 'Hillarys', url: '/venues/hillarys' },
  ] },
  { label: 'Beers', url: '/beers' },
  { label: "What's on", url: '/whats-on' },
  { label: 'News', url: '/news' },
  { label: 'Functions', url: '/functions', children: [
    { label: 'West Perth', url: '/functions/west-perth' },
    { label: 'Hillarys', url: '/functions/hillarys' },
  ] },
  { label: 'Shop', url: '/shop' },
  { label: 'Homebrew comp', url: '/homebrew-comp' },
  { label: 'About', url: '/about' },
  { label: 'Contact', url: '/contact' },
]

/** The calendar date an instant falls on in Perth, as YYYY-MM-DD. */
const perthDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Perth' }).format(d)

/**
 * The announcement bar, which is off unless there is something to say.
 *
 * The end date is checked here rather than left to whoever wrote the notice:
 * the failure mode of a bar like this is a "closed Monday" still sitting on the
 * site in March, so it takes itself down. "Until the 8th" means the whole of
 * the 8th in Perth, so it is still up on the evening of the last day.
 *
 * Comparing Perth calendar dates rather than doing arithmetic on the stored
 * instant is deliberate. Payload records what the picker produced, and that is
 * midnight UTC or midnight Perth depending on the editor's browser — two
 * instants sixteen hours apart that mean the same day. Both land on the 8th in
 * Perth, so both behave the same. An offset added by hand only works for one of
 * them, which is how the first version of this took the bar down at eight in
 * the morning on the last day it was meant to run.
 */
const Announcement = ({ settings }: { settings: Settings }) => {
  const message = settings.announcement?.trim()
  if (!message) return null

  if (settings.announcementUntil) {
    const until = new Date(settings.announcementUntil)
    if (!Number.isNaN(until.getTime()) && perthDate(new Date()) > perthDate(until)) return null
  }

  const url = settings.announcementUrl?.trim()
  return (
    <div className="announce">
      {url ? <Link href={url}>{message}</Link> : <span>{message}</span>}
    </div>
  )
}

export const Header = async ({ current }: { current?: string }) => {
  const settings = await getSettings()
  const nav = settings.mainNav?.length ? settings.mainNav : DEFAULT_NAV
  const bookingLabel = settings.bookingLabel?.trim() || 'Book'

  return (
  <header>
    <Announcement settings={settings} />
    <div className="hd">
      {/*
        The mobile menu is a checkbox, not a script.
        
        Below 860px the nav and the search box move into a panel this toggles,
        because inline they made the header 218px tall — a quarter of a phone
        screen, on every page, and sticky, so it stayed there. The nav itself
        was a horizontal scroller that cut off the last three links.
        
        A checkbox rather than a client component keeps the header a server
        component and keeps the menu working before, or without, JavaScript —
        the same reason the search box is a plain GET form. The input is the
        focusable control and carries the label; the burger beside it is what
        gets drawn, and the desktop layout is untouched because both are
        display:none above the breakpoint.
      */}
      <input className="nav-toggle sr-only" type="checkbox" id="nav-open" aria-label="Show menu" />
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
      <div className="hd-panel">
      <nav aria-label="Main">
        <ul>
          {nav.map(({ label, url, children }) =>
            children?.length ? (
              <li className="has-sub" key={url}>
                <Link href={url} aria-haspopup="true" {...(current === url ? { 'aria-current': 'page' as const } : {})}>
                  {label}
                  <span className="caret" aria-hidden="true">▾</span>
                </Link>
                <ul className="sub">
                  {children.map((c) => (
                    <li key={c.url}><Link href={c.url}>{c.label}</Link></li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={url}>
                <Link href={url} {...(current === url ? { 'aria-current': 'page' as const } : {})}>{label}</Link>
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
      </div>
      <Link className="book" href="/venues">{bookingLabel}</Link>
      <label className="burger" htmlFor="nav-open">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </label>
    </div>
  </header>
  )
}

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
