# Known issues and decisions

## Timezone: events and hours are stored UTC, business is AWST

Payload stores dates as UTC. Phat Brew Club is in Perth (AWST, UTC+8, no DST),
and the people authoring events are in Perth. Right now a 6:30pm quiz seeds as
`17:30Z`, which is correct but renders as the wrong time unless the front end
converts it.

Decide in Phase 4:

- The front end must format every date in `Australia/Perth`, not the viewer's
  locale. A Sydney customer looking at a Perth gig wants Perth time.
- `schema.org/Event` must emit the offset explicitly (`2026-09-09T18:30:00+08:00`),
  not a bare UTC stamp, or Google shows the wrong time in event results.
- The admin date picker should be pinned to Perth so staff type what they mean.

Not a bug in the model, but it will silently produce wrong times on the public
site if it is skipped.

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
