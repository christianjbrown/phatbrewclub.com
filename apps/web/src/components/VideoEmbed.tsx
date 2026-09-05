'use client'

import { useState } from 'react'

/**
 * A YouTube embed that costs nothing until it is played.
 *
 * The normal embed loads a few hundred kilobytes of player and sets cookies on
 * every visitor, whether or not anyone watches. This shows YouTube's own poster
 * frame and swaps in the iframe on click — the facade pattern, and the reason
 * one video does not undo the image work on the rest of the site.
 *
 * nocookie host, so nothing is set until someone chooses to watch.
 */
export const VideoEmbed = ({ id, title }: { id: string; title: string }) => {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&modestbranding=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="video">
      <button type="button" className="video-play" onClick={() => setPlaying(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          width={480}
          height={360}
        />
        <span className="video-badge" aria-hidden="true">▶</span>
        <span className="sr-only">Play video: {title}</span>
      </button>
    </div>
  )
}
