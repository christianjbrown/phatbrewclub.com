import { writeFile, readdir } from 'node:fs/promises';

const NAV = [
  ['Venues', 'venues.html'], ['Beers', 'beers.html'], ["What's on", 'whats-on.html'],
  ['Functions', 'functions-west-perth.html'], ['Shop', 'shop.html'],
  ['About', 'about.html'], ['Contact', 'contact.html'],
];

const VENUES = {
  wp: {
    name: 'Phat HQ Clubrooms', short: 'West Perth', slug: 'west-perth',
    addr: '73/102 Railway Street, West Perth WA 6005',
    near: 'Directly opposite City West Station',
    hero: 'img/hero-westperth.jpg', openTo: '11pm',
    hours: [['Mon – Thu','11am – 11pm'],['Fri','11am – 12am'],['Sat','11am – 12am'],['Sun','11am – 10pm']],
    amenities: ['450 capacity','20 taps','Beer garden','Kids zone','Arcade games','Dog friendly'],
  },
  hil: {
    name: 'The Trophy Room', short: 'Hillarys', slug: 'hillarys',
    addr: 'Hillarys Boat Harbour, Hillarys WA 6025',
    near: 'On the boardwalk, facing the marina',
    hero: 'img/hero-hillarys.jpg', openTo: '10pm',
    hours: [['Mon – Thu','11am – 10pm'],['Fri','11am – 12am'],['Sat','10am – 12am'],['Sun','10am – 10pm']],
    amenities: ['Ocean views','20 taps','Fresh seafood','Live music','Boardwalk deck','Family friendly'],
  },
};

const BEERS = [
  ['West Is Best','Australian Lager','4.2','18','phat-core-west-is-best-decal-2025.png','core','Brewed entirely from WA barley and hops. Crisp, clean and built for a Perth afternoon.'],
  ['Culture of Good Times','Hazy IPA','6.0','40','phat-core-culture-of-good-times-decal-2025.png','core','Soft, juicy and heavy on tropical hop aroma.'],
  ['Risky Business','West Coast IPA','7.0','60','phat-core-risky-business-decal-2025.png','core','Resinous, bitter and unapologetic. Hops front and centre.'],
  ['OG Pale Ale','Pale Ale','5.0','35','phat-core-og-pale-ale-decal-2025.png','core','The original. Bright citrus, a clean finish, still a favourite.'],
  ['Phubba Bubba','Bubblegum Sour','5.5','8','phat-core-phubba-bubba-bubblegum-decal-2025.png','core','Sharp, fruity and faintly ridiculous. In the best way.'],
  ['Hazy Mid','Mid-strength Hazy','3.5','25','phat-core-hazy-mid-decal.png','core','All the hop aroma, half the strength. Session all afternoon.'],
  ['Xtra Phat Ale','Amber Ale','5.0','30','phat-core-xtra-phat-ale-decal.png','core','Malt-led and smooth, with just enough bitterness to balance.'],
  ['Phatatron','Double IPA','7.0','70','phat-limited-edition-phatatron-decal-2025.png','limited','Big, hazy and hop-saturated. Brewed occasionally, gone quickly.'],
  ['Yuzu WCIPA','West Coast IPA','6.8','55','phat-limited-edition-yuzu-wcipa-decal2.png','limited','Yuzu against a classic west coast backbone. Sharp and aromatic.'],
  ['Boat Party','Tropical Sour','4.8','10','phat-limited-edition-boat-party-decal.png','limited','Brewed for the Hillarys boardwalk and the weather that comes with it.'],
  ['Muscle Beach','Hazy Pale','5.2','30','phat-muscle-beach-decal.png','seasonal','Summer seasonal. Soft body, stone fruit, easy going.'],
  ['Pavalicious','Pastry Sour','5.5','12','phat-pavalicious-decal.png','seasonal','Dessert in a can. Sweet, tart, and not remotely subtle.'],
  ['Brightside','Session Ale','4.0','22','phat-brightside-decal-1.png','seasonal','Light, clean and built for a long session.'],
  ['All Gas No Brakes','Double IPA','8.0','80','phat-all-gas-no-brakes-decal.png','limited','As advertised. Enormous hop load, no restraint applied.'],
  ['Passion','Fruited Sour','5.0','10','phat-passion-decal-2.png','seasonal','Passionfruit forward, tart and bright.'],
  ['Three Cheers','Birthday IPA','6.5','45','phat-3rd-birthday-3cheers-decal.png','limited','Brewed for our third birthday. Worth repeating.'],
  ['Grand Northern','Collab Lager','4.6','20','phat-collab-mane-grand-northern-decal-2025.png','collab','A collaboration brew. Clean lager, shared credit.'],
  ['Plateful Pils','Collab Pilsner','5.0','30','phat-collab-plateful-pils-decal-2025-1.png','collab','Crisp continental pilsner, brewed with friends.'],
];

