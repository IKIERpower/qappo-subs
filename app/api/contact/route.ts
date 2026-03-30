import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

/**
 * API endpoint for contact form — sends email to contact.qappo@gmail.com
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
        const { email, name, subject, message } = body

        if (!email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields: email, subject, message' },
                { status: 400 }
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            )
        }

        const resend = new Resend(apiKey)

        const senderName = name ? name : 'Anonymous'
        const html = `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">New Contact Form Submission</h2>
                <hr style="border: none; border-top: 1px solid #eee;" />
                <p><strong>From:</strong> ${senderName} &lt;${email}&gt;</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr style="border: none; border-top: 1px solid #eee;" />
                <div style="white-space: pre-wrap; color: #444; line-height: 1.6;">${message}</div>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 24px;" />
                <p style="font-size: 12px; color: #999;">This message was sent via the SubManager contact form.</p>
            </div>
        `

        const data = await resend.emails.send({
            from: 'SubManager Contact <noreply@subs.qappo.pl>',
            to: 'contact.qappo@gmail.com',
            replyTo: email,
            subject: `[Contact] ${subject}`,
            html,
        })

        if (data.error) {
            console.error('Resend error:', data.error)
            return NextResponse.json(
                { error: data.error.message || 'Failed to send email' },
                { status: 500 }
            )
        }

        console.log(`✅ Contact form email sent from ${email}`, data.data?.id)
        return NextResponse.json({ success: true, id: data.data?.id })
    } catch (error) {
        console.error('Contact API error:', error)
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        )
    }
}

