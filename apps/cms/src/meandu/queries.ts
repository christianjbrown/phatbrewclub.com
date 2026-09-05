/**
 * Operations captured from me&u's own guest client.
 *
 * Their gateway disables GraphQL introspection, so these were recorded by
 * intercepting the POST bodies the me&u web app sends (see
 * scripts/capture-meandu.mjs). Trimmed to the fields we mirror — their real
 * query also carries a dozen localisation fields we have no use for.
 *
 * This is an undocumented internal contract. It can change without notice,
 * which is why the sync verifies its shape and refuses to write on anything
 * unexpected rather than blanking a live menu.
 */

export const VENUE_QUERY = /* GraphQL */ `
  query venue($venueSlug: String!) {
    guestVenue(slug: $venueSlug) {
      id
      name
      slug
      isClosed
      isLive
      timezone
    }
  }
`

export const MENU_QUERY = /* GraphQL */ `
  query menu($venueSlug: String!, $orderingType: OrderingType!, $categorySlug: String!) {
    guestMenuCategory(
      venueSlug: $venueSlug
      categorySlug: $categorySlug
      orderingType: $orderingType
    ) {
      id
      name
      slug
      menuSections {
        id
        name
        slug
        isUnavailable
        menuItems {
          id
          slug
          name
          descriptionPlain
          dietaryTags
          isAvailable
          isPopular
          imageCredit
          image {
            id
            originalImageUrl
          }
          priceData {
            displayPrice
            priceInCents
          }
        }
      }
    }
  }
`

export type MenuItem = {
  id: string
  slug: string
  name: string
  descriptionPlain?: string | null
  dietaryTags?: string[] | null
  isAvailable?: boolean | null
  isPopular?: boolean | null
  imageCredit?: string | null
  image?: { id: string; originalImageUrl?: string | null } | null
  priceData?: { displayPrice?: string | null; priceInCents?: number | null } | null
}

export type MenuSection = {
  id: string
  name: string
  slug: string
  isUnavailable?: boolean | null
  menuItems: MenuItem[]
}

export type MenuCategory = {
  id: string
  name: string
  slug: string
  menuSections: MenuSection[]
}
