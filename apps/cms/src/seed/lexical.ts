/**
 * Payload stores rich text as a Lexical node tree, not HTML, so seeded prose
 * has to be built in that shape. This covers paragraphs and headings, which is
 * all the seed needs.
 */
type Child = { detail: number; format: number; mode: string; style: string; text: string; type: 'text'; version: number }

const textNode = (text: string): Child => ({
  detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1,
})

const paragraph = (text: string) => ({
  children: [textNode(text)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  type: 'paragraph',
  version: 1,
  textFormat: 0,
})

const heading = (text: string, tag: 'h2' | 'h3' = 'h2') => ({
  children: [textNode(text)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  type: 'heading',
  tag,
  version: 1,
})

export const richText = (...blocks: (string | { h: string; tag?: 'h2' | 'h3' })[]) => ({
  root: {
    children: blocks.map((b) =>
      typeof b === 'string' ? paragraph(b) : heading(b.h, b.tag ?? 'h2'),
    ),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'root',
    version: 1,
  },
})
