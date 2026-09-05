'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * A menu thumbnail you can open.
 *
 * The photographs were 112px and nothing else — no way to see the dish. Same
 * native <dialog> approach as the beer gallery: Escape closes it, focus is
 * trapped and restored, and the larger file is not fetched until somebody
 * actually opens one.
 */
export const MenuPhoto = ({
  thumb,
  srcSet,
  full,
  alt,
  width,
  height,
}: {
  thumb: string
  srcSet?: string
  full: string
  alt: string
  width?: number
  height?: number
}) => {
  const ref = useRef<HTMLDialogElement>(null)
  const [opened, setOpened] = useState(false)

  const open = useCallback(() => {
    setOpened(true)
    ref.current?.showModal()
  }, [])

  return (
    <>
      <button type="button" className="menu-shot-btn" onClick={open}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="menu-shot"
          src={thumb}
          srcSet={srcSet}
          sizes="112px"
          alt={alt}
          loading="lazy"
          width={width}
          height={height}
        />
        <span className="sr-only">Enlarge photo of {alt}</span>
      </button>

      <dialog
        ref={ref}
        className="lb"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close()
        }}
      >
        {opened ? (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={full} alt={alt} />
            <figcaption>
              <span>{alt}</span>
              <button type="button" onClick={() => ref.current?.close()}>Close</button>
            </figcaption>
          </figure>
        ) : null}
      </dialog>
    </>
  )
}
