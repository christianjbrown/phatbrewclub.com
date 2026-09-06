import type { CollectionConfig } from 'payload'
import { canManage, publishedOrSignedIn } from '../access'
import { slugField } from '../fields/openingHours'
import { revalidateCollection } from '../hooks/revalidate'

export const FunctionPackages: CollectionConfig = {
  slug: 'function-packages',
  hooks: revalidateCollection('function-packages'),
  labels: { singular: 'Function space', plural: 'Function spaces' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'venue', 'capacity'],
    group: 'Venues',
    description: 'Private hire spaces and packages. Replaces the PDF-only page.',
  },
  access: { read: publishedOrSignedIn, create: canManage, update: canManage, delete: canManage },
  versions: { drafts: true },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField(),
    { name: 'venue', type: 'relationship', relationTo: 'venues', required: true },
    {
      type: 'row',
      fields: [
        { name: 'capacity', type: 'number', admin: { width: '33%' } },
        {
          name: 'seating',
          type: 'select',
          admin: { width: '33%' },
          options: [
            { label: 'Standing', value: 'standing' },
            { label: 'Seated', value: 'seated' },
            { label: 'Mixed', value: 'mixed' },
          ],
        },
        { name: 'priceGuide', type: 'text', admin: { width: '34%', placeholder: 'From $45 pp' } },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'richText' },
    {
      name: 'inclusions',
      type: 'array',
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    { name: 'brochure', type: 'upload', relationTo: 'media', admin: { description: 'Optional PDF, as a supplement rather than the only source.' } },
  ],
}
