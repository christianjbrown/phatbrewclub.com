import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1440,height:1200},
  userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' })
const p = await ctx.newPage()
const net = new Set()
p.on('response', r => { const u=r.url(); if(/\.(png|jpe?g|webp)/i.test(u) && !/logo|payment|favicon/i.test(u)) net.add(u.split('?')[0]) })
await p.goto('https://www.phatbrewclub.com/product/culture-of-good-times-cube-6-/433', { waitUntil:'domcontentloaded', timeout:60000 })
await p.waitForTimeout(4000)
const info = await p.evaluate(() => ({
  totalImgs: document.querySelectorAll('img').length,
  imgSrcs: [...document.querySelectorAll('img')].map(i=>(i.currentSrc||i.src||'').split('?')[0]).filter(Boolean).slice(0,12),
  bgImages: [...document.querySelectorAll('*')].map(e=>getComputedStyle(e).backgroundImage).filter(b=>b&&b!=='none'&&b.includes('url(')).slice(0,10),
  pictures: document.querySelectorAll('picture source').length,
  canvases: document.querySelectorAll('canvas').length,
}))
console.log('imgs in DOM:', info.totalImgs)
info.imgSrcs.forEach(s=>console.log('  img:', s.replace(/^https:\/\/[^/]+/,'')))
console.log('picture sources:', info.pictures, ' canvases:', info.canvases)
info.bgImages.forEach(s=>console.log('  bg:', s.slice(0,110)))
console.log('\nnetwork images (non-logo):')
;[...net].slice(0,12).forEach(u=>console.log('  ', decodeURIComponent(u).replace(/^https:\/\/[^/]+/,'')))
await b.close()
