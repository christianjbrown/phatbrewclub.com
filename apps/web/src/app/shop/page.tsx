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
              Beer cubes, merch and gift cards. Checkout arrives with the ecommerce phase.
            </p>
            <p className="note">
              <b>Phase 6:</b> products, cart and Stripe checkout come from the Payload ecommerce
              plugin. The existing Square store stays live until this has taken real test payments.
            </p>
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