const EVENTS = [
  ['9','SEP','Quiz night','6:30pm','West Perth','Free entry','wp','weekly'],
  ['10','SEP','All-you-can-eat ribs','From 5pm','Hillarys','$50 · 90 minutes','hil','weekly'],
  ['11','SEP','Mondo’s steak night','From 5pm','West Perth','From $29','wp','weekly'],
  ['13','SEP','Live on the boardwalk','7pm','Hillarys','Free entry','hil','oneoff'],
  ['14','SEP','Roast Sunday','From 12pm','Both venues','$35','wp','weekly'],
  ['23','MAY','Homebrew comp awards night','6pm','West Perth','Finished','wp','past'],
];

const head = (title, desc) => `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | Phat Brew Club</title>
<meta name="description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>`;

const header = (cur) => `<header>
<div class="hd">
<a href="index.html" aria-label="Phat Brew Club home"><img src="img/logo.png" alt="Phat Brew Club" width="58" height="58"></a>
<nav aria-label="Main"><ul>${NAV.map(([l, h]) =>
  `<li><a href="${h}"${h === cur ? ' aria-current="page"' : ''}>${l}</a></li>`).join('')}</ul></nav>
<a class="book" href="#book">Book a table</a>
</div></header>
<main id="main">`;

const footer = () => `</main><footer><div class="wrap">
<div class="grid g4">
<div><h4>WEST PERTH</h4>
<p style="font-size:15px;color:#a8a8a8;margin:0 0 8px">${VENUES.wp.addr}</p>
<a href="tel:+61800000000">(08) 0000 0000</a><br><a href="venue-west-perth.html">Hours and menus</a></div>
<div><h4>HILLARYS</h4>
<p style="font-size:15px;color:#a8a8a8;margin:0 0 8px">${VENUES.hil.addr}</p>
<a href="tel:+61800000000">(08) 0000 0000</a><br><a href="venue-hillarys.html">Hours and menus</a></div>
<div><h4>EXPLORE</h4><a href="beers.html">Beers</a><br><a href="whats-on.html">What's on</a><br><a href="shop.html">Shop</a><br><a href="about.html">About</a></div>
<div><h4>ENQUIRIES</h4><a href="functions-west-perth.html">Functions</a><br><a href="contact.html">Contact</a><br><a href="contact.html">Wholesale</a></div>
</div>
<p class="legal">Phat Brew Club · Independent brewery, Western Australia · Redesign concept</p>
</div></footer></body></html>`;

const openBadge = (v) => `<span class="open"><i></i>Open now · until ${v.openTo}</span>`;

const hoursTable = (v) => `<table class="hours"><caption class="sr-only">Opening hours</caption><tbody>${
  v.hours.map((h, i) => `<tr${i === 3 ? ' class="today"' : ''}><th scope="row">${h[0]}</th><td>${h[1]}</td></tr>`).join('')
}</tbody></table>`;

