import type { CollectionConfig } from 'payload'
import { canManage, publishedOrSignedIn } from '../access'
import { seo, slugField } from '../fields/openingHours'

export const Beers: CollectionConfig = {
  slug: 'beers',
  labels: { singular: 'Beer', plural: 'Beers' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'style', 'abv', 'category', 'updatedAt'],
    group: 'Beer',
    description: 'The full range. Everything here is searchable and gets its own page.',
  },
  access: { read: publishedOrSignedIn, create: canManage, update: canManage, delete: canManage },
  versions: { drafts: true },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField(),
    {
      type: 'row',
      fields: [
        { name: 'style', type: 'text', required: true, admin: { width: '40%', placeholder: 'West Coast IPA' } },
        {
          name: 'abv',
          type: 'number',
          required: true,
          min: 0,
          max: 20,
          admin: { width: '20%', step: 0.1, description: '% by volume' },
        },
        { name: 'ibu', type: 'number', min: 0, max: 120, admin: { width: '20%' } },
        {
          name: 'category',
          type: 'select',
          required: true,
          defaultValue: 'core',
          admin: { width: '20%' },
          options: [
            { label: 'Core range', value: 'core' },
            { label: 'Seasonal', value: 'seasonal' },
            { label: 'Limited release', value: 'limited' },
            { label: 'Collaboration', value: 'collab' },
          ],
        },
      ],
    },
    { name: 'description', type: 'textarea', admin: { description: 'One or two lines. Shown on the beer card.' } },
    { name: 'tastingNotes', type: 'richText' },
    { name: 'canArtwork', type: 'upload', relationTo: 'media' },
    {
      name: 'availableAt',
      type: 'relationship',
      relationTo: 'venues',
      hasMany: true,
      admin: { description: 'Which venues normally stock it. The live tap list is separate.' },
    },
    {
      name: 'ingredients',
      type: 'array',
      label: 'Local producers',
      admin: { description: 'Who grew and malted it. Shown on the beer page.', initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'producer', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'contribution', type: 'text', admin: { width: '60%' } },
          ],
        },
      ],
    },
    { name: 'untappdUrl', type: 'text', admin: { position: 'sidebar' } },
    seo,
  ],
}
