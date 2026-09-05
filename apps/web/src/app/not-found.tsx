import Link from 'next/link'

export default function NotFound() {
  return (
    <main id="main">
      <section>
        <div className="wrap">
          <h1>That page has gone walkabout</h1>
          <p className="lede">It might have moved, or the link might be old.</p>
          <Link className="btn" href="/">Back to the homepage</Link>
          <Link className="btn btn-o" href="/venues">Find a venue</Link>
        </div>
      </section>
    </main>
  )
}
