import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { pageMeta } from '@/lib/seo'
import { getMerch, getVenues, mediaDims, mediaSize, mediaSrcSet } from '@/lib/cms'

export const generateMetadata = (): Promise<Metadata> =>
  pageMeta({
    title: 'Shop',
    description:
      'Phat Brew Club merch: beanies, caps, hoodies, glassware and the West is Best footy jumper.',
    path: '/shop',
  })

const money = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 0,
})


/**
 * An outbound card. Ordering lives on the brewery's own checkout, so this is an
 * external anchor rather than a Link — and an item with nothing to buy stays an
 * article, because a card that looks clickable and is not is worse than a card
 * that does not.
 */
const Card = ({ href, children }: { href?: string; children: React.ReactNode }) =>
  href ? (
    <a className="shop-card card-link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <article className="shop-card">{children}</article>
  )

export default async function ShopPage() {
  const [venues, merch] = await Promise.all([getVenues(), getMerch()])

  return (
    <>
      <Header current="/shop" />
      <main id="main">
        <section>
          <div className="wrap">
            <h1>Shop</h1>
            <p className="lede">
              Merch from both venues. Beer cubes have a page each over on{' '}
              <a href="/beers">the beers</a>.
            </p>

            {merch.length === 0 ? (
              <p className="note">
                Nothing listed at the moment. Merch is available at both venues.
              </p>
            ) : (
              <div className="grid g3 shop-grid">
                {merch.map((m) => {
                  const first = m.images?.[0] ?? null
                  const img = mediaSize(first, 'small')
                  const d = mediaDims(first, 'small')
                  // The whole card is the link, as on beers, news and what's
                  // on. Sold-out items have nowhere to go, so they stay a plain
                  // card rather than a dead link.
                  return (
                    <Card key={m.id} href={m.shopUrl && !m.soldOut ? m.shopUrl : undefined}>
                      {img ? (
                        <img
                          src={img}
                          srcSet={mediaSrcSet(first, ['micro', 'thumbnail', 'small'])}
                          sizes="(min-width: 900px) 300px, 45vw"
                          alt={first?.alt ?? m.title}
                          loading="lazy"
                          width={d?.width}
                          height={d?.height}
                        />
                      ) : null}
                      <div className="shop-card-body">
                        <h2>
                          {m.title}
                          {m.soldOut ? <span className="sold-out">Sold out</span> : null}
                        </h2>
                        {m.description ? <p className="shop-desc">{m.description}</p> : null}
                        <p className="shop-price">
                          {typeof m.price === 'number' ? money.format(m.price) : 'In venue'}
                        </p>
                        {/* Ordering stays on the brewery's own checkout. Nothing
                            here takes a payment. */}
                        {m.shopUrl && !m.soldOut ? (
                          <span className="btn">Buy</span>
                        ) : (
                          <span className="shop-note">
                            {m.soldOut ? 'Sold out' : 'Available in venue'}
                          </span>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
