/**
 * Small marks for the venue amenity chips, drawn from primitives rather than
 * pulled from an icon library.
 *
 * Two reasons for hand-drawing them: an icon set is a dependency and a payload
 * for six glyphs, and inlining someone's set means carrying their licence
 * around for shapes this simple. They inherit currentColor so a chip's hover
 * state applies for free.
 *
 * Matching is on keywords, not exact strings, so a venue that says "Beer
 * garden & terrace" in the CMS still gets the tree.
 */
const svg = {
  viewBox: '0 0 24 24',
  width: 15,
  height: 15,
  'aria-hidden': true,
  focusable: false,
} as const

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const Tree = () => (
  <svg {...svg}><g {...stroke}><path d="M12 3 5 13h4l-3 5h12l-3-5h4Z" /><path d="M12 18v3" /></g></svg>
)
const Balloon = () => (
  <svg {...svg}><g {...stroke}><ellipse cx="12" cy="9" rx="5" ry="6" /><path d="M12 15v3" /><path d="M10.5 21c1-1 3-1 3-3" /></g></svg>
)
const Gamepad = () => (
  <svg {...svg}><g {...stroke}><rect x="2" y="7" width="20" height="10" rx="4" /><path d="M7 10v4M5 12h4" /><circle cx="16.5" cy="11" r="1" /><circle cx="18.5" cy="13.5" r="1" /></g></svg>
)
const Paw = () => (
  <svg {...svg}><g fill="currentColor"><circle cx="7" cy="9" r="1.9" /><circle cx="11" cy="6.6" r="1.9" /><circle cx="15.6" cy="7.6" r="1.9" /><circle cx="18" cy="11.4" r="1.7" /><path d="M12.2 11.6c2.6 0 5.3 2.2 5.3 4.4 0 1.7-1.4 2.6-3 2.6-1 0-1.6-.4-2.3-.4s-1.3.4-2.3.4c-1.6 0-3-.9-3-2.6 0-2.2 2.7-4.4 5.3-4.4Z" /></g></svg>
)
const People = () => (
  <svg {...svg}><g {...stroke}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 5.8" /><path d="M17.5 14.6A5.5 5.5 0 0 1 21 20" /></g></svg>
)
const Parking = () => (
  <svg {...svg}><g {...stroke}><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><path d="M10 16.5v-9h3a2.6 2.6 0 0 1 0 5.2h-3" /></g></svg>
)
const Dot = () => (
  <svg {...svg}><circle cx="12" cy="12" r="3.2" fill="currentColor" /></svg>
)


const Wave = () => (
  <svg {...svg}><g {...stroke}><path d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" /><path d="M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" /><circle cx="17" cy="6" r="3" /></g></svg>
)
const Note = () => (
  <svg {...svg}><g {...stroke}><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.6" /><circle cx="17.5" cy="16" r="2.6" /></g></svg>
)
const Fish = () => (
  <svg {...svg}><g {...stroke}><path d="M3 12c3-4 7-6 11-6 3 0 5 1.6 6.4 3.4.5.6.5 1.6 0 2.2C19 13.4 17 15 14 15c-4 0-8-2-11-3Z" /><path d="M3 12c1.6 1.2 2.6 2.8 3 4.6" /><circle cx="16.6" cy="10.4" r=".9" fill="currentColor" stroke="none" /></g></svg>
)
const Chair = () => (
  <svg {...svg}><g {...stroke}><path d="M6 4v8h12V4" /><path d="M4 12h16" /><path d="M7 12v8M17 12v8" /></g></svg>
)

const RULES: [RegExp, () => React.JSX.Element][] = [
  // Order matters: the first match wins, so the specific rules come before
  // the general ones — "Outdoor seating" is a chair, not a beer garden.
  [/ocean|sea view|water|beach|harbour/i, Wave],
  [/live music|music|band|dj/i, Note],
  [/seafood|fish|oyster/i, Fish],
  [/outdoor seating|seating/i, Chair],
  [/garden|terrace|beer garden/i, Tree],
  [/kid|child|family|play/i, Balloon],
  [/arcade|game|pool|darts/i, Gamepad],
  [/dog|pet/i, Paw],
  [/function|private|event space|group/i, People],
  [/park/i, Parking],
]

export const AmenityIcon = ({ label }: { label: string }) => {
  const hit = RULES.find(([re]) => re.test(label))
  const Icon = hit ? hit[1] : Dot
  return <Icon />
}