const taps = [
  ['1', 'West Is Best', 'Australian Lager', '4.2%', ''],
  ['2', 'Culture of Good Times', 'Hazy IPA', '6.0%', ''],
  ['3', 'Risky Business', 'West Coast IPA', '7.0%', ''],
  ['4', 'Phubba Bubba', 'Bubblegum Sour', '5.5%', ''],
  ['5', 'Hazy Mid', 'Mid-strength Hazy', '3.5%', ''],
  ['6', 'Ginger Ninja', 'Keg blown', '—', 'out'],
];

const tapList = () => taps.map(t =>
  `<div class="tap ${t[4]}"><span class="tapn">${t[0]}</span><strong>${t[1]}</strong><span class="st">${t[2]}</span><span class="ab">${t[3]}</span></div>`).join('');

const beerCard = (b) => `<article class="card beer">
<img src="img/${b[4]}" alt="${b[0]} can artwork" loading="lazy" width="520" height="650">
<div class="pad"><h3>${b[0]}</h3><p style="font-size:15px;margin-bottom:0">${b[1]}</p>
<div class="spec"><div><b>${b[2]}%</b><span>ABV</span></div><div><b>${b[3]}</b><span>IBU</span></div></div>
</div></article>`;

const evCard = (e) => `<article class="ev ${e[7] === 'past' ? 'past' : ''}">
<div class="dt ${e[6] === 'hil' ? 'hil' : ''}"><span>${e[1]}</span><b>${e[0]}</b></div>
<div style="flex:1"><h3 style="margin-bottom:4px">${e[2]}</h3>
<p style="margin:0;font-size:15px">${e[3]} · ${e[4]} · ${e[5]}</p></div>
<span class="chip" style="margin:0">${e[7] === 'weekly' ? 'Weekly' : e[7] === 'past' ? 'Past' : 'One-off'}</span>
</article>`;

const note = (t) => `<p class="note"><b>Fixes:</b> ${t}</p>`;

const pages = {};

pages['index.html'] = head('Craft brewery in West Perth and Hillarys', 'Independent Perth brewery with two venues. Twenty taps, brewed on site, open seven days.')
  + header('') + `
<div class="hero" style="background-image:url(img/hero-hillarys.jpg)">
<div class="wrap">
<p class="eyebrow">WEST PERTH · HILLARYS</p>
<h1>Perth's home of<br>good beer and<br><span style="color:var(--orange)">good times.</span></h1>
<p class="lede">Two venues, twenty taps, brewed on site in West Perth. Gold Plate winner for WA's best brewery, 2025.</p>
<a class="btn" href="#book">Book a table</a><a class="btn btn-o" href="beers.html">See what's pouring</a>
</div></div>
<section><div class="wrap">
${note('a real <code>h1</code>, hours and an open-now state above the fold, one booking action per venue, and the tap list on the site rather than three taps away on me&amp;u.')}
<h2>Two venues, one club</h2>
<div class="grid g2">
${Object.values(VENUES).map(v => `<article class="card">
<img src="${v.hero}" alt="${v.name}" width="700" height="440">
<div class="pad"><h3>${v.name}</h3>${openBadge(v)}
<p style="margin:14px 0 16px;font-size:16px">${v.addr}<br><span style="color:#8a8a8a">${v.near}</span></p>
<a class="btn" href="#book">Book ${v.short}</a><a class="btn btn-o" href="venue-${v.slug}.html">Hours and menu</a>
</div></article>`).join('')}
</div></div></section>
<section><div class="wrap"><h2>On tap right now</h2>
<p>Updated from the venue, not typed out once a month.</p>
<div style="max-width:760px">${tapList()}</div>
<p style="margin-top:20px;color:#777;font-size:14px">Synced from me&amp;u · updated 6 minutes ago</p>
</div></section>
<section><div class="wrap"><h2>What's on this week</h2>
<div class="grid" style="gap:14px">${EVENTS.filter(e => e[7] !== 'past').slice(0, 4).map(evCard).join('')}</div>
<p style="margin-top:24px"><a class="btn btn-o" href="whats-on.html">See everything that's on</a></p>
</div></section>` + footer();

