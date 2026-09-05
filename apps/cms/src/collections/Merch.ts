import type { CollectionConfig } from 'payload'
import { canManage, publishedOrSignedIn } from '../access'
import { slugField } from '../fields/openingHours'

/**
 * Merchandise, kept apart from beer.
 *
 * The brewery's shop sells both, but cubes already have a page each under
 * /beers with tasting notes and an ABV. Listing them here as well would give
 * the same product two homes at two prices, so this collection is merch only.
 *
 * Ordering is on the shop's own checkout: `shopUrl` links out to it. Nothing
 * here takes a payment or holds stock, and `price` is display only.
 */
export const Merch: CollectionConfig = {
  slug: 'merch',
  labels: { singular: 'Merch item', plural: 'Merch' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'soldOut', '_status'],
    group: 'Content',
  },
  access: { read: publishedOrSignedIn, create: canManage, update: canManage, delete: canManage },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'price',
      type: 'number',
      min: 0,
      admin: {
        position: 'sidebar',
        description: 'In dollars. The site adds the currency, so enter 40 rather than A$40.00.',
      },
    },
    {
      name: 'soldOut',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Hides the buy link and marks the item, rather than removing it.',
      },
    },
    {
      name: 'shopUrl',
      type: 'text',
      admin: { description: 'Where "Buy" goes. Empty means in-venue only.' },
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description:
          'First image is the one shown in the shop grid. The rest appear on the item.',
      },
    },
  ],
}
