import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { getVenues } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Phat Brew Club beer cubes, merch, headwear and gift cards.',
}

export default async function ShopPage() {
  const venues = await getVenues()
  return (
    <>
      <Header current="/shop" />
      <main id="main">
        <section>
          <div className="wrap">
            <h1>Shop</h1>
            <p className="lede">
              Beer cubes, merch and gift cards.
            </p>
            <p className="note">
              Online ordering is coming soon. In the meantime, cubes and merch are
              available at both venues.
            </p>
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
