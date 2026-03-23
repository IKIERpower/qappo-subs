# Email Setup Guide

## Quick Start - Resend (Recommended)

### 1. Install Resend
```bash
npm install resend
```

### 2. Get API Key
1. Go to https://resend.com
2. Sign up / Log in
3. Create API key in Dashboard
4. Copy the key

### 3. Add to .env.local
```bash
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXX
```

### 4. Enable in Code
Edit `app/api/send-email/route.ts`:

Uncomment this section (around line 45):
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

return NextResponse.json({ success: true, id: data.data?.id })
```

And comment out the FALLBACK section at the bottom.

### 5. Test Email Sending
Run this in browser console while logged in:
```javascript
fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'your-email@example.com',
    subject: 'Test Email',
    html: '<h1>Hello</h1><p>This is a test</p>'
  })
}).then(r => r.json()).then(console.log)
```

Should return: `{ success: true, id: "..." }`

---

## Setup Automated Renewal Alerts

### Option A: Vercel Crons (if deployed on Vercel)

Create `app/api/cron/send-renewal-alerts/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'
import { checkAndSendRenewalAlerts } from '@/app/lib/emailService'

export async function GET(request: NextRequest) {
  // Verify cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')

    if (!profiles) {
      return NextResponse.json({ success: true, checked: 0 })
    }

    // Check and send alerts for each user
    let sent = 0
    for (const profile of profiles) {
      try {
        await checkAndSendRenewalAlerts(profile.id, profile.email)
        sent++
      } catch (error) {
        console.error(`Failed for user ${profile.id}:`, error)
      }
    }

    return NextResponse.json({ success: true, checked: profiles.length, sent })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/send-renewal-alerts",
    "schedule": "0 8 * * *"
  }]
}
```

### Option B: External Service (GitHub Actions)

Create `.github/workflows/send-renewal-alerts.yml`:
```yaml
name: Send Renewal Alerts
on:
  schedule:
    - cron: '0 8 * * *'
  workflow_dispatch:

jobs:
  send-alerts:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger alerts
        run: |
          curl -X POST https://your-app.vercel.app/api/cron/send-renewal-alerts \
            -H "authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Option C: Manual Cron Service

Use a service like:
- **EasyCron**: https://www.easycron.com/
- **cron-job.org**: https://cron-job.org/

Set URL to: `https://your-app.com/api/cron/send-renewal-alerts`
Add header: `authorization: Bearer YOUR_CRON_SECRET`
Schedule: Every day at 8 AM

---

## Environment Variables Needed

```bash
# Email sending
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXX

# Cron security (generate random string)
CRON_SECRET=your-super-secret-random-string-here

# Already configured
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

## Testing Renewal Alerts

### 1. Create a test subscription
- Name: "Test Sub"
- Cost: 9.99
- Next Billing: Tomorrow's date

### 2. Check alerts
- Go to /alerts
- Make sure "Renewal Reminder" is enabled
- Note the threshold days (default: 7)

### 3. For testing (manually trigger)
Edit `/subscriptions/page.tsx` to add a debug button:

```typescript
// Add this somewhere in the component
<button 
  onClick={async () => {
    const { user } = useAuth()
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user?.email,
        subject: '[Subly] Test Renewal Alert',
        html: '<h1>Test Email</h1><p>If you see this, email is working!</p>'
      })
    })
    console.log(await response.json())
  }}
>
  Send Test Email
</button>
```

---

## Troubleshooting

### Email not sending?
1. Check API endpoint `/api/send-email` returns `{ success: true }`
2. Verify Resend API key is correct
3. Check that email is valid format
4. Look at Resend dashboard for bounce/blocked emails

### Cron job not running?
1. Verify CRON_SECRET is set correctly
2. Check Vercel deployment logs
3. Try manual curl: 
```bash
curl -X GET https://your-app.com/api/cron/send-renewal-alerts \
  -H "authorization: Bearer YOUR_CRON_SECRET"
```

### Renewal alerts not triggering?
1. Make sure alert is enabled in /alerts
2. Check `next_billing_date` on subscription
3. Verify `threshold_value` in alerts table
4. Manually call `checkAndSendRenewalAlerts(userId, email)` in console

---

## Email Customization

To change email template, edit `app/lib/emailService.ts`:

Function `generateRenewalEmailHtml()` - customize HTML here:
- Colors
- Logo
- Copy/wording
- Layout

---

**Done! Your email system is ready to go 🚀**

