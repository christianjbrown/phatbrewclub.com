/**
 * Newsletter signup.
 *
 * The old site's signup was NOT a third-party service. It was Square Online's
 * own native subscription block, which exists only inside their site builder
 * and cannot be reused from anywhere else — and it was never configured, so it
 * still carried the stock theme confirmation telling subscribers the form was
 * "for demo purposes only" and that they would not be contacted.
 *
 * So there is nothing to reproduce. This posts straight to whichever provider
 * the brewery signs up with, using the plain form POST that Mailchimp, Klaviyo,
 * Campaign Monitor and MailerLite all expose. No API key, no server route, no
 * list of addresses in our database: the provider owns the list, which is the
 * point of not building this in-house.
 *
 * The action URL is configuration rather than a constant, so pointing at a
 * different list is an env change and a restart. Unset means the brewery has no
 * provider yet, and the form is hidden rather than quietly discarding sign-ups.
 *
 * Read at request time, not through NEXT_PUBLIC_. Those are inlined at build,
 * which is how the noindex header silently did nothing in production.
 */
export const Newsletter = () => {
  const action = process.env.NEWSLETTER_FORM_ACTION
  if (!action) return null

  const emailField = process.env.NEWSLETTER_EMAIL_FIELD ?? 'EMAIL'
  // Mailchimp's bot trap: a field bots fill in and humans never see. Named
  // b_<user-id>_<list-id> by them, so it has to be configurable too.
  const honeypot = process.env.NEWSLETTER_HONEYPOT_FIELD

  return (
    <div>
      <h2 className="fh">STAY IN THE LOOP</h2>
      <p style={{ fontSize: 15, color: 'var(--muted)', margin: '0 0 10px' }}>
        New beers, events and the odd tap takeover.
      </p>
      <form
        action={action}
        method="post"
        target="_blank"
        rel="noopener"
        className="news-signup"
      >
        <label htmlFor="nl-email" className="sr-only">
          Email address
        </label>
        <input
          id="nl-email"
          type="email"
          name={emailField}
          required
          autoComplete="email"
          placeholder="you@example.com"

        />
        {honeypot ? (
          <div aria-hidden="true" style={{ position: 'absolute', left: -5000 }}>
            <input type="text" name={honeypot} tabIndex={-1} defaultValue="" />
          </div>
        ) : null}
        <button type="submit">Sign up</button>
      </form>
    </div>
  )
}