pages['venues.html'] = head('Our venues', 'Phat Brew Club has two venues: Phat HQ in West Perth and The Trophy Room at Hillarys Boat Harbour.')
  + header('venues.html') + `
<section><div class="wrap">
<h1>Two venues, one club</h1>
<p class="lede">Both brewing, both pouring, both open seven days.</p>
${note('the current version of this page renders two headings and nothing else &mdash; no links, no images, no addresses, no map.')}
${Object.values(VENUES).map(v => `<article class="card" style="margin-bottom:22px">
<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr)">
<img src="${v.hero}" alt="${v.name}" style="height:100%;min-height:280px">
<div class="pad" style="padding:28px">
<h2 style="margin-bottom:12px">${v.name}</h2>${openBadge(v)}
<p style="margin:16px 0 8px;font-size:17px">${v.addr}</p>
<p style="color:#8a8a8a;margin-bottom:16px">${v.near}</p>
<p style="margin-bottom:18px">${v.amenities.map(a => `<span class="chip">${a}</span>`).join('')}</p>
<a class="btn" href="#book">Book ${v.short}</a><a class="btn btn-o" href="venue-${v.slug}.html">Hours and menu</a>
</div></div></article>`).join('')}
</div></section>` + footer();

for (const key of ['wp', 'hil']) {
  const v = VENUES[key];
  pages[`venue-${v.slug}.html`] = head(v.name, `${v.name}. ${v.addr}. Opening hours, tap list, menus and bookings.`)
    + header('venues.html') + `
<div class="hero" style="background-image:url(${v.hero});min-height:420px"><div class="wrap">
<p class="eyebrow">${v.short.toUpperCase()}</p><h1>${v.name}</h1>${openBadge(v)}
</div></div>
<section><div class="wrap">
${note('opening hours as a real table, the address as readable text rather than hidden in a map iframe’s title attribute, and a live tap list.')}
<div class="grid g2">
<div><h2>Opening hours</h2>${hoursTable(v)}</div>
<div><h2>Find us</h2><p style="font-size:18px">${v.addr}</p><p style="color:#8a8a8a">${v.near}</p>
<a class="btn btn-o" href="#map">Get directions</a>
<h3 style="margin-top:26px">Good to know</h3>
<p>${v.amenities.map(a => `<span class="chip">${a}</span>`).join('')}</p></div>
</div></div></section>
<section><div class="wrap"><h2>Twenty taps, poured today</h2>
<div style="max-width:760px">${tapList()}</div>
<p style="margin-top:18px;color:#777;font-size:14px">Synced from me&amp;u · updated 6 minutes ago</p>
</div></section>
<section><div class="wrap"><h2>What's on at ${v.short}</h2>
<div class="grid" style="gap:14px">${EVENTS.filter(e => e[6] === key && e[7] !== 'past').map(evCard).join('')}</div>
</div></section>` + footer();
}

pages['beers.html'] = head('Our beers', 'Eighteen Phat Brew Club beers: core range, seasonals, limited releases and collaborations, with styles and ABV.')
  + header('beers.html') + `
<section><div class="wrap">
<h1>The Phat range</h1>
<p class="lede">Brewed on site in West Perth. Seven core beers, plus whatever the brewers are up to this month.</p>
${note('the current page shows a can image and a text link &mdash; no style, no ABV, no tasting notes, no filtering. Every figure here becomes a CMS field.')}
<p><span class="chip on">All 18</span><span class="chip">Core</span><span class="chip">Seasonal</span><span class="chip">Limited</span><span class="chip">Collabs</span><span class="chip">Pouring now</span></p>
<div class="grid g4">${BEERS.map(beerCard).join('')}</div>
<p style="margin-top:28px;color:#777;font-size:14px">ABV and IBU shown are placeholders pending the brewery's real figures.</p>
</div></section>` + footer();

