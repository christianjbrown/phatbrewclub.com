import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1440,height:1200},
  userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' })
const urls = [
  ['brewery page',  'https://untappd.com/PhatBrewClub'],
  ['venue search',  'https://untappd.com/search?q=Phat%20Brew%20Club&type=venue'],
]
for (const [label, url] of urls) {
  const p = await ctx.newPage()
  try {
    const r = await p.goto(url, { waitUntil:'domcontentloaded', timeout:60000 })
    await p.waitForTimeout(3000)
    const info = await p.evaluate(() => ({
      venueLinks: [...new Set([...document.querySelectorAll('a[href*="/v/"]')].map(a=>a.getAttribute('href')))].slice(0,8),
      menuLinks:  [...new Set([...document.querySelectorAll('a[href*="menu"]')].map(a=>a.getAttribute('href')))].slice(0,5),
      text: (document.body.innerText||'').slice(0,200).replace(/\n+/g,' | '),
    }))
    console.log(`\n  ${label} [${r?.status()}]`)
    console.log('    venue links:', info.venueLinks.join(', ') || 'none')
    console.log('    menu links :', info.menuLinks.join(', ') || 'none')
  } catch(e){ console.log(`\n  ${label} FAILED ${e.message.split('\n')[0]}`) }
  await p.close()
}
await b.close()
