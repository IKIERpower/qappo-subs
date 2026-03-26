import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

/**
 * API endpoint do wysyłania emaili przez Resend
 */

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.RESEND_API_KEY

        if (!apiKey) {
            console.error('Missing RESEND_API_KEY')
            return NextResponse.json(
                { error: 'Email service is not configured' },
                { status: 500 }
            )
        }

        const body = await request.json()
        const { to, subject, html } = body

        if (!to || !subject || !html) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, html' },
                { status: 400 }
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(to)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            )
        }

        const resend = new Resend(apiKey)

        const data = await resend.emails.send({
            from: 'SubManager <onboarding@resend.dev>',
            to,
            subject,
            html,
        })

        if (data.error) {
            console.error('Resend error:', data.error)
            return NextResponse.json(
                { error: data.error.message || 'Failed to send email' },
                { status: 500 }
            )
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
