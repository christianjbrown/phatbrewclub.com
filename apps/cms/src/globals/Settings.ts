import type { GlobalConfig } from 'payload'
import { anyone, canManage } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

/**
 * Everything here is read by the website.
 *
 * That is worth stating because for a while it was not true: the announcement
 * bar, the navigation, the booking button label and the SEO defaults all had
 * fields in this screen and no code behind them, so editing them changed
 * nothing and there was no way to tell from the admin. A settings field that
 * does nothing is worse than an absent one — it looks like the site is broken
 * rather than the field.
 */
export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site settings',
  hooks: { afterChange: [revalidateGlobal('settings')] },
  admin: { group: 'Settings' },
  access: { read: anyone, update: canManage },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Announcement',
          description: 'A bar across the top of every page. Leave the message blank to hide it.',
          fields: [
            {
              name: 'announcement',
              type: 'text',
              admin: { description: 'e.g. "Closed Monday for a private function."' },
            },
            {
              name: 'announcementUrl',
              type: 'text',
              admin: { description: 'Optional. Makes the whole bar a link.' },
            },
            {
              name: 'announcementUntil',
              type: 'date',
              admin: { description: 'It disappears on its own after this date.' },
            },
          ],
        },
        {
          label: 'Navigation',
          description:
            'The links across the top of every page. Leave the list empty to use the built-in menu.',
          fields: [
            {
              name: 'mainNav',
              type: 'array',
              labels: { singular: 'Link', plural: 'Links' },
              admin: { description: 'Drag to reorder. The order here is the order on the site.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
                    { name: 'url', type: 'text', required: true, admin: { width: '60%' } },
                  ],
                },
                {
                  name: 'children',
                  type: 'array',
                  labels: { singular: 'Drop-down item', plural: 'Drop-down items' },
                  admin: { description: 'Optional. Adds a drop-down under this link.' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
                        { name: 'url', type: 'text', required: true, admin: { width: '60%' } },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'bookingLabel',
              type: 'text',
              defaultValue: 'Book',
              admin: { description: 'The button at the right-hand end of the header.' },
            },
          ],
        },
        {
          label: 'Social',
          /**
           * Instagram used to be here too, and it was the one field on this
           * screen nobody could make sense of: the venues run separate accounts,
           * so the footer builds its Instagram links from the venues and this
           * one was read by nothing. It is gone rather than relabelled.
           */
          description:
            'Instagram is per venue — edit it on the venue itself, under Venues. Everything else is brand-wide and lives here.',
          fields: [
            {
              name: 'facebook',
              type: 'text',
              admin: { description: 'Full URL. Blank hides the link in the footer.' },
            },
            { name: 'tiktok', type: 'text', admin: { description: 'Full URL.' } },
            { name: 'youtube', type: 'text', admin: { description: 'Full URL.' } },
            { name: 'untappd', type: 'text', admin: { description: 'Full URL.' } },
          ],
        },
        {
          label: 'SEO defaults',
          description:
            'Used for the home page and as the fallback anywhere a page has nothing of its own.',
          fields: [
            {
              name: 'defaultTitle',
              type: 'text',
              admin: { description: 'The browser tab title on the home page.' },
            },
            {
              name: 'defaultDescription',
              type: 'textarea',
              admin: { description: 'The sentence under the link in Google results.' },
            },
            {
              name: 'defaultImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'The picture shown when a link to the site is shared. Landscape, at least 1200px wide.',
              },
            },
          ],
        },
      ],
    },
  ],
}
