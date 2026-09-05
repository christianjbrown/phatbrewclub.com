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


## Performance: 93 with full media

Lighthouse budget is 90. Median of three warm runs on the homepage is 93, with
the hero video, favicon set and all fourteen events in place.

It briefly hit 94 before the media went in, dropped to 87 when the video and
poster arrived, and came back to 93. Worth recording what actually caused that
dip, because the obvious suspect was wrong: **the video was not the problem.**
Excluding it entirely still left the score at 87. The real cause was that
replacing the hero `<img>` with the video poster dropped the `srcset` that image
had, so phones pulled a 1280px JPEG. Restoring responsive variants fixed it.

The video is now a desktop enhancement: it is skipped under
prefers-reduced-motion, on save-data or 2G/3G connections, and below 1024px.
A phone gets the poster, which is the thing that actually paints. Verified:
one playing video element at 1440px, zero at 390px.

Measured against the old site with the same tool:

| | Old (Square Online) | New |
|---|---|---|
| Performance | not scorable, see note | 94 |
| Accessibility | multiple AA failures | 100 |
| SEO | 100 | 100 |
| FCP | 1.18 s | 0.8 s |
| CLS | 0.539 | 0.000 |
| Requests | 227 | 34 |
| Transfer | 2.34 MB | 0.57 MB |

Five real defects came out of chasing this, each genuine at the time:

1. The hero was a CSS `background-image`. Browsers only discover those once CSS
   resolves, so LCP sat at 5.5 s. A real `<img>` with `fetchpriority="high"`
   took it to 3.4 s.
2. The `hero` derivative was configured at 1920x1080 against 1600px sources.
   Payload does not upscale, so the variant was silently never generated and
   every caller fell back to the full-size original. Now 1600x900.
3. Mobile downloaded the 1600px hero. A `srcset` across the existing
   derivatives took the homepage from 79 to 88.
4. `logo.png` was a 512px, 66 KB PNG rendering at 58px — the same mistake the
   audit criticised the old site for with its 2400px logo. Now 20 KB.
5. **Google Fonts was the last thing on the critical path.** Self-hosting Rubik
   as a variable woff2 took FCP from 2.3 s to 0.8 s and performance from 89 to
   94. It also took CLS from 0.061 to **0.000**: the residual shift was the
   font swapping in late, and a preloaded same-origin font removes it entirely.

Rubik is SIL Open Font License 1.1, which permits redistribution. The licence
ships alongside the files at `public/fonts/OFL.txt`.

Note the old site cannot be given a fair Lighthouse performance score for
comparison, because it autoplays a video and pulls about forty Instagram images
from third-party CDNs. Its CLS, request count and transfer size were directly
measured and are the honest comparison.


## Schema changes need a migration, and the failure is silent-ish

Adding blocks or fields to a collection creates new Postgres tables. In dev,
Payload pushes schema automatically so nothing looks wrong; in production it
does not, and the first query against the missing table fails with `42P01
undefined_table` — after a nine-minute Job backoff, by which point Kubernetes
has deleted the pod and taken the logs with it.

This bit twice in one sitting: once adding the awards/gallery/quote blocks, and
again adding the beer product fields. Before deploying a collection change:

    cd apps/cms && npm run migrate:create -- <name>

Then rebuild the migrate image. Worth adding a CI check that fails when the
config's schema hash has moved but `src/migrations` has not.

## Product data lived on a second upload path

Product photography is served from the legacy Weebly store path
`/uploads/<digits>/`, not the `/uploads/b/<hash>/` used by site content. The
first harvester only matched the second, so it silently returned one image
across all 29 products — the logo. Both roots are now matched, which is where
the other 169 images and 111 MB came from.
