import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/app/lib/supabase-admin'
import { Resend } from 'resend'
import { differenceInDays, parseISO } from 'date-fns'

/**
 * Cron endpoint: sprawdza zbliżające się odnowienia subskrypcji
 * i wysyła emaile na podstawie alertów użytkowników.
 *
 * Wywołanie: GET /api/cron/check-renewals
 * Opcjonalnie zabezpieczone nagłówkiem: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
    try {
        const cronSecret = process.env.CRON_SECRET
        if (cronSecret) {
            const authHeader = request.headers.get('authorization')
            if (authHeader !== `Bearer ${cronSecret}`) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        const resendApiKey = process.env.RESEND_API_KEY
        if (!resendApiKey) {
            console.error('Missing RESEND_API_KEY')
            return NextResponse.json(
                { error: 'Email service not configured' },
                { status: 500 }
            )
        }

        const supabase = getSupabaseAdmin()
        const resend = new Resend(resendApiKey)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data: alerts, error: alertsError } = await supabase
            .from('alerts')
            .select('user_id, threshold_value, threshold_unit')
            .eq('type', 'renewal')
            .eq('enabled', true)

        if (alertsError) {
            console.error('Failed to fetch alerts:', alertsError)
            return NextResponse.json(
                { error: 'Failed to fetch alerts' },
                { status: 500 }
            )
        }

        if (!alerts || alerts.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active renewal alerts',
                sent: 0,
            })
        }

        const userIds = [...new Set(alerts.map((a) => a.user_id))]

        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', userIds)

        if (profilesError) {
            console.error('Failed to fetch profiles:', profilesError)
            return NextResponse.json(
                { error: 'Failed to fetch profiles' },
                { status: 500 }
            )
        }

        const emailMap = new Map<string, string>()
        for (const p of profiles ?? []) {
            if (p.email) emailMap.set(p.id, p.email)
        }

        const { data: subscriptions, error: subscriptionsError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('status', 'active')
            .in('user_id', userIds)
            .not('next_billing_date', 'is', null)

        if (subscriptionsError) {
            console.error('Failed to fetch subscriptions:', subscriptionsError)
            return NextResponse.json(
                { error: 'Failed to fetch subscriptions' },
                { status: 500 }
            )
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active subscriptions to check',
                sent: 0,
            })
        }

        const subsByUser = new Map<string, typeof subscriptions>()
        for (const sub of subscriptions) {
            const list = subsByUser.get(sub.user_id) ?? []
            list.push(sub)
            subsByUser.set(sub.user_id, list)
        }

        const alertsByUser = new Map<string, number[]>()
        for (const alert of alerts) {
            const current = alertsByUser.get(alert.user_id) ?? []
            current.push(Number(alert.threshold_value))
            alertsByUser.set(alert.user_id, current)
        }

        let sentCount = 0
        const errors: string[] = []

        for (const [userId, thresholds] of alertsByUser) {
            const userEmail = emailMap.get(userId)

            if (!userEmail) {
                console.log('Skipped user - no email', { userId })
                continue
            }

            const userSubs = subsByUser.get(userId) ?? []

            console.log('Checking user', {
                userId,
                userEmail,
                thresholds,
                subscriptionsCount: userSubs.length,
            })

            for (const sub of userSubs) {
                if (!sub.next_billing_date) continue

                const billingDate = parseISO(sub.next_billing_date)
                billingDate.setHours(0, 0, 0, 0)

                const daysUntilRenewal = differenceInDays(billingDate, today)
                const matchesThreshold =
                    daysUntilRenewal === 0 || thresholds.includes(daysUntilRenewal)

                console.log('Checking subscription', {
                    userId,
                    userEmail,
                    subName: sub.name,
                    nextBillingDate: sub.next_billing_date,
                    daysUntilRenewal,
                    thresholds,
                    matchesThreshold,
                })

                if (!matchesThreshold) continue

                const html = generateRenewalEmailHtml(sub, daysUntilRenewal)
                const subject =
                    daysUntilRenewal === 0
                        ? `⚠️ ${sub.name} odnawia się dzisiaj!`
                        : `📅 ${sub.name} odnawia się za ${daysUntilRenewal} ${daysUntilRenewal === 1 ? 'dzień' : 'dni'}`

                try {
                    await resend.emails.send({
                        from: 'SubManager <noreply@subs.qappo.pl>',
                        to: userEmail,
                        subject,
                        html,
                    })
                    sentCount++
                    console.log(`✅ Email sent to ${userEmail} for "${sub.name}" (${daysUntilRenewal}d)`)
                } catch (emailErr) {
                    const msg = `Failed to send to ${userEmail} for "${sub.name}": ${emailErr}`
                    console.error(msg)
                    errors.push(msg)
                }
            }
        }

        return NextResponse.json({
            success: true,
            sent: sentCount,
            errors: errors.length > 0 ? errors : undefined,
            checkedUsers: userIds.length,
            checkedSubscriptions: subscriptions.length,
        })
    } catch (error) {
        console.error('Cron check-renewals error:', error)
        return NextResponse.json(
            { error: 'Failed to check renewals' },
            { status: 500 }
        )
    }
}

/**
 * Generuje HTML emaila o zbliżającej się płatności
 */
function generateRenewalEmailHtml(
    sub: {
        name: string
        category: string
        cost: number
        currency: string
        billing_cycle: string
        next_billing_date: string
    },
    daysLeft: number
): string {
    const formattedCost = sub.cost.toFixed(2)
    const isToday = daysLeft === 0
    const timing = isToday ? 'dzisiaj' : `za ${daysLeft} ${daysLeft === 1 ? 'dzień' : 'dni'}`

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1A1C1D; margin: 0; padding: 0; background: #f4f4f6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000000; color: white; padding: 24px; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 24px; border-radius: 0 0 8px 8px; }
          .alert-box { background: ${isToday ? '#7D0015' : '#006D42'}; color: white; padding: 16px; border-radius: 6px; margin-bottom: 20px; font-size: 16px; font-weight: 600; }
          .details { background: #f9f9fb; padding: 16px; border: 1px solid #edeef0; border-radius: 6px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #edeef0; font-size: 14px; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #777; }
          .detail-value { font-weight: 600; }
          .amount { font-size: 28px; font-weight: 700; text-align: center; margin: 20px 0; color: #1A1C1D; }
          .footer { font-size: 12px; color: #999; margin-top: 24px; text-align: center; padding-top: 16px; border-top: 1px solid #edeef0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">SubManager</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.8;">Przypomnienie o płatności</p>
          </div>
          <div class="content">
            <div class="alert-box">
              ${isToday ? '⚠️' : '📅'} Odnowienie ${timing}: ${sub.name}
            </div>

            <div class="amount">${formattedCost} ${sub.currency}</div>

            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Usługa</span>
                <span class="detail-value">${sub.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Kategoria</span>
                <span class="detail-value">${sub.category}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Cykl</span>
                <span class="detail-value">${sub.billing_cycle === 'monthly' ? 'Miesięczny' : 'Roczny'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Data odnowienia</span>
                <span class="detail-value">${new Date(sub.next_billing_date).toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })}</span>
              </div>
            </div>

            <p style="font-size: 14px; color: #555; line-height: 1.6;">
              Upewnij się, że masz wystarczające środki na koncie. Subskrypcjami możesz zarządzać w panelu SubManager.
            </p>

            <div class="footer">
              <p>Ta wiadomość została wysłana automatycznie przez SubManager.<br>Nie odpowiadaj na tego maila.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}
