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
