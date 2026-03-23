import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

/**
 * API endpoint do wysyłania emaili przez Resend
 */

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html } = body

    // Validacja
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    // Upewnij się, że email jest poprawny
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Wysyłanie email przez Resend
    const data = await resend.emails.send({
      from: 'noreply@subly.app',
      to: to,
      subject: subject,
      html: html,
    })

    if (data.error) {
      console.error('Resend error:', data.error)
      return NextResponse.json({ error: data.error }, { status: 500 })
    }

    console.log(`✅ Email sent successfully to ${to}`, data.data?.id)
    return NextResponse.json({ success: true, id: data.data?.id })
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

