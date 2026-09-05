import { expect, test } from '@playwright/test'

/**
 * These cover the specific defects found in the old site and the specific bugs
 * hit while building this one, so neither can come back quietly.
 */

test('every page has exactly one h1', async ({ page }) => {
  for (const path of ['/', '/venues', '/venues/west-perth', '/beers', '/whats-on', '/about', '/contact']) {
    await page.goto(path)
    await expect(page.locator('h1'), `${path} should have one h1`).toHaveCount(1)
  }
})

test('pinch zoom is not blocked', async ({ page }) => {
  await page.goto('/')
  const viewport = await page.locator('meta[name=viewport]').getAttribute('content')
  expect(viewport).not.toContain('maximum-scale')
  expect(viewport).not.toContain('user-scalable=no')
})

test('the locations index actually has content', async ({ page }) => {
  // The old site rendered this page with zero links and zero images.
  await page.goto('/venues')
  const links = page.locator('main a')
  await expect(links.first()).toBeVisible()
  expect(await links.count()).toBeGreaterThan(3)
  await expect(page.locator('main img').first()).toBeVisible()
})

test('opening hours and address are readable text, not hidden in an iframe title', async ({ page }) => {
  await page.goto('/venues/west-perth')
  // Appears in the page body and again in the footer, which is the point:
  // on the old site it existed only inside a map iframe's title attribute.
  await expect(page.locator('main').getByText('Railway Street').first()).toBeVisible()
  await expect(page.locator('footer').getByText('Railway Street')).toBeVisible()
  const hours = page.locator('table.hours tbody tr')
  await expect(hours).toHaveCount(7)
  await expect(page.getByText(/Open now|Closed/).first()).toBeVisible()
})

test('beers carry style and ABV, and link to a detail page', async ({ page }) => {
  await page.goto('/beers')
  const cards = page.locator('article.beer')
  expect(await cards.count()).toBeGreaterThanOrEqual(18)
  await expect(page.locator('article.beer .spec').first()).toContainText('%')
  await page.locator('article.beer h3 a').first().click()
  await expect(page.locator('h1')).toBeVisible()
})

test('no link is labelled "click here"', async ({ page }) => {
  for (const path of ['/', '/venues/west-perth', '/venues/hillarys']) {
    await page.goto(path)
    const texts = await page.locator('a').allInnerTexts()
    const vague = texts.filter((t) => /^\s*(click here|here|read more)\s*$/i.test(t))
    expect(vague, `${path} has vague link text`).toEqual([])
  }
})

test('events render in Perth time and emit a matching offset', async ({ page }) => {
  await page.goto('/whats-on/quiz-night')
  await expect(page.getByText('6:30pm')).toBeVisible()

  const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
  const event = ld.map((t) => JSON.parse(t)).find((d) => d['@type'] === 'Event')
  expect(event).toBeTruthy()
  // Perth is UTC+8 year round. A bare Z here would show the wrong time in Google.
  expect(event.startDate).toMatch(/T18:30:00\+08:00$/)
})

test('venue pages emit BarOrPub with opening hours', async ({ page }) => {
  await page.goto('/venues/west-perth')
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
  const venue = ld.map((t) => JSON.parse(t)).find((d) => d['@type'] === 'BarOrPub')
  expect(venue).toBeTruthy()
  expect(venue.address.streetAddress).toContain('Railway Street')
  expect(venue.openingHoursSpecification).toHaveLength(7)
})

test('images are served from the media host, not a cluster-internal name', async ({ page }) => {
  await page.goto('/')
  const srcs = await page.locator('main img').evaluateAll((els) =>
    els.map((e) => (e as HTMLImageElement).getAttribute('src') ?? ''),
  )
  expect(srcs.length).toBeGreaterThan(0)
  for (const src of srcs) {
    expect(src, 'image src must not use an in-cluster hostname').not.toMatch(/^https?:\/\/(cms|minio):\d+/)
  }
})

test('a broken slug 404s rather than 500ing', async ({ page }) => {
  const res = await page.goto('/beers/does-not-exist')
  expect(res?.status()).toBe(404)
})

test('open now reflects Perth time, not the viewer’s timezone', async ({ page }) => {
  // A venue that shuts at 10pm in Perth is shut, whether you are looking from
  // Sydney, London or New York. The badge must never reflect the viewer's clock.
  const perthHour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Australia/Perth', hour: '2-digit', hour12: false,
    }).format(new Date()),
  ) % 24

  await page.goto('/venues/west-perth')
  const badge = page.locator('.open').first()
  await expect(badge).toBeVisible()
  const text = (await badge.innerText()).toLowerCase()

  // West Perth's earliest opening is 11am and its latest close is midnight, so
  // outside 11:00-24:00 Perth time it must never claim to be open.
  if (perthHour < 11) {
    expect(text, `Perth hour is ${perthHour}, venue cannot be open`).toContain('closed')
  }
  expect(text).toMatch(/open now|closed/)
})
