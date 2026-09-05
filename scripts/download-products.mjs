import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const OUT = 'assets/original/products'
const run = async () => {
  const products = JSON.parse(await readFile('assets/products.json', 'utf8'))
  await mkdir(OUT, { recursive: true })
  let ok = 0, failed = 0, bytes = 0
  for (const p of products) {
    let i = 0
    for (const url of p.images) {
      i++
      const ext = (path.extname(new URL(url).pathname) || '.jpg').toLowerCase().replace('.jpeg', '.jpg')
      const name = `${p.slug}-${i}${ext}`
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/140.0 Safari/537.36',
            Referer: p.url,
          },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buf = Buffer.from(await res.arrayBuffer())
        await writeFile(path.join(OUT, name), buf)
        bytes += buf.length; ok++
      } catch (e) {
        console.log(`  FAILED ${name}: ${e.message}`); failed++
      }
    }
  }
  console.log(`${ok} images downloaded, ${failed} failed, ${(bytes/1048576).toFixed(1)} MB`)
}
run()
