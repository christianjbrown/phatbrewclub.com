'use client'

import { useCallback, useRef, useState } from 'react'
import type { Shot } from '@/lib/shots'

/**
 * Click-to-enlarge for product photography.
 *
 * Uses a native <dialog> with showModal(): Escape closes it, focus is trapped
 * and restored, and the backdrop is free — all behaviour a hand-rolled overlay
 * has to reimplement badly. The grid ships the small derivative and the full
 * image is only fetched when someone actually opens one, so this costs nothing
 * on first paint.
 */
export const Lightbox = ({ shots }: { shots: Shot[] }) => {
  const ref = useRef<HTMLDialogElement>(null)
  const [current, setCurrent] = useState(0)

  const open = useCallback((i: number) => {
    setCurrent(i)
    ref.current?.showModal()
  }, [])

  if (!shots.length) return null
  const shot = shots[current]

  return (
    <>
      <div className="grid g3">
        {shots.map((s, i) => (
          <button key={s.thumb} type="button" className="shot" onClick={() => open(i)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* The grid is four ~266px columns, so the thumbnail needs 600 at
                2x, not the 800 it used to send with no srcset at all — and the
                dimensions are the picture's own rather than a hard-coded
                800x600 that squashed portrait shots. */}
            <img
              src={s.thumb}
              srcSet={s.srcSet}
              sizes="(min-width: 900px) 266px, 45vw"
              alt={s.alt}
              loading="lazy"
              width={s.width}
              height={s.height}
            />
            <span className="sr-only">Enlarge photo {i + 1} of {shots.length}</span>
          </button>
        ))}
      </div>

      <dialog ref={ref} className="lb" onClick={(e) => { if (e.target === ref.current) ref.current?.close() }}>
        {shot ? (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.full} alt={shot.alt} />
            <figcaption>
              <span>{current + 1} of {shots.length}</span>
              <button type="button" onClick={() => ref.current?.close()}>Close</button>
            </figcaption>
          </figure>
        ) : null}
      </dialog>
    </>
  )
}
