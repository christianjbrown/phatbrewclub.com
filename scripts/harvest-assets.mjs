import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';

const ORIGIN = 'https://www.phatbrewclub.com';

const PAGES = [
  '/', '/locations', '/west-perth', '/hillarys-boardwalk', '/beers',
  '/events', '/shop-all', '/about', '/contact', '/wp-functions',
  '/hl-functions', '/great-aussie-homebrew-comp-2026',
  '/great-aussie-homebrew-comp-2026-faq',
  '/shop/merch/O23UDKFVXVG4CJPHZL6V2FO5', '/shop/mens/2', '/shop/womens/3',
  '/shop/headwear/4', '/shop/beer-cube-16-x-375ml-cans-/5',
];

const isFirstParty = (u) =>
  /editmysite\.com\/uploads\//.test(u) || /phatbrewclub\.com\/uploads\//.test(u);

const isAsset = (u) => /\.(png|jpe?g|webp|gif|avif|pdf|mp4)(\?|$)/i.test(u);

const skip = (u) =>
  /\/static\/icons\/payment-methods\//.test(u) ||
  /cdninstagram|fbcdn|google|gstatic|doubleclick|datadog|sentry|tawk/.test(u);

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        y += step;
        if (y >= document.body.scrollHeight + 1200) {
          clearInterval(timer);
          resolve();
        }
      }, 120);
    });
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
  });

  const assets = new Map();
  const record = (url, page, how) => {
    if (!url || skip(url) || !isAsset(url)) return;
    const clean = url.split('?')[0];
    const entry = assets.get(clean) ?? {
      url: clean,
      withParams: url,
      firstParty: isFirstParty(url),
      pages: new Set(),
      how: new Set(),
    };
    entry.pages.add(page);
    entry.how.add(how);
    assets.set(clean, entry);
  };

  for (const path of PAGES) {
    const page = await ctx.newPage();
    page.on('response', (r) => record(r.url(), path, 'network'));
    try {
      await page.goto(ORIGIN + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(2500);
      await autoScroll(page);
      const dom = await page.evaluate(() =>
        [...document.querySelectorAll('img')]
          .map((i) => i.currentSrc || i.src)
          .filter(Boolean)
          .concat([...document.querySelectorAll('a[href*="/uploads/"]')].map((a) => a.href))
          // Favicons, apple-touch icons and iOS splash screens live in <link>,
          // not <img>, so the first pass missed every one of them.
          .concat(
            [...document.querySelectorAll('link[rel*="icon"],link[rel*="apple"]')].map((l) => l.href),
          )
          // CSS background images.
          .concat(
            [...document.querySelectorAll('*')]
              .map((el) => getComputedStyle(el).backgroundImage)
              .filter((b) => b && b.includes('/uploads/'))
              .map((b) => (b.match(/url\("?([^")]+)"?\)/) || [])[1])
              .filter(Boolean),
          ),
      );
      dom.forEach((u) => record(u, path, 'dom'));
      const n = [...assets.values()].filter((a) => a.pages.has(path)).length;
      console.log(`${path.padEnd(46)} ${n} assets`);
    } catch (e) {
      console.log(`${path.padEnd(46)} FAILED: ${e.message.split('\n')[0]}`);
    }
    await page.close();
  }

  await browser.close();

  const out = [...assets.values()]
    .map((a) => ({
      url: a.url,
      withParams: a.withParams,
      firstParty: a.firstParty,
      filename: decodeURIComponent(a.url.split('/').pop()),
      pages: [...a.pages],
      discoveredVia: [...a.how],
    }))
    .sort((a, b) => Number(b.firstParty) - Number(a.firstParty) || a.filename.localeCompare(b.filename));

  await mkdir('assets', { recursive: true });
  await writeFile('assets/manifest.json', JSON.stringify(out, null, 2));

  const fp = out.filter((a) => a.firstParty).length;
  console.log(`\n${out.length} assets total, ${fp} first-party -> assets/manifest.json`);
};

run();