const b = BEERS[0];
pages['beer-west-is-best.html'] = head(b[0], `${b[0]} — ${b[1]}, ${b[2]}% ABV. ${b[6]}`)
  + header('beers.html') + `
<section><div class="wrap">
<div class="grid" style="grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:44px">
<img src="img/${b[4]}" alt="${b[0]} can artwork" width="520" height="650" style="background:#0a0a0a;border-radius:14px;padding:20px">
<div><p class="eyebrow">CORE RANGE</p><h1 style="font-size:clamp(30px,4vw,46px)">${b[0]}</h1>
<p class="lede">${b[6]}</p>
<div class="spec" style="max-width:440px">
<div><b>${b[2]}%</b><span>ABV</span></div><div><b>${b[3]}</b><span>IBU</span></div>
<div><b>Lager</b><span>STYLE</span></div><div><b>Both</b><span>VENUES</span></div></div>
<p style="margin-top:24px"><a class="btn" href="shop.html">Buy a cube</a><a class="btn btn-o" href="#untappd">On Untappd</a></p>
</div></div>
${note('a beer detail page does not exist on the current site at all. Beer data lives on Untappd.')}
</div></section>
<section><div class="wrap"><h2>Pouring right now</h2>
<div class="grid g2" style="max-width:720px">
${Object.values(VENUES).map(v => `<div class="card"><div class="pad" style="display:flex;align-items:center;gap:12px">
<i style="width:9px;height:9px;border-radius:50%;background:#4ee89a;display:block"></i>
<strong>${v.short}</strong><span style="margin-left:auto;color:#999">Tap 1</span></div></div>`).join('')}
</div></div></section>
<section><div class="wrap"><h2>Grown and malted in WA</h2>
<div class="grid g3">
${[['Mallokup Malt','WA-malted barley forming the backbone'],['Yalup River Farm','Barley grown in southern WA soil'],['Margaret River Hops','Fresh WA hops for aroma and balance']]
  .map(s => `<div class="card"><div class="pad"><h3>${s[0]}</h3><p style="margin:0;font-size:15px">${s[1]}</p></div></div>`).join('')}
</div></div></section>` + footer();

pages['whats-on.html'] = head("What's on", "Events, weekly specials, quiz nights and live music at Phat Brew Club's West Perth and Hillarys venues.")
  + header('whats-on.html') + `
<section><div class="wrap">
<h1>What's on</h1>
${note('events currently have no dates at all, which is why a competition that ended in May is still in the main navigation. Real dates make expiry automatic.')}
<p><span class="chip on">All venues</span><span class="chip">West Perth</span><span class="chip">Hillarys</span></p>
<p><span class="chip on">This week</span><span class="chip">This month</span><span class="chip">Weekly regulars</span></p>
<div class="grid" style="gap:14px;margin-top:20px">${EVENTS.map(evCard).join('')}</div>
</div></section>` + footer();

pages['event-quiz-night.html'] = head('Quiz night', 'Quiz night every Wednesday from 6:30pm at Phat Brew Club. Free entry, prizes on the night.')
  + header('whats-on.html') + `
<section><div class="wrap">
<p class="eyebrow">EVERY WEDNESDAY</p><h1>Quiz night</h1>
<div class="spec" style="max-width:560px"><div><b>6:30pm</b><span>STARTS</span></div><div><b>Wed</b><span>WEEKLY</span></div>
<div><b>Free</b><span>ENTRY</span></div><div><b>Both</b><span>VENUES</span></div></div>
<p class="lede" style="margin-top:24px">Run by the Bamboozled team. Prizes on the night, tables fill fast, and the kitchen stays open throughout.</p>
<a class="btn" href="#book">Book a table</a><a class="btn btn-o" href="#ics">Add to calendar</a>
${note('a recurrence rule replaces writing the same quiz out twice, once per venue page.')}
</div></section>` + footer();

