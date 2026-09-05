'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

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
 *
 * The browser-tab notification is held down here instead, even though the
 * dashboard has a "Disable browser tab notification" switch for it. We are on
 * the brewery's own property, so that switch would change the behaviour of
 * phatbrewclub.com as well — a setting on their live site is not ours to flip
 * for the sake of a demo. Reverting the title locally affects this site only.
 */
/** What the widget puts in the tab: "1 new message", "2 new messages". */
const NOTIFICATION = /\bnew messages?\b/i

export const LiveChat = ({ propertyId, widgetId }: { propertyId: string; widgetId: string }) => {
  const pathname = usePathname()
  // The title this route is supposed to have. Null means "not established yet",
  // in which case whatever arrives next is adopted rather than fought.
  const intended = useRef<string | null>(null)

  // A navigation is about to retitle the page. Stand down and adopt whatever
  // the router sets, rather than trying to guess when it lands — timing it with
  // a timeout reverted the router's own update and left every route showing the
  // home page's title.
  useEffect(() => {
    intended.current = null
  }, [pathname])

  /**
   * tawk rewrites document.title to "1 new message" when its greeting fires,
   * leaving the tab misrepresenting the page for as long as the visitor stays.
   * Watch the title element and put it back.
   *
   * The first change after a navigation is the router's and is adopted; later
   * ones are the widget's and are reverted. Restoring re-triggers the observer
   * once, but the title then matches and it settles rather than looping.
   */
  useEffect(() => {
    // Watch the head, not the title element. The router swaps the whole <title>
    // node on navigation, so an observer bound to the element itself ends up
    // attached to a detached node and silently stops firing after the first
    // route change — which looks exactly like the guard working.
    const head = document.head
    if (!head) return
    const observer = new MutationObserver(() => {
      const current = document.title
      if (intended.current === null) {
        // Never adopt the widget's own text as the page title, in case it beats
        // the router to the first change on a route that reuses a title.
        if (!NOTIFICATION.test(current)) intended.current = current
        return
      }
      if (current !== intended.current) document.title = intended.current
    })
    observer.observe(head, { childList: true, characterData: true, subtree: true })
    intended.current = document.title
    return () => observer.disconnect()
  }, [])

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
