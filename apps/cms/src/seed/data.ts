export const VENUES = [
  {
    name: 'Phat HQ Clubrooms',
    shortName: 'West Perth',
    slug: 'west-perth',
    street: '73/102 Railway Street',
    suburb: 'West Perth',
    postcode: '6005',
    latitude: -31.9436,
    longitude: 115.8382,
    transportNote: 'Directly opposite City West Station',
    capacity: 450,
    amenities: ['Beer garden', 'Kids zone', 'Arcade games', 'Dog friendly', 'Function spaces'],
    meanduSlug: 'phatbrewclub',
    hours: [
      ['mon', '11:00', '23:00'], ['tue', '11:00', '23:00'], ['wed', '11:00', '23:00'],
      ['thu', '11:00', '23:00'], ['fri', '11:00', '00:00'], ['sat', '11:00', '00:00'],
      ['sun', '11:00', '22:00'],
    ],
    hero: 'hero-westperth.jpg',
  },
  {
    name: 'The Trophy Room',
    shortName: 'Hillarys',
    slug: 'hillarys',
    street: 'Hillarys Boat Harbour',
    suburb: 'Hillarys',
    postcode: '6025',
    latitude: -31.8244,
    longitude: 115.7395,
    transportNote: 'On the boardwalk, facing the marina',
    capacity: 300,
    amenities: ['Ocean views', 'Live music', 'Fresh seafood', 'Family friendly', 'Parking'],
    meanduSlug: 'phatbrewclub',
    hours: [
      ['mon', '11:00', '22:00'], ['tue', '11:00', '22:00'], ['wed', '11:00', '22:00'],
      ['thu', '11:00', '22:00'], ['fri', '11:00', '00:00'], ['sat', '10:00', '00:00'],
      ['sun', '10:00', '22:00'],
    ],
    hero: 'hero-hillarys.jpg',
  },
]

/** name, style, abv, ibu, category, decal filename, description */
export const BEERS: [string, string, number, number, string, string, string][] = [
  ['West Is Best', 'Australian Lager', 4.2, 18, 'core', 'phat-core-west-is-best-decal-2025.png', 'Brewed entirely from WA barley and hops. Crisp, clean and built for a Perth afternoon.'],
  ['Culture of Good Times', 'Hazy IPA', 6.0, 40, 'core', 'phat-core-culture-of-good-times-decal-2025.png', 'Soft, juicy and heavy on tropical hop aroma.'],
  ['Risky Business', 'West Coast IPA', 7.0, 60, 'core', 'phat-core-risky-business-decal-2025.png', 'Resinous, bitter and unapologetic. Hops front and centre.'],
  ['OG Pale Ale', 'Pale Ale', 5.0, 35, 'core', 'phat-core-og-pale-ale-decal-2025.png', 'The original. Bright citrus, a clean finish, still a favourite.'],
  ['Phubba Bubba', 'Bubblegum Sour', 5.5, 8, 'core', 'phat-core-phubba-bubba-bubblegum-decal-2025.png', 'Sharp, fruity and faintly ridiculous. In the best way.'],
  ['Hazy Mid', 'Mid-strength Hazy', 3.5, 25, 'core', 'phat-core-hazy-mid-decal.png', 'All the hop aroma, half the strength. Session all afternoon.'],
  ['Xtra Phat Ale', 'Amber Ale', 5.0, 30, 'core', 'phat-core-xtra-phat-ale-decal.png', 'Malt-led and smooth, with just enough bitterness to balance.'],
  ['Phatatron', 'Double IPA', 7.0, 70, 'limited', 'phat-limited-edition-phatatron-decal-2025.png', 'Big, hazy and hop-saturated. Brewed occasionally, gone quickly.'],
  ['Yuzu WCIPA', 'West Coast IPA', 6.8, 55, 'limited', 'phat-limited-edition-yuzu-wcipa-decal2.png', 'Yuzu against a classic west coast backbone. Sharp and aromatic.'],
  ['Boat Party', 'Tropical Sour', 4.8, 10, 'limited', 'phat-limited-edition-boat-party-decal.png', 'Brewed for the Hillarys boardwalk and the weather that comes with it.'],
  ['All Gas No Brakes', 'Double IPA', 8.0, 80, 'limited', 'phat-all-gas-no-brakes-decal.png', 'As advertised. Enormous hop load, no restraint applied.'],
  ['Three Cheers', 'Birthday IPA', 6.5, 45, 'limited', 'phat-3rd-birthday-3cheers-decal.png', 'Brewed for our third birthday. Worth repeating.'],
  ['Muscle Beach', 'Hazy Pale', 5.2, 30, 'seasonal', 'phat-muscle-beach-decal.png', 'Summer seasonal. Soft body, stone fruit, easy going.'],
  ['Pavalicious', 'Pastry Sour', 5.5, 12, 'seasonal', 'phat-pavalicious-decal.png', 'Dessert in a can. Sweet, tart, and not remotely subtle.'],
  ['Brightside', 'Session Ale', 4.0, 22, 'seasonal', 'phat-brightside-decal-1.png', 'Light, clean and built for a long session.'],
  ['Passion', 'Fruited Sour', 5.0, 10, 'seasonal', 'phat-passion-decal-2.png', 'Passionfruit forward, tart and bright.'],
  ['Grand Northern', 'Collab Lager', 4.6, 20, 'collab', 'phat-collab-mane-grand-northern-decal-2025.png', 'A collaboration brew. Clean lager, shared credit.'],
  ['Plateful Pils', 'Collab Pilsner', 5.0, 30, 'collab', 'phat-collab-plateful-pils-decal-2025-1.png', 'Crisp continental pilsner, brewed with friends.'],
]

/**
 * weekday: 0 = Sunday .. 6 = Saturday. The seed schedules each event on its
 * next real occurrence of that weekday, so a "Roast Sunday" is never seeded
 * onto a Friday.
 * title, weekday, hour, recurrence, venueSlugs, category, free, price
 */
export const EVENTS: [string, number, number, string, string[], string, boolean, string][] = [
  ['Quiz night', 3, 18.5, 'weekly', ['west-perth', 'hillarys'], 'Quiz', true, ''],
  ['All-you-can-eat ribs', 4, 17, 'weekly', ['hillarys'], 'Food special', false, '$50'],
  ["Mondo's steak night", 4, 17, 'weekly', ['west-perth'], 'Food special', false, 'From $29'],
  ['Live on the boardwalk', 6, 19, 'once', ['hillarys'], 'Live music', true, ''],
  ['Roast Sunday', 0, 12, 'weekly', ['west-perth', 'hillarys'], 'Food special', false, '$35'],
]
