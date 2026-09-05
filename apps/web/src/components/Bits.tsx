import Link from 'next/link'
import type { Beer, PhatEvent, TapList, Venue } from '@/lib/types'
import { mediaSize, mediaSrcSet } from '@/lib/payload'
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
  const img = mediaSize(beer.canArtwork, 'square')
  return (
    <article className="card beer">
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          srcSet={mediaSrcSet(beer.canArtwork, ['thumbnail', 'square'])}
          sizes="(min-width: 900px) 215px, 45vw"
          alt={beer.canArtwork?.alt ?? `${beer.name} can artwork`}
          loading="lazy"
          width={520}
          height={650}
        />
      ) : null}
      <div className="pad">
        <h3><Link href={`/beers/${beer.slug}`}>{beer.name}</Link></h3>
        <p style={{ fontSize: 15, marginBottom: 0 }}>{beer.style}</p>
        <div className="spec">
          <div><b>{beer.abv}%</b><span>ABV</span></div>
          {beer.ibu ? <div><b>{beer.ibu}</b><span>IBU</span></div> : null}
        </div>
      </div>
    </article>
  )
}

export const TapRows = ({ list }: { list: TapList }) => (
  <div style={{ maxWidth: 760 }}>
    {(list.taps ?? []).map((t) => (
      <div className={`tap${t.kegBlown ? ' out' : ''}`} key={t.tapNumber}>
        <span className="tapn">{t.tapNumber}</span>
        <strong>{t.beer?.name}</strong>
        <span className="st">{t.kegBlown ? 'Keg blown' : t.beer?.style}</span>
        <span className="ab">{t.kegBlown ? '—' : `${t.beer?.abv}%`}</span>
      </div>
    ))}
    {list.syncedAt ? (
      <p style={{ marginTop: 18, color: '#777', fontSize: 14 }}>
        Synced from me&amp;u · {new Date(list.syncedAt).toLocaleString('en-AU', { timeZone: 'Australia/Perth' })}
      </p>
    ) : null}
  </div>
)

export const EventCard = ({ event }: { event: PhatEvent }) => {
  const past = new Date(event.startsAt) < new Date()
  const hillarysOnly = (event.venues ?? []).length === 1 && event.venues[0]?.slug === 'hillarys'
  return (
    <article className={`ev${past ? ' past' : ''}`}>
      <div className={`dt${hillarysOnly ? ' hil' : ''}`}>
        <span>{eventMonth(event.startsAt)}</span>
        <b>{eventDay(event.startsAt)}</b>
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: 4 }}>
          <Link href={`/whats-on/${event.slug}`}>{event.title}</Link>
        </h3>
        <p style={{ margin: 0, fontSize: 15 }}>
          {eventTime(event.startsAt)} · {(event.venues ?? []).map((v) => v.shortName).join(' and ')} ·{' '}
          {event.isFree ? 'Free entry' : event.price}
        </p>
      </div>
      <span className="chip" style={{ margin: 0 }}>
        {event.recurrence === 'once' ? 'One-off' : past ? 'Past' : 'Weekly'}
      </span>
    </article>
  )
}
