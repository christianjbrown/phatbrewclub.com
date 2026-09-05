import { NextResponse } from 'next/server'
import { createTransport } from 'nodemailer'

export async function POST(req: Request) {
  const form = await req.formData()
  const get = (k: string) => String(form.get(k) ?? '').trim()

  const email = get('email')
  if (!email) {
    return NextResponse.json({ ok: false, error: 'An email address is required.' }, { status: 400 })
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'That email address does not look right.' }, { status: 400 })
  }

  const lines = ['name', 'email', 'venue', 'topic', 'details', 'message']
    .map((k) => [k, get(k)] as const)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)

  // Resend in production, Mailpit locally. Same nodemailer interface either
  // way, so the rest of this handler does not care which is in use.
  const transport = process.env.RESEND_API_KEY
    ? createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: { user: 'resend', pass: process.env.RESEND_API_KEY },
      })
    : createTransport({
        host: process.env.SMTP_HOST ?? 'localhost',
        port: Number(process.env.SMTP_PORT ?? 1026),
        secure: false,
      })

  await transport.sendMail({
    from: process.env.MAIL_FROM ?? 'website@phatbrewclub.local',
    to: process.env.MAIL_TO ?? 'bookings@phatbrewclub.local',
    replyTo: email,
    subject: `Website enquiry — ${get('topic') || 'General'}${get('venue') ? ` (${get('venue')})` : ''}`,
    text: lines.join('\n'),
  })

  return NextResponse.redirect(new URL('/contact?sent=1', req.url), 303)
}
