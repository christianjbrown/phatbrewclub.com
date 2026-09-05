import type { CollectionConfig } from 'payload'
import { canManage, publishedOrSignedIn } from '../access'
import { seo, slugField } from '../fields/openingHours'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'News post', plural: 'News' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status'],
    group: 'Content',
  },
  access: { read: publishedOrSignedIn, create: canManage, update: canManage, delete: canManage },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'excerpt', type: 'textarea', maxLength: 240 },
    { name: 'body', type: 'richText' },
    seo,
  ],
}
