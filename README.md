# Ledger — Precision Editorial Financial Architect

A Next.js subscription management dashboard connected to Supabase.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase database

Go to your Supabase project → SQL Editor and run the contents of `supabase_migration.sql`.

This creates:
- `subscriptions` table
- `alerts` table
- Row Level Security policies
- Seed data

### 3. Environment variables

The `.env.local` file is already configured with your credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **Dashboard** — KPI cards (Monthly Burn, Active Licenses, Annual Projection), 6-month spend trend chart, category distribution, upcoming renewals timeline
- **Subscriptions** — Sortable/filterable table with accordion drill-down, inline status changes, add/edit/delete
- **Analytics** — 12-month burn forecast with scenario modeling (include paused, +10% inflation, exclude annual), quarterly breakdown table, category pie chart
- **Alerts** — Configurable notification rules with toggle on/off, threshold editing, add/delete

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** — Precision Editorial design system
- **Supabase** — PostgreSQL database + auto-generated REST API
- **Recharts** — Charts and data visualization
- **Framer Motion** — Page animations
- **date-fns** — Date utilities

## Design System

Based on "Precision Editorial — The Financial Architect":
- Inter (headlines) + Space Grotesk (labels/data)
- Strict 2px border radius
- Tonal layering instead of shadows
- No divider lines — color shifts define boundaries
- Tabular numerals for all financial figures
