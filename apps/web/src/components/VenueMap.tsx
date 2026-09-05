import type { Venue } from '@/lib/types'

/**
 * Google Maps where a key is configured, OpenStreetMap where it is not.
 *
 * This uses the Maps Embed API, which is the iframe product rather than the
 * JavaScript SDK — it is the one Maps API with no per-request charge, and it
 * needs no script on the page. The key is public by design because it travels
 * in the iframe URL; what protects it is the referrer and API restrictions set
 * on it in Terraform.
 *
 * The place query names the venue rather than only its coordinates, so Google
 * resolves it against its own record of the business. That matters here: two
 * earlier attempts to place the West Perth pin from the address string alone
 * put it on Subiaco Road and then on the City West Centre corner.
 *
 * Lazy-loaded so it never competes with first paint, and paired with real
 * directions links, because an embedded map is not a route.
 */
export const VenueMap = ({ venue }: { venue: Venue }) => {
  const { latitude: lat, longitude: lng } = venue.address
  if (typeof lat !== 'number' || typeof lng !== 'number') return null

  const place = `${venue.name}, ${venue.address.street}, ${venue.address.suburb} ${venue.address.state} ${venue.address.postcode}`
  const query = encodeURIComponent(place)
  const key = process.env.MAPS_EMBED_KEY

  const osmBox = [lng - 0.004, lat - 0.002, lng + 0.004, lat + 0.002].join('%2C')
  const src = key
    ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${query}&center=${lat},${lng}&zoom=16`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${osmBox}&layer=mapnik&marker=${lat}%2C${lng}`

  return (
    <div className="map">
      <iframe
        src={src}
        title={`Map showing the location of ${venue.name}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="map-actions">
        <a className="btn btn-o" href={`https://www.google.com/maps/search/?api=1&query=${query}`}>
          Directions (Google)
        </a>
        <a className="btn btn-o" href={`https://maps.apple.com/?q=${query}`}>Directions (Apple)</a>
        <a
          className="btn btn-o"
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
        >
          Larger map
        </a>
      </div>
    </div>
  )
}
