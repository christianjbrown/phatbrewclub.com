import type { Block, CollectionConfig } from 'payload'
import { canManage, publishedOrSignedIn } from '../access'
import { seo, slugField } from '../fields/openingHours'
import { revalidateCollection } from '../hooks/revalidate'

const Hero: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'lede', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'actions',
      type: 'array',
      maxRows: 2,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'url', type: 'text', required: true, admin: { width: '50%' } },
          ],
        },
      ],
    },
  ],
}

const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Text blocks' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'richText', required: true },
  ],
}

const VenueCards: Block = {
  slug: 'venueCards',
  labels: { singular: 'Venue cards', plural: 'Venue cards' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'venues', type: 'relationship', relationTo: 'venues', hasMany: true, required: true },
  ],
}

const BeerGrid: Block = {
  slug: 'beerGrid',
  labels: { singular: 'Beer grid', plural: 'Beer grids' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'filterBy',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: 'Everything', value: 'all' },
        { label: 'Core range only', value: 'core' },
        { label: 'Seasonal only', value: 'seasonal' },
        { label: 'Limited only', value: 'limited' },
      ],
    },
    { name: 'limit', type: 'number', defaultValue: 12 },
  ],
}

const EventList: Block = {
  slug: 'eventList',
  labels: { singular: 'Event list', plural: 'Event lists' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'venue', type: 'relationship', relationTo: 'venues', admin: { description: 'Leave blank for both venues.' } },
    { name: 'limit', type: 'number', defaultValue: 4 },
  ],
}

const TapListBlock: Block = {
  slug: 'tapList',
  labels: { singular: 'Tap list', plural: 'Tap lists' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'venue', type: 'relationship', relationTo: 'venues', required: true },
  ],
}

const Faq: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'questions',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'richText', required: true },
      ],
    },
  ],
}


const Awards: Block = {
  slug: 'awards',
  labels: { singular: 'Awards list', plural: 'Awards lists' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'entries',
      type: 'array',
      labels: { singular: 'Award', plural: 'Awards' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'year', type: 'text', required: true, admin: { width: '18%' } },
            { name: 'body', type: 'text', required: true, admin: { width: '42%', description: 'Who gave it' } },
            { name: 'detail', type: 'text', admin: { width: '40%', description: 'What it was for' } },
          ],
        },
      ],
    },
  ],
}

const Gallery: Block = {
  slug: 'gallery',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true, required: true },
  ],
}

const Quote: Block = {
  slug: 'quote',
  labels: { singular: 'Quote', plural: 'Quotes' },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'attribution', type: 'text' },
  ],
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  hooks: revalidateCollection('pages'),
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    description: 'Build a page from blocks. Add, reorder and remove them freely.',
    livePreview: {
      url: ({ data }) => `${process.env.PAYLOAD_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/${data?.slug ?? ''}`,
    },
  },
  access: { read: publishedOrSignedIn, create: canManage, update: canManage, delete: canManage },
  versions: { drafts: true, maxPerDoc: 25 },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'layout',
      type: 'blocks',
      required: true,
      blocks: [Hero, RichTextBlock, VenueCards, BeerGrid, EventList, TapListBlock, Faq, Awards, Gallery, Quote],
    },
    seo,
  ],
}
