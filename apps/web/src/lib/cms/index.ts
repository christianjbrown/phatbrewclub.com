import * as payload from './payload'
import * as wordpress from './wordpress'
import type { CmsAdapter } from './contract'

/**
 * Pick the CMS at boot.
 *
 * CMS_KIND is deliberately not a NEXT_PUBLIC_ variable. This codebase has been
 * bitten twice by build-time inlining — see the comments in next.config.ts and
 * middleware.ts — and a NEXT_PUBLIC_ switch would bake one value into the image,
 * so the second deployment of that same image would quietly serve the first
 * site's data. Read at request time on the server, one image genuinely serves
 * both.
 *
 * Both adapters are imported statically rather than behind a dynamic import: a
 * top-level await in a module every page imports is a needless serialisation
 * point, and each is a few kilobytes of fetch wrappers. Anything other than
 * "wordpress" gives the existing behaviour, so an unset variable cannot break
 * the site that is already live.
 */
const impl: CmsAdapter = process.env.CMS_KIND === 'wordpress' ? wordpress : payload

export const {
  getVenues, getVenue, getBeers, getBeer, getTapList, getEvents, getEvent,
  getPage, getPosts, getPost, getMenus, getMerch, getFunctionPackages,
  getSettings, search,
} = impl

export { safeList } from './contract'
export type { SearchHit } from './contract'
export * from './media'
