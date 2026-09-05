import { chromium } from 'playwright'
const PAGES = ['/', '/west-perth', '/hillarys-boardwalk', '/locations', '/contact', '/beers', '/events', '/about']
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1440,height:1200},
  userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' })
for (const path of PAGES) {
  const p = await ctx.newPage()
  try {
    await p.goto('https://www.phatbrewclub.com'+path, { waitUntil:'domcontentloaded', timeout:60000 })
    await p.waitForTimeout(3000)
    await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollBy(0,400);y+=400;if(y>=document.body.scrollHeight+600){clearInterval(t);r()}},90)})})
    await p.waitForTimeout(1500)
    const r = await p.evaluate(() => {
      const t = (document.querySelector('main')||document.body).innerText || ''
      const hoursHits = t.match(/\b(1[0-2]|[1-9])\s?(am|pm)\b/gi) || []
      const dayHits = t.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\b/gi) || []
      return {
        len: t.length,
        hasOpeningWord: /opening hours|open(ing)? times|trading hours|hours/i.test(t),
        timeMentions: [...new Set(hoursHits)].slice(0,8),
        dayMentions: [...new Set(dayHits)].slice(0,8),
        phone: (t.match(/\b(?:\(0\d\)|0\d)\s?\d{4}\s?\d{4}\b/g)||[]).slice(0,3),
        snippet: (t.match(/[^\n]*hours[^\n]*/i)||[])[0]||null,
      }
    })
    console.log(`\n${path}  (${r.len} chars)`)
    console.log(`  says "hours": ${r.hasOpeningWord}   phone: ${r.phone.join(',')||'none'}`)
    console.log(`  times: ${r.timeMentions.join(' ')||'none'}`)
    console.log(`  days : ${r.dayMentions.join(' ')||'none'}`)
    if (r.snippet) console.log(`  line : ${r.snippet.slice(0,110)}`)
  } catch(e){ console.log(`\n${path} FAILED ${e.message.split('\n')[0]}`) }
  await p.close()
}
await b.close()
