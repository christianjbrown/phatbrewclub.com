import type { CollectionConfig } from 'payload'
import { canManage, publishedOrSignedIn } from '../access'
import { openingHours, hoursOverrides, seo, slugField } from '../fields/openingHours'

export const Venues: CollectionConfig = {
  slug: 'venues',
  labels: { singular: 'Venue', plural: 'Venues' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'suburb', 'phone', 'updatedAt'],
    group: 'Venues',
    description: 'Address, hours and booking details. These drive the whole site.',
  },
  access: { read: publishedOrSignedIn, create: canManage, update: canManage, delete: canManage },
  versions: { drafts: true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'shortName', type: 'text', required: true, admin: { description: 'Used in buttons, e.g. "Book West Perth".' } },
    slugField(),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Finding us',
          fields: [
            {
              name: 'address',
              type: 'group',
              fields: [
                { name: 'street', type: 'text', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'suburb', type: 'text', required: true, admin: { width: '40%' } },
                    { name: 'state', type: 'text', defaultValue: 'WA', admin: { width: '25%' } },
                    { name: 'postcode', type: 'text', required: true, admin: { width: '35%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'latitude', type: 'number', admin: { width: '50%' } },
                    { name: 'longitude', type: 'number', admin: { width: '50%' } },
                  ],
                },
              ],
            },
            { name: 'transportNote', type: 'text', admin: { description: 'e.g. "Directly opposite City West Station".' } },
            {
              type: 'row',
              fields: [
                { name: 'phone', type: 'text', admin: { width: '50%' } },
                { name: 'email', type: 'email', admin: { width: '50%' } },
              ],
            },
          ],
        },
        {
          label: 'Hours',
          fields: [
            {
              name: 'hoursLabel',
              type: 'text',
              admin: {
                description:
                  'Shown above the hours, e.g. "Spring/Summer". The venues run seasonal hours, so say which season these are.',
                placeholder: 'Spring/Summer',
              },
            },
            {
              name: 'publicHolidayNote',
              type: 'text',
              admin: { description: 'One line about public holiday trading.' },
            },
            openingHours,
            hoursOverrides,
          ],
        },
        {
          label: 'Presentation',
          fields: [
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
            { name: 'intro', type: 'richText' },
            {
              name: 'amenities',
              type: 'select',
              hasMany: true,
              options: [
                'Beer garden', 'Kids zone', 'Arcade games', 'Dog friendly', 'Ocean views',
                'Live music', 'Wheelchair accessible', 'Parking', 'Function spaces', 'Fresh seafood',
                'Family friendly', 'Sports screens', 'Outdoor seating',
              ].map((v) => ({ label: v, value: v })),
            },
            { name: 'capacity', type: 'number' },
            { name: 'tapCount', type: 'number', defaultValue: 20 },
            {
              name: 'faqs',
              type: 'array',
              label: 'Frequently asked questions',
              admin: { description: 'Answered on the venue page and marked up for Google.' },
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Integrations',
          description: 'Links to the systems the venue already runs on.',
          fields: [
            // The brewery publishes a functions brochure as a PDF and nothing else:
    // its own functions pages say only "Function details coming soon". Anything
    // more specific here would be invented.
    /**
     * What to ask Google Maps for, when the venue's own name is not what Maps
     * knows it by. The Hillarys venue trades as The Trophy Room, and searching
     * that name plus its address put the pin on The Breakwater next door;
     * Google lists it as "Phat Brew Club Hillarys".
     */
    {
      name: 'mapsQuery',
      type: 'text',
      admin: {
        description:
          'Optional. The exact place name to search on Google Maps. Leave blank to use the venue name and address.',
      },
    },
    { name: 'functionsPack', type: 'upload', relationTo: 'media' },
    { name: 'bookingUrl', type: 'text', admin: { description: 'nowbookit booking URL. Opened in a modal on the site.' } },
            { name: 'meanduSlug', type: 'text', admin: { description: 'me&u venue slug, used to sync menus and the tap list.' } },
            { name: 'menuUrl', type: 'text', admin: { description: 'Public me&u food menu URL.' } },
          ],
        },
        { label: 'SEO', fields: [seo] },
      ],
    },
  ],
}
