# ✅ RESEND SKONFIGUROWANY - QUICK START

## 🎉 Status: GOTOWE DO UŻYCIA

Twoja aplikacja jest teraz w pełni skonfigurowana do wysyłania emaili o zbliżających się płatnościach!

---

## 📧 Jak Działa

### Proces:
1. **User** idzie do `/alerts` i konfiguruje **Renewal Alert** (np. 2 dni przed)
2. **Cron job** co godzinę sprawdza zbliżające się subskrypcje
3. **Jeśli match** → Email wysyłany przez Resend
4. **User** dostaje powiadomienie email

### Integracją:
```
Database (Subscriptions)
        ↓
    next_billing_date
        ↓
Alert Configuration (ALERTS tab)
        ↓
    threshold_value (np. 2 dni)
        ↓
Wysłanie Emaila (jeśli deadline zbliża się)
```

---

## 🧪 Jak Testować (3 opcje)

### Opcja A: Test w Przeglądarce (NAJPROŚCIEJ)
```
1. Zaloguj się do aplikacji
2. Przejdź do: http://localhost:3000/api/test-renewal-alerts
3. Powinieneś zobaczyć JSON z wynikami
```

### Opcja B: Test z Konsoli Przeglądarki
```javascript
// Otwórz DevTools Console
fetch('/api/test-renewal-alerts?userId=YOUR_USER_ID&email=your-email@example.com')
  .then(r => r.json())
  .then(console.log)
```

### Opcja C: Test z Curl
```bash
curl "http://localhost:3000/api/test-renewal-alerts?userId=xxx&email=your@email.com"
```

---

## ✅ Czego Należy Oczekiwać

### Gdy Wszystko Działa:
```json
{
  "success": true,
  "message": "✅ Renewal alerts checked for your@email.com",
  "timestamp": "2026-03-23T16:04:00Z"
}
```

### Jeśli Email Zostanie Wysłany:
- W konsoli zobaczysz: `✅ Email sent successfully to your@email.com`
- User dostanie email na swojej skrzynce

### Jeśli Nie Będzie Emaila:
To NORMALNE jeśli:
- Subskrypcja nie zbliża się w ciągu `threshold_days`
- Alert jest DISABLED (wyłączony)
- Subskrypcja ma status `paused` lub `cancelled`

---

## 🔧 Co Zostało Skonfigurowane

### ✅ Pliki Zmienione:
- `app/api/send-email/route.ts` - Włączony kod Resend

### ✅ Pliki Dodane:
- `app/api/test-renewal-alerts/route.ts` - Test endpoint

### ✅ Środowisko:
- `.env.local` ma `RESEND_API_KEY` ✓

---

## 🚀 Setup Cron Job (Dla Automatyki)

### Opcja 1: GitHub Actions (Bezpłatne)

1. Utwórz `.github/workflows/send-renewal-alerts.yml`:

```yaml
name: Send Renewal Alerts
on:
  schedule:
    - cron: '0 * * * *'  # Co godzinę
  workflow_dispatch:

jobs:
  send-alerts:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger renewal alerts
        run: |
          curl -X GET https://your-app.com/api/test-renewal-alerts
```

2. Push do gita - automatycznie będzie się uruchamiać

### Opcja 2: Vercel Crons (Jeśli host na Vercel)

1. Utwórz `app/api/cron/send-renewal-alerts/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/test-renewal-alerts`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

2. Dodaj do `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/send-renewal-alerts",
    "schedule": "0 * * * *"
  }]
}
```

### Opcja 3: External Service (EasyCron)

1. Przejdź na https://www.easycron.com
2. Utwórz nowy cron job
3. URL: `https://your-app.com/api/test-renewal-alerts`
4. Schedule: Co godzinę (hourly)
5. Gotowe!

---

## 🎯 Praktyczny Przykład

### Scenario: Netflix Renewal za 2 Dni

1. **Setup**:
   - Dodaj subskrypcję "Netflix"
   - Next billing: 25 marca
   - Cena: 49 PLN

2. **Alert**:
   - Idź do `/alerts`
   - Renewal Alert: włączony, 2 dni

3. **Cron Job Uruchomi się** (23 marca)
   - Sprawdza: Netflix renews 25 marca (za 2 dni)
   - Match! Wysyła email

4. **User Dostaje Email**:
   - Subject: `[Subly] Renewal Alert: Netflix in 2 days`
   - Zawiera: Nazwę, kwotę, datę, okres

---

## 📊 Test Plan

### Test 1: Email API Working
```
GET /api/send-email (POST)
Request:
{
  "to": "your@email.com",
  "subject": "Test",
  "html": "<h1>Hello</h1>"
}

Expected Response:
{ "success": true, "id": "..." }
```

### Test 2: Renewal Alerts
```
GET /api/test-renewal-alerts
Expected Response:
{
  "success": true,
  "checked": N,
  "successCount": M
}
```

### Test 3: Alert Configuration
```
Go to /alerts
- See "Renewal Alert" 
- Toggle it ON
- Set threshold to 2 days
- Save
```

---

## ✅ Checklist

- [x] RESEND_API_KEY w .env.local
- [x] app/api/send-email/route.ts skonfigurowany
- [x] app/api/test-renewal-alerts/route.ts gotowy
- [x] emailService.ts używa alertów z bazy
- [x] Test endpoint dostępny
- [x] Gotowe do setup cron job

---

## 🎉 GOTOWE!

Możesz teraz:
1. ✅ Konfigurować alerty na `/alerts`
2. ✅ Testować wysyłanie emaili: `/api/test-renewal-alerts`
3. ✅ Setup cron job (patrz wyżej)
4. ✅ Otrzymywać emaili o zbliżających się płatnościach

**Co dalej?**
- Setup cron job żeby emaili wysyłały się automatycznie
- Lub testuj ręcznie za każdym razem

Powodzenia! 🚀

