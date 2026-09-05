import type { Field } from 'payload'

const DAYS = [
  { label: 'Monday', value: 'mon' },
  { label: 'Tuesday', value: 'tue' },
  { label: 'Wednesday', value: 'wed' },
  { label: 'Thursday', value: 'thu' },
  { label: 'Friday', value: 'fri' },
  { label: 'Saturday', value: 'sat' },
  { label: 'Sunday', value: 'sun' },
]

/**
 * Regular weekly hours. Stored as an ordered row per day so the venue page
 * can render a table and emit OpeningHoursSpecification without guessing.
 */
export const openingHours: Field = {
  name: 'openingHours',
  type: 'array',
  label: 'Opening hours',
  admin: {
    description: 'One row per day. Leave open/close blank and tick Closed if you are shut that day.',
    initCollapsed: false,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'day', type: 'select', options: DAYS, required: true, admin: { width: '30%' } },
        {
          name: 'opens',
          type: 'text',
          admin: { width: '25%', placeholder: '11:00', condition: (_, s) => !s?.closed },
        },
        {
          name: 'closes',
          type: 'text',
          admin: { width: '25%', placeholder: '23:00', condition: (_, s) => !s?.closed },
        },
        { name: 'closed', type: 'checkbox', label: 'Closed', admin: { width: '20%' } },
      ],
    },
  ],
}

/**
 * Public holidays and one-off changes. These win over the weekly hours for
 * their date, which is what stops "open now" lying on Christmas Day.
 */
export const hoursOverrides: Field = {
  name: 'hoursOverrides',
  type: 'array',
  label: 'Special hours',
  admin: {
    description: 'Public holidays and one-offs. These override the weekly hours for that date.',
    initCollapsed: true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'date', type: 'date', required: true, admin: { width: '30%' } },
        { name: 'label', type: 'text', admin: { width: '30%', placeholder: 'Australia Day' } },
        {
          name: 'opens',
          type: 'text',
          admin: { width: '17%', condition: (_, s) => !s?.closed },
        },
        {
          name: 'closes',
          type: 'text',
          admin: { width: '17%', condition: (_, s) => !s?.closed },
        },
        { name: 'closed', type: 'checkbox', label: 'Closed', admin: { width: '6%' } },
      ],
    },
  ],
}

export const seo: Field = {
  name: 'seo',
  type: 'group',
  label: 'Search and social',
  admin: { description: 'Leave blank to fall back to the title and intro above.' },
  fields: [
    { name: 'title', type: 'text', maxLength: 65 },
    { name: 'description', type: 'textarea', maxLength: 165 },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}

export const slugField = (from = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: { position: 'sidebar', description: 'Used in the page URL. Change with care once live.' },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (value) return value
        const source = (data as Record<string, unknown> | undefined)?.[from]
        if (typeof source !== 'string') return value
        return source
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      },
    ],
  },
})