pages['shop.html'] = head('Shop', 'Phat Brew Club beer cubes, merch, headwear and gift cards.')
  + header('shop.html') + `
<section><div class="wrap">
<h1>Shop</h1>
${note('the current shop page is three category tiles and a gift-card link. Prices come from the Square catalogue on migration rather than being invented.')}
<p><span class="chip on">All</span><span class="chip">Beer cubes</span><span class="chip">Merch</span><span class="chip">Headwear</span><span class="chip">Gift cards</span></p>
<div class="grid g4">${[1,2,3,4,5,6,7,8].map(i => `<article class="card">
<img src="img/shop-${i}.jpg" alt="Product photograph" loading="lazy" width="500" height="500" style="aspect-ratio:1/1">
<div class="pad"><h3 style="font-size:17px">Phat product ${i}</h3>
<p style="margin:0 0 8px;font-size:14px;color:#999">Category</p>
<strong style="color:var(--orange);font-size:19px">$XX.00</strong></div></article>`).join('')}</div>
</div></section>` + footer();

pages['about.html'] = head('About us', 'Phat Brew Club started with a group of mates from a footy club who took up homebrewing.')
  + header('about.html') + `
<section><div class="wrap">
<h1>From a footy club to two breweries</h1>
<p class="lede">A group of mates who met at their local footy club, started homebrewing together, and ended up canning it.</p>
<div class="grid g2" style="margin-top:30px">
<img src="img/img_7952_1647848790.jpg" alt="The Phat Brew Club crew" style="border-radius:14px" width="800" height="600">
<div>${[['2020','Won the Margaret River homebrew competition'],['2022','Phat HQ opens in West Perth'],['2025','Gold Plate, WA’s best brewery'],['2026','The Trophy Room opens at Hillarys']]
  .map(t => `<div class="card" style="margin-bottom:12px"><div class="pad" style="display:flex;gap:18px;align-items:center">
<strong style="color:var(--orange);font-size:22px;min-width:64px">${t[0]}</strong><span>${t[1]}</span></div></div>`).join('')}</div>
</div></div></section>` + footer();

pages['contact.html'] = head('Contact', 'Contact Phat Brew Club: bookings, functions, wholesale and general enquiries.')
  + header('contact.html') + `
<section><div class="wrap">
<h1>Get in touch</h1>
${note('the current contact page has no phone number, no address and no form &mdash; just three mailto links and a chat bot. Numbers are placeholders because they are not published anywhere on the existing site.')}
<div class="grid g2">
<div>
<h2>Call us</h2>
<div class="card" style="margin-bottom:14px"><div class="pad"><h3>West Perth</h3>
<p style="margin:0"><a href="tel:+61800000000" style="color:var(--orange);font-size:19px;font-weight:700">(08) 0000 0000</a></p>
<p style="margin:6px 0 0;font-size:15px">${VENUES.wp.addr}</p></div></div>
<div class="card"><div class="pad"><h3>Hillarys</h3>
<p style="margin:0"><a href="tel:+61800000000" style="color:var(--orange);font-size:19px;font-weight:700">(08) 0000 0000</a></p>
<p style="margin:6px 0 0;font-size:15px">${VENUES.hil.addr}</p></div></div>
</div>
<div><h2>Or send a message</h2><form>
<label for="n">Your name</label><input id="n" name="name" autocomplete="name">
<label for="e">Email address</label><input id="e" name="email" type="email" autocomplete="email">
<label for="v">Which venue</label><select id="v" name="venue"><option>West Perth</option><option>Hillarys</option><option>Either</option></select>
<label for="t">What is it about</label><select id="t" name="topic"><option>Booking</option><option>Function or private hire</option><option>Wholesale</option><option>Something else</option></select>
<label for="m">Your message</label><textarea id="m" name="message" rows="4"></textarea>
<button class="btn" type="submit" style="border:0;cursor:pointer">Send message</button>
</form></div></div>
</div></section>` + footer();

