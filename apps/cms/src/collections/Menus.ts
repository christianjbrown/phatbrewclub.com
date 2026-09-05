import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '../access'

/**
 * Mirrored from me&u so menus are on the site and indexable, while staff
 * carry on authoring in me&u exactly as they do now. Read-only in the admin
 * on purpose: two sources of truth for a price is how you get a wrong price.
 */
export const Menus: CollectionConfig = {
  slug: 'menus',
  labels: { singular: 'Menu', plural: 'Menus' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'venue', 'syncedAt'],
    group: 'Venues',
    description: 'Synced from me&u. Edit menus in me&u, not here — this is a mirror.',
  },
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'venue', type: 'relationship', relationTo: 'venues', required: true, admin: { readOnly: true } },
    { name: 'meanduId', type: 'text', index: true, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'syncedAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    {
      name: 'sections',
      type: 'array',
      admin: { readOnly: true },
      fields: [
        { name: 'name', type: 'text' },
        {
          name: 'items',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', admin: { width: '45%' } },
                { name: 'price', type: 'text', admin: { width: '20%' } },
                { name: 'dietary', type: 'text', admin: { width: '35%' } },
              ],
            },
            { name: 'description', type: 'textarea' },
          ],
        },
      ],
    },
  ],
}
