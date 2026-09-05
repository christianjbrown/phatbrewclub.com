import { chromium } from 'playwright'
const BASE = 'http://phatbrew.localhost:8080'
const PAGES = [['about','about'],['beers/culture-of-good-times','beer-detail'],['news','news'],['venues/west-perth','venue'],['','home']]
const run = async () => {
  const b = await chromium.launch()
  for (const [label, vp] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2 })
    for (const [path,name] of PAGES) {
      const p = await ctx.newPage()
      await p.goto(`${BASE}/${path}`, { waitUntil:'load', timeout:60000 })
      await p.waitForTimeout(3000)
      await p.screenshot({ path:`final-shots/${name}-${label}.png`, fullPage:true })
      await p.close()
    }
    await ctx.close(); console.log(`${label}: ${PAGES.length}`)
  }
  await b.close()
}
run()