for (const key of ['wp', 'hil']) {
  const v = VENUES[key];
  pages[`functions-${v.slug}.html`] = head(`Functions at ${v.short}`, `Private hire and function packages at ${v.name}.`)
    + header('functions-west-perth.html') + `
<section><div class="wrap">
<h1>Have it at Phat</h1>
<p class="lede">Birthdays, work do's, engagements and wakes. Spaces at both venues, from a corner of the beer garden to the whole clubroom.</p>
${note('the current West Perth functions page is live and says function details are coming soon, plus a PDF. This is the highest-margin thing on the site.')}
<p><a class="chip ${key === 'wp' ? 'on' : ''}" href="functions-west-perth.html">West Perth</a><a class="chip ${key === 'hil' ? 'on' : ''}" href="functions-hillarys.html">Hillarys</a></p>
<div class="grid g3" style="margin-top:20px">
${[['The Beer Garden','Up to 80 standing','From $XX pp'],['The Mezzanine','Up to 40 seated','From $XX pp'],['Whole venue','Up to 450','On enquiry']]
  .map(s => `<article class="card"><img src="${v.hero}" alt="${s[0]}" loading="lazy" width="500" height="320">
<div class="pad"><h3>${s[0]}</h3><p style="margin:0 0 8px;font-size:15px">${s[1]}</p>
<strong style="color:var(--orange)">${s[2]}</strong></div></article>`).join('')}
</div></div></section>
<section><div class="wrap"><div class="grid g2">
<div><h2>What's included</h2>
<p>Dedicated function staff, set menus and grazing tables, drinks packages across all twenty taps, AV and screens, and no room hire midweek.</p></div>
<div class="card"><div class="pad"><h3>Enquire</h3><form>
<label for="d">Date and headcount</label><input id="d" name="date">
<label for="c">Contact details</label><input id="c" name="contact">
<button class="btn" type="submit" style="border:0;cursor:pointer">Send enquiry</button></form>
<p style="margin:14px 0 0;font-size:14px;color:#888">Or download the pack (PDF, 1.8 MB)</p>
</div></div></div></div></section>` + footer();
}

pages['homebrew-comp.html'] = head('The Great Aussie Homebrew Comp', 'The Great Aussie Homebrew Comp. Entries for 2026 have closed; the 2027 competition opens in April.')
  + header('') + `
<section><div class="wrap">
<p><span class="chip">2026 · CLOSED</span></p>
<h1>The Great Aussie Homebrew Comp</h1>
<p class="lede">Entries closed 10 May. Awards night was 23 May. The 2027 competition opens in April.</p>
<a class="btn" href="#notify">Tell me when 2027 opens</a><a class="btn btn-o" href="#winners">See the 2026 winners</a>
${note('rather than a dead campaign sitting in the primary navigation four months after it ended, the page states its status and captures interest for next year.')}
</div></section>
<section><div class="wrap"><h2>How it runs</h2>
<div class="grid g4">${[['1 · REGISTER','Enter your beer online'],['2 · DROP OFF','At any of the breweries'],['3 · JUDGED','By commercial brewers'],['4 · BREWED','Winner goes commercial']]
  .map(s => `<div class="card"><div class="pad"><p class="eyebrow" style="margin-bottom:6px">${s[0]}</p><p style="margin:0">${s[1]}</p></div></div>`).join('')}</div>
</div></section>
<section><div class="wrap"><h2>Questions</h2>
<div style="max-width:760px">${['Who can enter?','Does it cost anything?','How many beers can I submit?','What happens if I win?','When do entries open for 2027?']
  .map(q => `<details style="border-bottom:1px solid #222;padding:16px 0"><summary style="font:700 18px Rubik;cursor:pointer;list-style:none">${q}</summary>
<p style="margin:12px 0 0">Answer content is authored in the CMS as part of the competition page.</p></details>`).join('')}</div>
${note('the separate FAQ page merges in here as an accordion instead of being an orphan page.')}
</div></section>` + footer();

const run = async () => {
  for (const [name, html] of Object.entries(pages)) {
    await writeFile(`mocks/${name}`, html);
  }
  const files = (await readdir('mocks')).filter(f => f.endsWith('.html'));
  console.log(`${files.length} pages built:`);
  files.sort().forEach(f => console.log('  ' + f));
};
run();
