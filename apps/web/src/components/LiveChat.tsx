'use client'

import { useEffect } from 'react'

/**
 * tawk.to live chat, loaded late on purpose.
 *
 * The real site loads this in the head on every page. It is the single heaviest
 * third-party dependency on the site and it competes with the page for the main
 * thread during load, which is part of why the original scores what it does.
 *
 * A chat bubble is worthless before the page is usable, so it waits for an idle
 * moment and loads no earlier than first interaction. Nothing about the widget
 * itself changes: same vendor, same script, same property.
 *
 * The property and widget ids are configuration. They identify a specific
 * tawk.to inbox, and pointing this at a different one should be an env change
 * and a restart rather than a commit.
 *
 * Sound cannot be turned off from here. tawk.to's JavaScript API has no audio
 * or mute method at all — it is a per-widget "Disable sound notification"
 * toggle in Widget Settings in the tawk.to dashboard.
 */
export const LiveChat = ({ propertyId, widgetId }: { propertyId: string; widgetId: string }) => {
  useEffect(() => {
    if (document.getElementById('tawk-script')) return

    let done = false
    const load = () => {
      if (done) return
      done = true
      cleanup()
      const s = document.createElement('script')
      s.id = 'tawk-script'
      s.async = true
      s.src = `https://embed.tawk.to/${propertyId}/${widgetId}`
      s.charset = 'UTF-8'
      s.setAttribute('crossorigin', '*')
      document.body.appendChild(s)
    }

    const EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const
    const cleanup = () => {
      for (const e of EVENTS) window.removeEventListener(e, load)
    }
    for (const e of EVENTS) window.addEventListener(e, load, { once: true, passive: true })

    // Load unprompted too, once the browser is genuinely idle, so someone who
    // never scrolls still gets the bubble. requestIdleCallback is missing on
    // older Safari, hence the timeout.
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback
    const timer = ric ? ric(load, { timeout: 6000 }) : window.setTimeout(load, 4000)

    return () => {
      cleanup()
      if (!ric) window.clearTimeout(timer)
    }
  }, [propertyId, widgetId])

  return null
}
