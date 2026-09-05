import { readFile, writeFile } from 'node:fs/promises'

/**
 * Builds the news posts from the brewery's own /events page rather than from
 * anything written here. Sections are split on the headings the page itself
 * uses, so the copy stays theirs.
 */
const SECTIONS = [
  ['New West Perth Weekly Specials', 'new-west-perth-weekly-specials', 'news-west-perth-specials.jpg'],
  ['New Hillarys Weekly Specials', 'new-hillarys-weekly-specials', 'news-hillarys-specials.jpg'],
  ['Quiz Every Wednesday @ 6:30pm West Perth', 'quiz-night-west-perth', 'news-quiz-night.jpg'],
  ['Quiz Every Wednesday @ 6:30pm Hillarys', 'quiz-night-hillarys', 'news-quiz-night.jpg'],
]

const run = async () => {
  const page = JSON.parse(await readFile('assets/pages.json', 'utf8')).news
  const text = page.text

  const posts = []
  for (let i = 0; i < SECTIONS.length; i++) {
    const [heading, slug, image] = SECTIONS[i]
    const start = text.indexOf(heading)
    if (start === -1) { console.log(`  MISSING: ${heading}`); continue }
    const nextHeading = SECTIONS[i + 1]?.[0]
    const endMarker = nextHeading ? text.indexOf(nextHeading, start + heading.length) : -1
    const stop = endMarker === -1 ? text.indexOf("What's Going on", start + heading.length) : endMarker
    const body = text.slice(start + heading.length, stop === -1 ? undefined : stop).trim()

    const paragraphs = body.split('\n').map((l) => l.trim()).filter(Boolean)
    posts.push({
      title: heading,
      slug,
      image,
      excerpt: paragraphs[0]?.slice(0, 200) ?? '',
      paragraphs,
    })
    console.log(`  ${heading.slice(0, 44).padEnd(46)} ${paragraphs.length} paras, ${body.length} chars`)
  }

  await writeFile('apps/cms/src/seed/news.json', JSON.stringify(posts, null, 2))
  console.log(`\n${posts.length} posts -> apps/cms/src/seed/news.json`)
}
run()
