/**
 * Dietary codes, spelled out.
 *
 * me&u sends terse codes — V, VG, GF, VGO, NF — which mean nothing to a reader
 * who does not already know them, and "GF" beside a dish is exactly the sort of
 * thing somebody needs to be certain about. Each gets a glyph plus its full
 * name in a title and for screen readers.
 *
 * Emoji were the obvious shortcut and are the wrong tool: they render
 * differently on every platform, and a leaf that means "vegetarian" on one
 * phone can be a different plant on another. These are letters in a chip.
 */
const MEANINGS: Record<string, string> = {
  V: 'Vegetarian',
  VG: 'Vegan',
  VGO: 'Vegan option available',
  GF: 'Gluten free',
  GFO: 'Gluten free option available',
  NF: 'Nut free',
  DF: 'Dairy free',
}

export const DietaryTags = ({ value }: { value?: string | null }) => {
  const codes = (value ?? '')
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)
  if (codes.length === 0) return null

  return (
    <p className="diet-tags">
      {codes.map((c) => {
        const meaning = MEANINGS[c]
        return (
          <span className="diet" key={c} title={meaning ?? c}>
            <b aria-hidden="true">{c}</b>
            <span className="sr-only">{meaning ?? c}</span>
            {meaning ? <i>{meaning}</i> : null}
          </span>
        )
      })}
    </p>
  )
}
