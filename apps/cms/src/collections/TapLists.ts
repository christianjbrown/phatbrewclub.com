import type { CollectionConfig } from 'payload'
import { anyone, canManageOperational } from '../access'
import { revalidateCollection } from '../hooks/revalidate'

/**
 * What is actually pouring, right now, per venue. Staff can edit this even
 * though they cannot edit pages — changing a keg should not need a manager.
 */
export const TapLists: CollectionConfig = {
  slug: 'tap-lists',
  hooks: revalidateCollection('tap-lists'),
  labels: { singular: 'Tap list', plural: 'Tap lists' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'venue', 'updatedAt'],
    group: 'Beer',
    description: 'One per venue. Drag to reorder taps; tick "keg blown" when one runs out.',
  },
  access: { read: anyone, create: canManageOperational, update: canManageOperational, delete: canManageOperational },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar' },
      hooks: {
        beforeChange: [
          async ({ data, req }) => {
            const venueId = (data as { venue?: string | number })?.venue
            if (!venueId) return 'Tap list'
            try {
              const venue = await req.payload.findByID({ collection: 'venues', id: venueId, depth: 0 })
              return `${(venue as { shortName?: string }).shortName ?? 'Venue'} tap list`
            } catch {
              return 'Tap list'
            }
          },
        ],
      },
    },
    { name: 'venue', type: 'relationship', relationTo: 'venues', required: true, unique: true },
    {
      name: 'taps',
      type: 'array',
      labels: { singular: 'Tap', plural: 'Taps' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'tapNumber', type: 'number', required: true, admin: { width: '15%' } },
            {
              name: 'beer',
              type: 'relationship',
              relationTo: 'beers',
              // Optional on purpose. Guest taps, collabs and one-off kegs pour
              // here too and will never exist as a Beer record, and a required
              // relationship would silently drop them from the list.
              admin: { width: '55%', description: 'Leave blank for a guest tap.' },
            },
            { name: 'kegBlown', type: 'checkbox', label: 'Keg blown', admin: { width: '30%' } },
          ],
        },
        {
          type: 'row',
          admin: { condition: (_, s) => !s?.beer },
          fields: [
            {
              name: 'guestName',
              type: 'text',
              admin: { width: '40%', description: 'Name, for a tap with no Beer record.' },
            },
            { name: 'guestStyle', type: 'text', admin: { width: '35%' } },
            { name: 'price', type: 'text', admin: { width: '25%', placeholder: '$10.50' } },
          ],
        },
      ],
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'manual',
      admin: { position: 'sidebar', description: 'Set automatically when synced from me&u.' },
      options: [
        { label: 'Edited here', value: 'manual' },
        { label: 'Synced from me&u', value: 'meandu' },
      ],
    },
    { name: 'syncedAt', type: 'date', admin: { position: 'sidebar', readOnly: true } },
  ],
}
