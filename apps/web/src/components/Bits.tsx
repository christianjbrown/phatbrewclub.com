import Link from 'next/link'
import type { Beer, PhatEvent, TapList, Venue } from '@/lib/types'
import { mediaDims, mediaSize, mediaSrcSet } from '@/lib/cms'
import { DAY_LABEL, eventDay, eventMonth, eventTime, formatHuman, openState } from '@/lib/time'

export const OpenBadge = ({ venue }: { venue: Venue }) => {
  const state = openState(venue)
  return state.open ? (
    <span className="open"><i />Open now · until {state.until}</span>
  ) : (
    <span className="open shut">
      <i />
      {state.opensAt ? `Closed · opens ${state.opensAt}` : 'Closed today'}
    </span>
  )
}

export const HoursTable = ({ venue }: { venue: Venue }) => {
  const today = new Intl.DateTimeFormat('en-GB', { timeZone: 'Australia/Perth', weekday: 'short' })
    .format(new Date()).toLowerCase().slice(0, 3)
  return (
    <table className="hours">
      <caption className="sr-only">Opening hours for {venue.name}</caption>
      <tbody>
        {(venue.openingHours ?? []).map((h) => (
          <tr key={h.day} className={h.day === today ? 'today' : undefined}>
            <th scope="row">{DAY_LABEL[h.day]}</th>
            <td>
              {h.closed || !h.opens || !h.closes
                ? 'Closed'
                : `${formatHuman(h.opens)} – ${formatHuman(h.closes)}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export const BeerCard = ({ beer }: { beer: Beer }) => {
  const img = mediaSize(beer.canArtwork, 'thumbnail')
  return (
    // The whole card is the link, not just the heading. A 40px text target
    // inside a 300px card is a needlessly small thing to hit, especially on a
    // phone. The card holds no other interactive element, so wrapping it is
    // safe and keeps a single tab stop.
    <Link className="card beer card-link" href={`/beers/${beer.slug}`}>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          // 215px slot: a 2x screen wants 430, and offering 600 made it jump
          // there. 400 is a 7% shortfall on a small decal and about half the
          // bytes, so the ladder stops at 400 here.
          srcSet={mediaSrcSet(beer.canArtwork, ['micro', 'thumbnail'])}
          sizes="(min-width: 900px) 215px, 45vw"
          alt={beer.canArtwork?.alt ?? `${beer.name} can artwork`}
          loading="lazy"
          width={520}
          height={650}
        />
      ) : null}
      <div className="pad">
        <h3>{beer.name}</h3>
        <p style={{ fontSize: 15, marginBottom: 0 }}>{beer.style}</p>
        <div className="spec">
          <div><b>{beer.abv}%</b><span>ABV</span></div>
          {beer.ibu ? <div><b>{beer.ibu}</b><span>IBU</span></div> : null}
        </div>
      </div>
    </Link>
  )
}

export const TapRows = ({ list }: { list: TapList }) => (
  <div style={{ maxWidth: 760 }}>
    {(list.taps ?? []).map((t) => {
      // A tap is either a beer we know about or a guest keg. Both pour.
      const name = t.beer?.name ?? t.guestName ?? 'Guest tap'
      const style = t.beer?.style ?? t.guestStyle ?? ''
      return (
        <div className={`tap${t.kegBlown ? ' out' : ''}`} key={t.tapNumber}>
          <span className="tapn">{t.tapNumber}</span>
          <span className="tap-name">
            {t.beer ? <Link href={`/beers/${t.beer.slug}`}>{name}</Link> : name}
          </span>
          <span className="st">{t.kegBlown ? 'Keg blown' : style}</span>
          {/* ABV and price are different units and get their own columns.
              Putting whichever one we happened to have in a single column made
              the numbers unreadable. Either can be missing: guest kegs have no
              ABV, and a hand-edited tap list has no price. */}
          <span className="abv">{!t.kegBlown && t.beer?.abv ? `${t.beer.abv}%` : ''}</span>
          <span className="ab">{t.kegBlown ? '—' : (t.price ?? '')}</span>
        </div>
      )
    })}
    {list.syncedAt ? (
      <p style={{ marginTop: 18, color: '#777', fontSize: 14 }}>
        {list.source === 'meandu' ? 'Synced from me&u' : 'Updated'} ·{' '}
        {new Date(list.syncedAt).toLocaleString('en-AU', {
          timeZone: 'Australia/Perth', dateStyle: 'medium', timeStyle: 'short',
        })}
      </p>
    ) : null}
  </div>
)

/**
 * `as` sets the card's heading level. On the homepage these sit under a section
 * h2 so h3 is right; on /whats-on they follow the h1 directly, where an h3
 * would skip a level and break the document outline.
 */
export const EventCard = ({ event, as: Heading = 'h3' }: { event: PhatEvent; as?: 'h2' | 'h3' }) => {
  const past = new Date(event.startsAt) < new Date()
  const hillarysOnly = (event.venues ?? []).length === 1 && event.venues[0]?.slug === 'hillarys'
  // The brewery designs a poster for each of these. Lead with it rather than
  // shrinking it to a thumbnail beside the text.
  const poster = mediaSize(event.heroImage, 'card')
  const posterDims = mediaDims(event.heroImage, 'card')

  return (
    // The whole card is the link, not just the title and the poster. Nesting
    // anchors is invalid, so the artwork is a plain div inside it.
    <Link className={`evc card-link${past ? ' past' : ''}`} href={`/whats-on/${event.slug}`}>
      {poster ? (
        <div className="evc-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            srcSet={mediaSrcSet(event.heroImage, ['thumbnail', 'small', 'card'])}
            sizes="(min-width: 900px) 360px, 90vw"
            alt={event.heroImage?.alt ?? `${event.title} poster`}
            loading="lazy"
            width={posterDims?.width}
            height={posterDims?.height}
          />
          <span className={`evc-date${hillarysOnly ? ' hil' : ''}`}>
            <span>{eventMonth(event.startsAt)}</span>
            <b>{eventDay(event.startsAt)}</b>
          </span>
        </div>
      ) : null}

      <div className="evc-body">
        <Heading className="ev-title">{event.title}</Heading>
        <p className="evc-meta">
          {eventTime(event.startsAt)} · {(event.venues ?? []).map((v) => v.shortName).join(' and ')}
        </p>
        <p className="evc-foot">
          {/* The note is what the money buys — a burger, a schnitty — and is
              shown in place of an entry price, not beside it. */}
          <span className="evc-price">
            {event.priceNote || (event.isFree ? 'Free entry' : event.price)}
          </span>
          <span className="chip">
            {event.recurrence === 'once' ? 'One-off' : past ? 'Past' : 'Weekly'}
          </span>
        </p>
      </div>
    </Link>
  )
}
