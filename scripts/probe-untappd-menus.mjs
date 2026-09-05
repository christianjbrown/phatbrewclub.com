import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1440,height:1400},
  userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' })
for (const [label, url] of [
  ['West Perth', 'https://untappd.com/v/phat-brew-club/11796261'],
  ['Hillarys',   'https://untappd.com/v/phat-brew-club-hillarys/13989960'],
]) {
  const p = await ctx.newPage()
  const r = await p.goto(url, { waitUntil:'domcontentloaded', timeout:60000 })
  await p.waitForTimeout(3500)
  const info = await p.evaluate(() => {
    const t = document.body.innerText || ''
    return {
      verified: /verified/i.test(t),
      hasMenu: /menu|on tap|tap list/i.test(t),
      menuSections: document.querySelectorAll('.menu-section, .menu-item, [class*="menu"]').length,
      beerCount: document.querySelectorAll('.beer-item').length,
      updated: (t.match(/updated[^\n]{0,40}/i) || [])[0] || null,
      head: t.slice(0,240).replace(/\n+/g,' | '),
    }
  })
  console.log(`\n  ${label} [${r?.status()}]`)
  console.log(`    verified venue : ${info.verified}`)
  console.log(`    menu elements  : ${info.menuSections}   beer items: ${info.beerCount}`)
  console.log(`    mentions menu  : ${info.hasMenu}`)
  console.log(`    ${info.head.slice(0,180)}`)
  await p.close()
}
await b.close()
