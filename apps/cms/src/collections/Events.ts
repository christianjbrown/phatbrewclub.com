import type { CollectionConfig } from 'payload'
import { canManageOperational, publishedOrSignedIn } from '../access'
import { seo, slugField } from '../fields/openingHours'

/**
 * Real start and end dates are the whole point: they are what let past
 * events archive themselves instead of sitting in the nav for months.
 */
export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Event', plural: 'Events' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'venues', 'recurrence', '_status'],
    group: 'What’s on',
    description: 'Everything on at either venue. Give it real dates and it will retire itself.',
  },
  access: { read: publishedOrSignedIn, create: canManageOperational, update: canManageOperational, delete: canManageOperational },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      type: 'row',
      fields: [
        { name: 'startsAt', type: 'date', required: true, admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'endsAt', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'recurrence',
          type: 'select',
          defaultValue: 'once',
          admin: { width: '50%', description: 'A weekly event is written once, not once per venue.' },
          options: [
            { label: 'One-off', value: 'once' },
            { label: 'Every week', value: 'weekly' },
            { label: 'Every fortnight', value: 'fortnightly' },
            { label: 'Every month', value: 'monthly' },
          ],
        },
        {
          name: 'repeatsUntil',
          type: 'date',
          admin: { width: '50%', condition: (_, s) => s?.recurrence && s.recurrence !== 'once' },
        },
      ],
    },
    { name: 'venues', type: 'relationship', relationTo: 'venues', hasMany: true, required: true },
    {
      name: 'category',
      type: 'select',
      options: ['Quiz', 'Live music', 'Food special', 'Beer release', 'Sport', 'Competition', 'Other']
        .map((v) => ({ label: v, value: v })),
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText' },
    {
      type: 'row',
      fields: [
        { name: 'isFree', type: 'checkbox', label: 'Free entry', defaultValue: true, admin: { width: '25%' } },
        {
          name: 'price',
          type: 'text',
          admin: { width: '35%', placeholder: '$25', condition: (_, s) => !s?.isFree },
        },
        { name: 'bookingUrl', type: 'text', admin: { width: '40%' } },
      ],
    },
    seo,
  ],
}
