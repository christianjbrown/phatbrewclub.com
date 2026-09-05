import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { JsonLd, beerSchema } from '@/lib/jsonld'
import { getBeer, getBeers, getTapList, getVenues, mediaSize, mediaSrcSet, mediaUrl } from '@/lib/payload'

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
  const art = mediaUrl(beer.canArtwork)

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
                  {beer.untappdUrl ? <a className="btn btn-o" href={beer.untappdUrl}>On Untappd</a> : null}
                </p>
              </div>
            </div>
          </div>
        </section>

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

        {(beer.gallery ?? []).length ? (
          <section>
            <div className="wrap">
              <h2>The beer</h2>
              <div className="grid g3">
                {(beer.gallery ?? []).map((img) => {
                  const src = mediaSize(img, 'card')
                  if (!src) return null
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={img.id}
                      src={src}
                      srcSet={mediaSrcSet(img, ['thumbnail', 'card'])}
                      sizes="(min-width: 900px) 360px, 90vw"
                      alt={img.alt ?? ''}
                      loading="lazy"
                      width={800}
                      height={600}
                      style={{ borderRadius: 14, width: '100%', aspectRatio: '4/3', objectFit: 'cover' }}
                    />
                  )
                })}
              </div>
            </div>
          </section>
        ) : null}

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
