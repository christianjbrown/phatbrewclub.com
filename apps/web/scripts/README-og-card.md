# Regenerating the social card

`public/og-default.jpg` is the picture shown when a link to the site is shared
and the page has no image of its own. It is generated from `og-card.html`
rather than drawn by hand, so it can be rebuilt when the photograph or the
wording changes.

From `apps/web`:

    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
      --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
      --window-size=1200,630 --screenshot=/tmp/og@2x.png \
      "file://$PWD/scripts/og-card.html"

    node -e 'require("sharp")("/tmp/og@2x.png").resize(1200,630,{fit:"fill"})
      .jpeg({quality:88,chromaSubsampling:"4:4:4",mozjpeg:true})
      .toFile("public/og-default.jpg").then(i=>console.log(i.width+"x"+i.height))'

Rendered at 2x and scaled down so the type is crisp. 1200x630 is the size
Facebook, LinkedIn and Slack crop to.

This is only the fallback. Site settings has a default image field, and
anything uploaded there wins, so the brewery can replace the card without a
deploy.
