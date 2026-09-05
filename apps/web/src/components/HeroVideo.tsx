'use client'

import { useEffect, useState } from 'react'

/**
 * Background video for the hero, deliberately kept off the critical path.
 *
 * The poster renders as a plain <img> on the server, so it is what paints first
 * and what Lighthouse measures as LCP. The video element is only mounted once
 * the browser is idle, which means its ~700 KB never competes with first paint.
 * Loading it eagerly cost seven Lighthouse points for something purely
 * decorative.
 *
 * Skipped entirely under prefers-reduced-motion: a looping background is
 * precisely what people enable that setting to avoid.
 */
export const HeroVideo = ({ poster }: { poster: string }) => {
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean }
    }

    // Never for people who asked for less motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Never on a metered or slow connection: this is decoration, and 600 KB of
    // it is not worth someone's data or their wait on 3G.
    if (nav.connection?.saveData) return
    if (['slow-2g', '2g', '3g'].includes(nav.connection?.effectiveType ?? '')) return
    // Desktop only. A background video is an enhancement on a large screen and
    // dead weight on a phone, where it is mostly hidden behind the headline
    // anyway. Phones get the poster, which is the thing that actually paints.
    if (!window.matchMedia('(min-width: 1024px)').matches) return

    const start = () => setShowVideo(true)

    // Wait for load, so the video never competes with anything the page needs.
    const afterLoad = () => {
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      }
      if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(start, { timeout: 4000 })
      else window.setTimeout(start, 2000)
    }

    if (document.readyState === 'complete') {
      afterLoad()
      return
    }
    window.addEventListener('load', afterLoad, { once: true })
    return () => window.removeEventListener('load', afterLoad)
  }, [])

  return (
    <>
      {/* The poster is the LCP element, so it needs responsive variants just as
          much as any other hero image — a phone should not pull the 1280px one. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="hero-img"
        src={poster}
        srcSet="/video/hero-poster-640.jpg 640w, /video/hero-poster-960.jpg 960w, /video/hero-poster-1280.jpg 1280w"
        sizes="100vw"
        alt=""
        fetchPriority="high"
        decoding="async"
      />
      {showVideo ? (
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/video/hero.webm" type="video/webm" />
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
      ) : null}
    </>
  )
}
