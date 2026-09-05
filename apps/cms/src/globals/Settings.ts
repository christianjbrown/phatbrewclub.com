import type { GlobalConfig } from 'payload'
import { anyone, canManage } from '../access'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site settings',
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
            { name: 'announcement', type: 'text' },
            { name: 'announcementUrl', type: 'text' },
            { name: 'announcementUntil', type: 'date', admin: { description: 'It disappears on its own after this date.' } },
          ],
        },
        {
          label: 'Navigation',
          fields: [
            {
              name: 'mainNav',
              type: 'array',
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
            { name: 'bookingLabel', type: 'text', defaultValue: 'Book a table' },
          ],
        },
        {
          label: 'Social',
          fields: [
            { name: 'instagram', type: 'text' },
            { name: 'facebook', type: 'text' },
            { name: 'tiktok', type: 'text' },
            { name: 'youtube', type: 'text' },
            { name: 'untappd', type: 'text' },
          ],
        },
        {
          label: 'SEO defaults',
          fields: [
            { name: 'defaultTitle', type: 'text' },
            { name: 'defaultDescription', type: 'textarea' },
            { name: 'defaultImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
