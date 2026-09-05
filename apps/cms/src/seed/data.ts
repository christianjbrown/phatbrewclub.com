export const VENUES = [
  {
    name: 'Phat HQ Clubrooms',
    shortName: 'West Perth',
    slug: 'west-perth',
    street: '73/102 Railway Street',
    suburb: 'West Perth',
    postcode: '6005',
    // OpenStreetMap's own node for the venue, not a geocode of the address
    // string. Two earlier attempts missed: a guess ~800m west that landed on
    // Subiaco Road, then a geocode 169m east that landed on the City West
    // Centre corner at Sutherland Street. Reverse-geocoding these back gives
    // "102, Railway Street, West Perth", which is the building.
    latitude: -31.9441142,
    longitude: 115.8449941,
    mapsQuery: 'Phat Brew Club West Perth',
    transportNote: 'Directly opposite City West Station',
    capacity: 450,
    amenities: ['Beer garden', 'Kids zone', 'Arcade games', 'Dog friendly', 'Function spaces', 'Parking'],
    meanduSlug: 'phatbrewclub',
    bookingUrl: 'https://bookings.nowbookit.com/?accountid=f28d754c-989b-4f8a-ac15-f637a65ed7b1&venueid=8277&theme=light&colors=hex,e65100,000000',
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
    // OpenStreetMap has no node for this venue, so this is 58 Sorrento Quay
    // Boardwalk, the building in the street address. The previous pin was 154m
    // west and reverse-geocoded to a Dome two doors down. The individual shop
    // is not mapped, so this is the closest defensible point.
    latitude: -31.8244722,
    longitude: 115.7412655,
    mapsQuery: 'Phat Brew Club Hillarys',
    transportNote: 'On the boardwalk at Hillarys Boat Harbour, next to Breakwater',
    capacity: 300,
    amenities: ['Ocean views', 'Live music', 'Fresh seafood', 'Family friendly', 'Parking', 'Outdoor seating'],
    // Confirmed against the gateway: this resolves to "Phat Brew Club - Hillarys".
    // Both venues previously pointed at the West Perth slug.
    meanduSlug: 'phatbrewclub-hillarys',
    bookingUrl: 'https://bookings.nowbookit.com/?accountid=f28d754c-989b-4f8a-ac15-f637a65ed7b1&venueid=14140&colors=hex,FF6F20,000000',
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
/**
 * Name, style and ABV come from the can artwork; descriptions come from the
 * brewery's own Untappd entries.
 *
 * They used to be guesses. The names were read off the decal filenames and the
 * style, ABV and IBU were invented outright, which put wrong alcohol content on
 * a live page: "Three Cheers" was listed as a 6.5% Birthday IPA when the can
 * says 3 Cheers, TIPA, 10% ABV. "Brightside, Session Ale, 4%" is Mr Brightside,
 * NZ Bright IPA, 6.5%. "Passion, Fruited Sour" is Phat Passion, and it is not a
 * beer at all — it is a hard seltzer.
 *
 * IBU is gone. No source has ever carried it, so every figure on the site was
 * fabricated. Blank is honest; a number is not.
 *
 * The seven beers that did have shop descriptions were checked the same way,
 * and their styles were guesses too: Phatatron was listed as a Double IPA and
 * its can says Nectaron Oatcream IPA, Xtra Phat Ale as an Amber Ale when it is
 * an XPA. Two ABVs were out as well.
 *
 * Where sources disagree the can wins, since it is what the drinker is holding.
 * Untappd lists Hazy Mid at 3.8% and its can says 3.5%. OG Pale is the awkward
 * one: the 2025 can says 5.5%, while the shop listing and Untappd both say 5%,
 * and the shop description we display says "(5% ABV)" in the brewery's own
 * words. The can is taken as current and the brewery should be asked which is
 * right.
 */
export const BEERS: [string, string, number, number | null, string, string, string][] = [
  ['West Is Best', 'Lager', 4.2, null, 'core', 'phat-core-west-is-best-decal-2025.png', ''],
  ['Culture of Good Times', 'DDH Hazy IPA', 6.5, null, 'core', 'phat-core-culture-of-good-times-decal-2025.png', ''],
  ['Risky Business', 'West Coast IPA', 7.0, null, 'core', 'phat-core-risky-business-decal-2025.png', ''],
  ['OG Pale Ale', 'Pale Ale', 5.5, null, 'core', 'phat-core-og-pale-ale-decal-2025.png', ''],
  ['Phubba Bubba', 'Strawberry Bubblegum Sour', 5.5, null, 'core', 'phat-core-phubba-bubba-bubblegum-decal-2025.png', ''],
  ['Hazy Mid', 'Mid Strength Hazy Pale', 3.5, null, 'core', 'phat-core-hazy-mid-decal.png',
    'Pineapple and citrus notes deliver on the El Dorado and Galaxy Hop promise. Designed for day drinking, this one satisfy a thirst.'],
  ['Xtra Phat Ale', 'XPA', 5.0, null, 'core', 'phat-core-xtra-phat-ale-decal.png', ''],
  ['Phatatron', 'Nectaron Oatcream IPA', 7.0, null, 'limited', 'phat-limited-edition-phatatron-decal-2025.png', ''],
  ['Yuzu WCIPA', 'West Coast IPA', 6.7, null, 'limited', 'phat-limited-edition-yuzu-wcipa-decal2.png',
    '6.7% West Coast IPA fruited with tonnes of Yuzu. Strong notes of citrus zest, with a hefty amount of bitterness'],
  ['Boat Party', 'NZ Hazy IPA', 6.0, null, 'limited', 'phat-limited-edition-boat-party-decal.png',
    'Tropical waves are rolling in, and they are carrying our brand-new Boat Party NZ Hazy IPA! Packed with Nelson, Citra & Bract hops, this juicy, hazy delight is as smooth as a sunset cruise and as lively as a deck party. Whether you are kicking back by the water or just dreaming of the open sea, crack a can and set sail on flavours of ripe pineapple, citrus zest & stone fruit goodness.'],
  ['All Gas No Brakes', 'Terpene Hazy IPA', 7.2, null, 'limited', 'phat-all-gas-no-brakes-decal.png',
    'Buckle up, this turbocharged, 7.2% Hazy IPA hits the ring with Galaxy, Strata and Mosaic hops, boosted by a tag team of guava and cosmic guava terpene. Making it dank, juicy and flavourful.'],
  ['3 Cheers', 'TIPA', 10.0, null, 'limited', 'phat-3rd-birthday-3cheers-decal.png', ''],
  ['Muscle Beach', 'Pale Ale', 4.5, null, 'seasonal', 'phat-muscle-beach-decal.png',
    'For those who lift big & large - this 4.5% Cali Pale is fresh, bold, and built for strength, brewed with WA Strongman, because even the strongest need a proper refresher!'],
  ['Pavalicious', 'Pavlova Sour', 6.0, null, 'seasonal', 'phat-pavalicious-decal.png',
    "This one's a nod to the perfect pavlova - sweet, fruity, and full of that irresistible contrast. Kiwi, strawberry, and passionfruit combine in a tart juicy sour that captures all the magic of the dessert. It's the smooth, tangy goodness you love, no sporks needed - it's mum's pav ramped up to 100."],
  ['Mr Brightside', 'NZ Bright IPA', 6.5, null, 'seasonal', 'phat-brightside-decal-1.png',
    'This 6.5% NZ Bright IPA is juicy and tropical with NZ hops and a slightly bitter finish.'],
  ['Phat Passion', 'Hard Seltzer', 4.0, null, 'seasonal', 'phat-passion-decal-2.png', ''],
  ['Grand Northern', 'Northern IPA', 6.0, null, 'collab', 'phat-collab-mane-grand-northern-decal-2025.png',
    'Brewed with our mates at Mane Liquor, this 6% Northern IPA packs a proper hop punch. Big tropical and citrus vibes, just like the bold North American brews that inspired it.'],
  ['Plateful Pils', 'Mediterranean Pilsner', 4.6, null, 'collab', 'phat-collab-plateful-pils-decal-2025-1.png',
    "Crisp, clean and beautifully balanced - this bright 4.6% pilsner was originally crafted for Perth's Plateful celebration of food and flavour. It's the ultimate go to pairing with good food and great company."],
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
