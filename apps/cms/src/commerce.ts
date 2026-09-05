import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'
import type { Currency } from '@payloadcms/plugin-ecommerce/types'
import type { Plugin } from 'payload'

import { isAdmin, isAdminField, isDocumentOwner, publishedOrSignedIn } from './access'

/**
 * The plugin ships EUR, GBP and USD only. An Australian brewery needs AUD,
 * and Stripe expects the smallest unit, so two decimals.
 */
export const AUD: Currency = {
  code: 'AUD',
  decimals: 2,
  label: 'Australian Dollar',
  symbol: '$',
}

/**
 * Commerce is off unless COMMERCE_ENABLED is "true".
 *
 * This is the one part of the rebuild that touches money, and the existing
 * Square store keeps taking real orders until this has proven itself. Shipping
 * it dark means the collections and checkout can be exercised end to end
 * without any risk to live trade.
 */
export const commercePlugins = (): Plugin[] => {
  if (process.env.COMMERCE_ENABLED !== 'true') return []

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!secretKey || !publishableKey) {
    // Fail loudly rather than silently shipping a checkout that cannot charge.
    throw new Error(
      'COMMERCE_ENABLED is true but STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY are not set',
    )
  }

  return [
    ecommercePlugin({
      customers: { slug: 'users' },
      // Enabled explicitly rather than relying on defaults: the variants and
      // carts fields reference the products collection, so it must exist.
      products: true,
      carts: true,
      orders: true,
      transactions: true,
      addresses: true,
      inventory: true,
      currencies: { supportedCurrencies: [AUD], defaultCurrency: 'AUD' },
      access: {
        // Only admins may edit price and inventory fields.
        adminOnlyFieldAccess: isAdminField,
        // Products are public once published, drafts stay internal.
        adminOrPublishedStatus: publishedOrSignedIn,
        isAdmin,
        // Customers see their own orders and carts, nobody else's.
        isDocumentOwner,
      },
      payments: {
        paymentMethods: [
          stripeAdapter({
            secretKey,
            publishableKey,
            webhookSecret: webhookSecret ?? '',
            appInfo: { name: 'Phat Brew Club', version: '0.1.0' },
          }),
        ],
      },
    }),
  ]
}
