import { chromium } from 'playwright';
import { readdir, mkdir } from 'node:fs/promises';

const BASE = 'http://localhost:8770';
const OUT = 'mocks/shots';

const run = async () => {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir('mocks')).filter((f) => f.endsWith('.html')).sort();
  const browser = await chromium.launch();

  for (const [label, vp] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
    for (const f of files) {
      const page = await ctx.newPage();
      await page.goto(`${BASE}/${f}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(600);
      const name = f.replace('.html', '');
      await page.screenshot({ path: `${OUT}/${name}-${label}.png`, fullPage: true });
      await page.close();
    }
    await ctx.close();
    console.log(`${label}: ${files.length} shots`);
  }
  await browser.close();
};
run();
