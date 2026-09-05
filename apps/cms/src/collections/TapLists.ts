import type { CollectionConfig } from 'payload'
import { anyone, canManageOperational } from '../access'

/**
 * What is actually pouring, right now, per venue. Staff can edit this even
 * though they cannot edit pages — changing a keg should not need a manager.
 */
export const TapLists: CollectionConfig = {
  slug: 'tap-lists',
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
            { name: 'beer', type: 'relationship', relationTo: 'beers', required: true, admin: { width: '55%' } },
            { name: 'kegBlown', type: 'checkbox', label: 'Keg blown', admin: { width: '30%' } },
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
