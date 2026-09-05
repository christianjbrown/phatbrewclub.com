import type { Venue } from '@/lib/types'

/**
 * OpenStreetMap embed rather than Google Maps: no API key, no billing account
 * and no third-party cookie dropped on a visitor who only wanted an address.
 * Lazy-loaded so it never competes with first paint, and paired with real
 * directions links because an embedded map is not a route.
 */
export const VenueMap = ({ venue }: { venue: Venue }) => {
  const { latitude: lat, longitude: lng } = venue.address
  if (typeof lat !== 'number' || typeof lng !== 'number') return null

  const d = 0.004
  const bbox = [lng - d, lat - d / 2, lng + d, lat + d / 2].join('%2C')
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
  const query = encodeURIComponent(
    `${venue.name}, ${venue.address.street}, ${venue.address.suburb} ${venue.address.state}`,
  )

  return (
    <div className="map">
      <iframe
        src={src}
        title={`Map showing the location of ${venue.name}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="map-actions">
        <a className="btn btn-o" href={`https://www.google.com/maps/search/?api=1&query=${query}`}>
          Directions (Google)
        </a>
        <a className="btn btn-o" href={`https://maps.apple.com/?q=${query}`}>Directions (Apple)</a>
        <a className="btn btn-o" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}>
          Larger map
        </a>
      </div>
    </div>
  )
}
