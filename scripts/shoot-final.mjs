import { chromium } from 'playwright'
const BASE = 'http://phatbrew.localhost:8080'
const PAGES = [['','home'],['venues','venues'],['venues/west-perth','venue'],['beers','beers'],['whats-on','whats-on'],['contact','contact']]
const run = async () => {
  const b = await chromium.launch()
  for (const [label, vp] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2 })
    for (const [path,name] of PAGES) {
      const p = await ctx.newPage()
      await p.goto(`${BASE}/${path}`, { waitUntil:'networkidle', timeout:60000 })
      await p.waitForTimeout(700)
      await p.screenshot({ path:`final-shots/${name}-${label}.png`, fullPage:true })
      await p.close()
    }
    await ctx.close()
    console.log(`${label}: ${PAGES.length}`)
  }
  await b.close()
}
run()
