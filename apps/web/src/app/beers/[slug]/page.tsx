import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { JsonLd, beerSchema } from '@/lib/jsonld'
import { Lightbox } from '@/components/Lightbox'
import { toShots } from '@/lib/shots'
import { getBeer, getBeers, getTapList, getVenues, mediaDims, mediaSize, mediaSrcSet } from '@/lib/payload'

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
  const { slug } = await params
  const b = await getBeer(slug)
  if (!b) return {}
  return { title: b.name, description: `${b.name} — ${b.style}, ${b.abv}% ABV. ${b.description ?? ''}`.trim() }
}

const LABEL: Record<string, string> = {
  core: 'CORE RANGE', seasonal: 'SEASONAL', limited: 'LIMITED RELEASE', collab: 'COLLABORATION',
}

export default async function BeerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const beer = await getBeer(slug)
  if (!beer) notFound()

  const venues = await getVenues()
  const lists = await Promise.all(venues.map(async (v) => ({ venue: v, list: await getTapList(v.id) })))
  const pouring = lists.filter(({ list }) =>
    (list?.taps ?? []).some((t) => !t.kegBlown && String(t.beer?.id) === String(beer.id)),
  )
  const art = mediaSize(beer.canArtwork, 'card')

  return (
    <>
      <Header current="/beers" />
      <main id="main">
        <JsonLd data={beerSchema(beer)} />
        <section>
          <div className="wrap">
            <div className="grid" style={{ gridTemplateColumns: 'minmax(0,320px) minmax(0,1fr)', gap: 44 }}>
              {art ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={art} alt={beer.canArtwork?.alt ?? `${beer.name} can artwork`} width={520} height={650}
                  style={{ background: '#0a0a0a', borderRadius: 14, padding: 20 }} />
              ) : <div />}
              <div>
                <p className="eyebrow">{LABEL[beer.category]}</p>
                <h1 style={{ fontSize: 'clamp(30px,4vw,46px)' }}>{beer.name}</h1>
                {beer.description ? <p className="lede">{beer.description}</p> : null}
                <div className="spec" style={{ maxWidth: 440 }}>
                  <div><b>{beer.abv}%</b><span>ABV</span></div>
                  {beer.ibu ? <div><b>{beer.ibu}</b><span>IBU</span></div> : null}
                  <div><b>{beer.style}</b><span>STYLE</span></div>
                </div>
                {beer.allergens?.length ? (
                  <p style={{ marginTop: 18 }}>
                    <strong style={{ display: 'block', fontSize: 14, marginBottom: 6, color: 'var(--orange)' }}>
                      CONTAINS
                    </strong>
                    {beer.allergens.map((a) => <span className="chip" key={a}>{a}</span>)}
                  </p>
                ) : null}
                {beer.price ? (
                  <p style={{ marginTop: 18, fontSize: 17 }}>
                    <strong style={{ fontSize: 24, color: 'var(--orange)' }}>
                      ${beer.price.toFixed(2)}
                    </strong>
                    {beer.packSize ? <span style={{ color: '#9a9a9a' }}> · {beer.packSize}</span> : null}
                  </p>
                ) : null}
                <p style={{ marginTop: 20 }}>
                  {beer.shopUrl ? (
                    <a className="btn" href={beer.shopUrl}>Buy a cube</a>
                  ) : (
                    <Link className="btn" href="/shop">Visit the shop</Link>
                  )}
                  {beer.untappdUrl ? (
                    <a
                      className="btn btn-o"
                      href={beer.untappdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Untappd
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : null}
                </p>
              </div>
            </div>
          </div>
        </section>

        {(beer.gallery ?? []).length ? (
          <section>
            <div className="wrap">
              {/* Above the tap list on purpose: on a page selling a beer, the
                  photographs matter more than which taps happen to have it. */}
              <h2>Photos</h2>
              <Lightbox
                shots={toShots(
                  beer.gallery,
                  (m) => mediaSize(m, 'card'),
                  // The largest derivative rather than the original. This used
                  // to send the untouched upload because the hero size cropped
                  // to landscape and these product shots are portrait; sizes
                  // are pure resizes now, so 'hero' keeps the shape and saves
                  // shipping a multi-megabyte JPEG into a lightbox.
                  (m) => mediaSize(m, 'hero'),
                  `${beer.name} product photograph`,
                )}
              />
            </div>
          </section>
        ) : null}

        <section>
          <div className="wrap">
            <h2>Pouring right now</h2>
            {pouring.length ? (
              <div className="grid g2" style={{ maxWidth: 720 }}>
                {pouring.map(({ venue, list }) => {
                  const tap = (list?.taps ?? []).find((t) => String(t.beer?.id) === String(beer.id))
                  return (
                    <div className="card" key={venue.id}>
                      <div className="pad" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#4ee89a', display: 'block' }} />
                        <strong>{venue.shortName}</strong>
                        <span style={{ marginLeft: 'auto', color: '#999' }}>Tap {tap?.tapNumber}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p>Not on tap at either venue at the moment. Check back, or ask at the bar.</p>
            )}
          </div>
        </section>

        {(beer.ingredients ?? []).length ? (
          <section>
            <div className="wrap">
              <h2>Who made it</h2>
              <div className="grid g3">
                {(beer.ingredients ?? []).map((i) => (
                  <div className="card" key={i.producer}>
                    <div className="pad">
                      <h3>{i.producer}</h3>
                      <p style={{ margin: 0, fontSize: 15 }}>{i.contribution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer venues={venues} />
    </>
  )
}
