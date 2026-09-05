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
    amenities: ['Beer garden', 'Kids zone', 'Arcade games', 'Dog friendly', 'Function spaces', 'Parking'],
    meanduSlug: 'phatbrewclub',
    // Taken from the venue page. The venues trade seasonal hours, hence the label.
    hoursLabel: 'Spring/Summer',
    publicHolidayNote: 'Public holidays usually noon to 9pm at both venues. Check our socials for Christmas trading.',
    hours: [
      ['mon', '12:00', '21:00'], ['tue', '12:00', '21:00'], ['wed', '12:00', '22:00'],
      ['thu', '12:00', '22:00'], ['fri', '11:00', '00:00'], ['sat', '11:00', '00:00'],
      ['sun', '11:00', '21:00'],
    ],
    faqs: [
      ['Are you dog friendly?', 'Yes, dogs are welcome in the outdoor beer garden.'],
      ['Do you take walk-ins?', 'Absolutely. Walk-ins are welcome every day.'],
      ['Is there parking?', 'Yes, there is plenty of nearby paid and street parking.'],
      ['Is Phat HQ kid friendly?', 'Very. There is a sandpit, an arcade, a kids menu and plenty of room.'],
      ['Can I order from my table?', 'Yes, me&u ordering is available throughout the venue.'],
    ],
    hero: 'hero-westperth.jpg',
  },
  {
    name: 'The Trophy Room',
    shortName: 'Hillarys',
    slug: 'hillarys',
    street: '222/58 Southside Drive, Sorrento Quay',
    suburb: 'Hillarys',
    postcode: '6025',
    latitude: -31.8244,
    longitude: 115.7395,
    transportNote: 'On the boardwalk at Hillarys Boat Harbour, next to Breakwater',
    capacity: 300,
    amenities: ['Ocean views', 'Live music', 'Fresh seafood', 'Family friendly', 'Parking', 'Outdoor seating'],
    meanduSlug: 'phatbrewclub',
    hoursLabel: 'Spring/Summer',
    publicHolidayNote: 'Public holidays usually noon to 9pm at both venues. Check our socials for Christmas trading.',
    hours: [
      ['mon', '12:00', '21:00'], ['tue', '12:00', '21:00'], ['wed', '12:00', '22:00'],
      ['thu', '12:00', '22:00'], ['fri', '11:00', '00:00'], ['sat', '11:00', '00:00'],
      ['sun', '11:00', '18:00'],
    ],
    faqs: [],
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
 * Every recurring special and event currently running at both venues.
 *
 * weekday: 0 = Sunday .. 6 = Saturday. The seed schedules each on its next real
 * occurrence of that weekday, so a "Roast Sunday" is never seeded onto a Friday.
 * title, weekday, hour, recurrence, venueSlugs, category, free, price, description
 */
export const EVENTS: [string, number, number, string, string[], string, boolean, string, string][] = [
  // Both venues
  ['Quiz Night', 3, 18.5, 'weekly', ['west-perth', 'hillarys'], 'Quiz', true, '',
    'Run by the Bamboozled team. Prizes on the night and the kitchen stays open throughout. Tables fill fast, so book ahead.'],
  ['Happy Hour', 1, 17, 'weekly', ['west-perth', 'hillarys'], 'Food special', false, '$9 pints',
    'Monday to Friday, 5pm to 6pm. $9 pints of West is Best and $7 house wines at both venues.'],

  // West Perth
  ['Mega Burger Monday', 1, 17, 'weekly', ['west-perth'], 'Food special', false, '$25',
    'Your choice of the Double Oklahoma Smash Burger or the Nashville Chicken Burger, both served with chips.'],
  ['Big Schnitty Energy', 2, 17, 'weekly', ['west-perth'], 'Food special', false, '$25',
    'A proper pub schnitty loaded with prosciutto, olive tapenade and goat feta, with crispy chips alongside.'],
  ['Phat Pasta Party', 3, 17, 'weekly', ['west-perth'], 'Food special', false, '$25',
    'Choose from spaghetti bolognese, gnocchi alla Norma or orecchiette. Selected jugs from $20 after 5pm.'],
  ["Mondo's Steak Night", 4, 17, 'weekly', ['west-perth'], 'Food special', false, 'From $29',
    'Premium cuts from Mondo Butcher & Grocer, flame grilled. Flank from $29, rostbiff rump, sirloin and rump cap also available.'],
  ['Roast Sunday', 0, 12, 'weekly', ['west-perth'], 'Food special', false, '$35',
    'Slow-roasted pork belly with a house-made scotch egg, minted peas, roasted spring onion and gravy. The roast changes monthly.'],

  // Hillarys
  ['Big Phat Sandos', 1, 17, 'weekly', ['hillarys'], 'Food special', false, '$35',
    'The Handlebar Beef Rib Double Cheeseburger with a West is Best middy. Big, messy, worth it.'],
  ['Taco Tuesday', 2, 17, 'weekly', ['hillarys'], 'Food special', false, '$15',
    'Three loaded tacos, best enjoyed with a cold one looking out over the water.'],
  ["Mondo's Steak Night", 3, 17, 'weekly', ['hillarys'], 'Food special', false, 'From $29',
    'Premium cuts from Mondo Butcher & Grocer, cooked to order. One of the best steak nights in the northern suburbs.'],
  ['All-You-Can-Eat Ribs', 4, 17, 'weekly', ['hillarys'], 'Food special', false, '$50',
    'Unlimited ribs for ninety minutes. Bring an appetite and take the napkins.'],
  ['Friday Cocktails', 5, 20, 'weekly', ['hillarys'], 'Food special', false, '$15',
    'A rotating selection of cocktails for $15 from 8pm, overlooking the marina.'],
  ['Roast Sundays', 0, 12, 'weekly', ['hillarys'], 'Food special', false, '$35',
    'A proper Sunday roast with all the trimmings, best enjoyed with a fresh Phat beer and a view of the harbour.'],

  // One-offs
  ['Live on the Boardwalk', 6, 19, 'once', ['hillarys'], 'Live music', true, '',
    'Live music on the boardwalk as the sun goes down. Free entry, no bookings needed.'],
]
