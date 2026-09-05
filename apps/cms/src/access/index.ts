import type { Access, FieldAccess } from 'payload'

export type Role = 'admin' | 'venueManager' | 'staff'

export const ROLES: { label: string; value: Role }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Venue manager', value: 'venueManager' },
  { label: 'Staff', value: 'staff' },
]

const rolesOf = (user: unknown): Role[] =>
  (user as { roles?: Role[] } | null)?.roles ?? []

export const isAdmin: Access = ({ req: { user } }) => rolesOf(user).includes('admin')

export const isAdminField: FieldAccess = ({ req: { user } }) => rolesOf(user).includes('admin')

/** Anyone signed in may read. */
export const isSignedIn: Access = ({ req: { user } }) => Boolean(user)

/** Admins and venue managers may write; staff may not. */
export const canManage: Access = ({ req: { user } }) => {
  const roles = rolesOf(user)
  return roles.includes('admin') || roles.includes('venueManager')
}

/**
 * Staff can change what is pouring and what is on, because that is the
 * whole point of the rebuild — but not the pages around it.
 */
export const canManageOperational: Access = ({ req: { user } }) => {
  const roles = rolesOf(user)
  return roles.includes('admin') || roles.includes('venueManager') || roles.includes('staff')
}

/** Published content is public; drafts are visible only to signed-in users. */
export const publishedOrSignedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const anyone: Access = () => true

/**
 * A customer may only read their own carts, orders and addresses. Admins see
 * everything. Without this, one customer could read another's order history.
 */
export const isDocumentOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if (rolesOf(user).includes('admin')) return true
  return { customer: { equals: user.id } }
}
