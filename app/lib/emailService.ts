import { getSupabaseBrowserClient, Alert, Subscription } from '@/app/lib/supabase'
const supabase = getSupabaseBrowserClient()
import { differenceInDays, parseISO } from 'date-fns'

/**
 * Email Service - Wysyła powiadomienia o zbliżających się płatnościach
 * Można zintegrować z: SendGrid, Resend, AWS SES, etc.
 */

interface EmailPayload {
  to: string
  subject: string
  html: string
}

/**
 * Wysyła email poprzez API endpoint
 * (Wymagane: Next.js API route: /api/send-email)
 */
export async function sendEmail(payload: EmailPayload) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    
    if (!response.ok) {
      throw new Error(`Email send failed: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

/**
 * Sprawdza czy subskrypcja zbliża się do odnowienia
 * na podstawie alertu typu 'renewal'
 */
export function shouldSendRenewalAlert(
  subscription: Subscription,
  alert: Alert
): boolean {
  if (alert.type !== 'renewal' || !subscription.next_billing_date) {
    return false
  }

  const today = new Date()
  const billingDate = parseISO(subscription.next_billing_date)
  const daysUntilRenewal = differenceInDays(billingDate, today)
  
  // Wysyłaj alert na dokładnie X dni przed (threshold_value)
  return daysUntilRenewal === alert.threshold_value
}

/**
 * Generuje HTML dla emaila o zbliżającej się płatności
 */
export function generateRenewalEmailHtml(
  subscription: Subscription,
  daysLeft: number
): string {
  const formattedCost = subscription.cost.toFixed(2)
  const isToday = daysLeft === 0
  const timing = isToday ? 'TODAY' : `in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1A1C1D; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000000; color: white; padding: 24px; border-radius: 8px 8px 0 0; }
          .content { background: #F9F9FB; padding: 24px; border-radius: 0 0 8px 8px; }
          .alert { background: #7D0015; color: white; padding: 16px; border-radius: 4px; margin-bottom: 20px; }
          .details { background: white; padding: 16px; border: 1px solid #EDEEF0; border-radius: 4px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #EDEEF0; }
          .detail-row:last-child { border-bottom: none; }
          .footer { font-size: 12px; color: #777777; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">SubManager</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Subscription Renewal Alert</p>
          </div>
          
          <div class="content">
            <div class="alert">
              <strong>⚠️ Renewal ${timing}</strong>
            </div>
            
            <p>Hi there,</p>
            <p>One of your subscriptions is coming up for renewal:</p>
            
            <div class="details">
              <div class="detail-row">
                <span><strong>Service:</strong></span>
                <span>${subscription.name}</span>
              </div>
              <div class="detail-row">
                <span><strong>Category:</strong></span>
                <span>${subscription.category}</span>
              </div>
              <div class="detail-row">
                <span><strong>Amount:</strong></span>
                <span><strong>${formattedCost} ${subscription.currency}</strong></span>
              </div>
              <div class="detail-row">
                <span><strong>Billing Cycle:</strong></span>
                <span>${subscription.billing_cycle}</span>
              </div>
              <div class="detail-row">
                <span><strong>Next Billing:</strong></span>
                <span>${new Date(subscription.next_billing_date!).toLocaleDateString('pl-PL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
            
            <p>Make sure you have sufficient funds available. You can manage your subscriptions anytime in your SubManager dashboard.</p>
            
            <div class="footer">
              <p>This is an automated message from SubManager. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Wysyła alert o zbliżającej się płatności
 * (Należy wywołać z cron job lub webhook)
 */
export async function checkAndSendRenewalAlerts(userId: string, userEmail: string) {
  try {
    // Pobierz wszystkie subskrypcje użytkownika
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (!subscriptions || subscriptions.length === 0) return

    // Pobierz alerty użytkownika
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'renewal')
      .eq('enabled', true)

    if (!alerts || alerts.length === 0) return

    const renewalAlert = alerts[0] // Zwykle jest jeden alert type='renewal'

    // Sprawdź każdą subskrypcję
    for (const sub of subscriptions) {
      if (shouldSendRenewalAlert(sub, renewalAlert)) {
        const daysLeft = Math.max(0, differenceInDays(
          parseISO(sub.next_billing_date!),
          new Date()
        ))

        const html = generateRenewalEmailHtml(sub, daysLeft)

        await sendEmail({
          to: userEmail,
          subject: `[SubManager] Renewal Alert: ${sub.name} ${daysLeft === 0 ? 'today' : `in ${daysLeft} days`}`,
          html,
        })

        console.log(`✅ Sent renewal alert email to ${userEmail} for ${sub.name}`)
      }
    }
  } catch (error) {
    console.error('Error checking renewal alerts:', error)
    throw error
  }
}

