# Known issues and decisions

## Timezone: resolved

Payload stores dates as UTC and the business is in Perth (AWST, UTC+8, no DST).
This was live-caught by the structured data: a 6:30pm quiz was emitting
`2026-09-10T01:30:00+08:00` because the seed called `setHours()`, which uses
whatever timezone the script runs in — London, in this case.

Fixed on three fronts:

- The seed builds instants explicitly with `Date.UTC(..., hour - 8, ...)`, so
  seed times mean Perth wall-clock times.
- `lib/time.ts` formats every date with `timeZone: 'Australia/Perth'`, so a
  customer in Sydney sees Perth time for a Perth gig, not their own.
- `schema.org/Event` emits an explicit `+08:00` offset via `toPerthIso()`
  rather than a bare UTC stamp, so Google shows the right time.

Verified: quiz night renders "6:30pm" and emits `2026-09-09T18:30:00+08:00`.

Still to do before launch: pin the admin date picker to Perth so staff type
what they mean, and add a test that fails if a seeded 6:30pm event ever
serialises to anything other than `18:30+08:00`.

## Hours are stored as strings

`opens` / `closes` are `"11:00"` text rather than a time type, so nothing stops
someone typing `11am`. Acceptable for now because it keeps the editor simple,
but the "open now" logic and `OpeningHoursSpecification` both parse it, so add
validation before launch.

## Instagram feed is not mirrored

The current homepage embeds ~20 images straight from `cdninstagram.com`. Those
are signed, expiring URLs belonging to the social embed, not hosted brand
assets, so they are deliberately not in the asset library. If the new site wants
a social feed it should call the Instagram API at request time or cache it
server-side, not hotlink.

## Hero video is too low resolution to reuse

The existing hero streams at 852x480 and is stretched full-bleed on desktop. It
needs a higher-resolution master or a re-shoot; the mocks use a still frame.


## Performance: 89, one point under the budget

Lighthouse budget is 90; the median of three warm runs is 89 on the homepage.
Reported as-is rather than by moving the budget.

Measured against the old site, on the same tool:

| | Old (Square Online) | New |
|---|---|---|
| Performance | not scored (see note) | 89 |
| Accessibility | multiple AA failures | 100 |
| SEO | 100 | 100 |
| CLS | 0.539 | 0.061 |
| Requests | 227 | 35 |
| Transfer | 2.34 MB | 0.58 MB |

Three real gains came out of chasing this, each a genuine defect at the time:

1. The hero was a CSS `background-image`. Browsers only discover those after
   CSS resolves, so LCP sat at 5.5s. As a real `<img>` with `fetchpriority=high`
   it dropped to 3.4s.
2. The `hero` derivative was configured at 1920x1080 but the sources are 1600px
   wide, and Payload does not upscale — so the variant was silently never
   generated and every caller fell back to the full-size original. Now 1600x900.
3. Mobile was downloading the 1600px hero. A `srcset` across the existing
   derivatives took the homepage from 79 to 88.

What is left, in order of likely gain:

- **Google Fonts is render-blocking.** FCP is 2.3s under simulated slow 4G and
  the font stylesheet is the main external dependency on the critical path.
  Self-hosting Rubik as a woff2 with `font-display: swap` is the obvious next
  step and should clear 90 on its own.
- **Images are JPEG/PNG.** Payload can emit AVIF/WebP; roughly 30-50% smaller
  at the same quality.
- Note the old site cannot be given a fair Lighthouse performance score for
  comparison, because it loads an autoplaying video and about forty Instagram
  images from third-party CDNs. Its CLS, request count and transfer size are
  directly measured and are the honest comparison.
