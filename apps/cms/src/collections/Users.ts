import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, ROLES } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'roles'],
    group: 'Settings',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: isAdmin,
    update: ({ req: { user }, id }) => {
      const roles = (user as { roles?: string[] } | null)?.roles ?? []
      if (roles.includes('admin')) return true
      return user?.id === id
    },
    delete: isAdmin,
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['staff'],
      options: ROLES,
      access: { create: isAdminField, update: isAdminField },
      admin: {
        description:
          'Staff can change tap lists and events. Venue managers can also edit pages, beers and venues. Admins can do everything.',
      },
    },
  ],
}
