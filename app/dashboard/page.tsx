'use client'

import { useEffect, useState } from 'react'
import { supabase, Subscription } from '@/app/lib/supabase'
import { useAuth } from '@/app/lib/AuthContext'
import AppLayout from '@/app/components/AppLayout'
import Link from 'next/link'
import clsx from 'clsx'
import { format, addDays, isWithinInterval, parseISO, differenceInDays } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const CATEGORIES = [
  { name: 'Entertainment', color: '#006D42' },
  { name: 'Cloud/Hosting', color: '#000000' },
  { name: 'Dev Tools', color: '#4B5563' },
  { name: 'Utilities', color: '#7D0015' },
  { name: 'Productivity', color: '#374151' },
  { name: 'Development', color: '#1D4ED8' },
  { name: 'Other', color: '#9CA3AF' },
]

function getCategoryColor(cat: string) {
  return CATEGORIES.find(c => c.name === cat)?.color ?? '#9CA3AF'
}

function monthlyEquivalent(sub: Subscription): number {
  if (sub.status !== 'active') return 0
  if (sub.billing_cycle === 'yearly') return sub.cost / 12
  return sub.cost
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      setSubs(data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  const activeSubs = subs.filter(s => s.status === 'active')
  const monthlyBurn = activeSubs.reduce((a, s) => a + monthlyEquivalent(s), 0)
  const annualProjection = monthlyBurn * 12

  // 14-day renewals
  const today = new Date()
  const in14 = addDays(today, 14)
  const upcoming = subs
    .filter(s => s.status === 'active' && s.next_billing_date)
    .map(s => ({ ...s, d: parseISO(s.next_billing_date!) }))
    .filter(s => isWithinInterval(s.d, { start: today, end: in14 }))
    .sort((a, b) => a.d.getTime() - b.d.getTime())

  // Category breakdown
  const catTotals: Record<string, number> = {}
  activeSubs.forEach(s => {
    catTotals[s.category] = (catTotals[s.category] ?? 0) + monthlyEquivalent(s)
  })
  const catEntries = Object.entries(catTotals).sort((a, b) => b[1] - a[1])
  const catTotal = catEntries.reduce((a, [, v]) => a + v, 0)

  // Sparkline data (last 6 months mock based on current burn)
  const months = ['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR']
  const sparkData = months.map((m, i) => ({
    month: m,
    value: monthlyBurn * (0.85 + i * 0.032),
  }))

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 space-y-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-container-low" />
          ))}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-[1400px] space-y-6 md:space-y-10">

        {/* KPI Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-fade-up">
          {/* Monthly Burn */}
          {/* Monthly Burn */}
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-5 md:p-8 flex flex-col justify-between min-h-[100px] md:min-h-[180px] group hover:border-outline-variant/40 transition-all duration-200">
            <div>
              <span className="font-label text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">Monthly Burn</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-label text-2xl md:text-4xl font-bold tracking-tighter tabular-nums text-on-surface">
                  {monthlyBurn.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="font-label text-sm text-on-surface-variant font-medium">PLN</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 md:mt-0">
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">/ month recurring</span>
              <span className="flex items-center gap-1 font-label text-xs font-bold text-tertiary">
                <span className="material-symbols-outlined text-[13px]">arrow_upward</span>4.2%
              </span>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-surface-container-low p-5 md:p-8 flex flex-col justify-between min-h-[100px] md:min-h-[180px] hover:bg-surface-container transition-all duration-200">
            <div>
              <span className="font-label text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">Active Licenses</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-label text-2xl md:text-4xl font-bold tracking-tighter tabular-nums text-on-surface">{activeSubs.length}</span>
                <span className="font-label text-sm text-on-surface-variant">subscriptions</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 md:mt-0">
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">currently active</span>
              <span className="flex items-center gap-1 font-label text-xs font-bold text-secondary">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>nominal
              </span>
            </div>
          </div>

          {/* Annual Projection */}
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-5 md:p-8 flex flex-col justify-between min-h-[100px] md:min-h-[180px] hover:border-outline-variant/40 transition-all duration-200">
            <div>
              <span className="font-label text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">Annual Projection</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-label text-2xl md:text-4xl font-bold tracking-tighter tabular-nums text-on-surface">
                  {(annualProjection / 1000).toFixed(1)}K
                </span>
                <span className="font-label text-sm text-on-surface-variant font-medium">PLN</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 md:mt-0">
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">12-month outflow</span>
              <Link href="/analytics" className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors">
                Forecast <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Spend Trend + Category Split */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4 md:gap-6 animate-fade-up delay-100">
          {/* Sparkline chart */}
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">6-Month Trend</div>
                <div className="font-headline font-semibold text-xl tracking-tight text-on-surface">Spend Overview</div>
              </div>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">PLN / MONTH</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" stroke="#EDEEF0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontFamily: 'Space Grotesk', fontSize: 10, fill: '#777777' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontFamily: 'Space Grotesk', fontSize: 10, fill: '#777777' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(0)} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #C6C6C6', borderRadius: 0, fontFamily: 'Space Grotesk', fontSize: 11 }}
                    formatter={(v: number) => [`${v.toFixed(2)} PLN`, 'Monthly Spend']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#000000" strokeWidth={2} fill="url(#burnGrad)" dot={{ fill: '#000', r: 3, strokeWidth: 0 }} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-surface-container-low p-6 flex flex-col">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Category Split</div>
            <div className="font-headline font-semibold text-lg tracking-tight text-on-surface mb-6">Distribution</div>
            <div className="space-y-3 flex-1">
              {catEntries.map(([cat, val]) => {
                const pct = catTotal > 0 ? (val / catTotal) * 100 : 0
                return (
                  <div key={cat} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 flex-shrink-0" style={{ background: getCategoryColor(cat) }} />
                        <span className="font-label text-xs text-on-surface">{cat}</span>
                      </div>
                      <span className="font-label text-xs tabular-nums text-on-surface-variant">{val.toFixed(2)} PLN</span>
                    </div>
                    <div className="h-0.5 bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: getCategoryColor(cat) }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Renewal Timeline */}
        <section className="animate-fade-up delay-200">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Upcoming</div>
              <div className="font-headline font-semibold text-xl tracking-tight text-on-surface">Renewal Timeline</div>
            </div>
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Next 14 Days</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="bg-surface-container-low p-12 text-center">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant mb-3 block">event_available</span>
              <p className="font-label text-sm text-on-surface-variant">No upcoming renewals in the next 14 days.</p>
            </div>
          ) : (
            <div className="bg-surface-container-low border border-outline-variant/15 divide-y divide-outline-variant/10">
              {upcoming.map((sub, i) => {
                const days = differenceInDays(sub.d, today)
                const urgent = days <= 3
                return (
                  <div
                    key={sub.id}
                    className={clsx(
                      'flex items-center justify-between px-6 py-4 transition-all duration-150',
                      'hover:bg-surface-container group',
                      `animate-fade-up`
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        'w-1 h-10 flex-shrink-0 transition-all duration-150',
                        urgent ? 'bg-tertiary' : 'bg-outline-variant'
                      )} />
                      <div>
                        <div className="font-headline font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">{sub.name}</div>
                        <div className="font-label text-xs text-on-surface-variant uppercase tracking-wider">{sub.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className={clsx('font-label text-xs font-bold uppercase tracking-wider', urgent ? 'text-tertiary' : 'text-on-surface-variant')}>
                          {days === 0 ? 'TODAY' : `T-${days} day${days !== 1 ? 's' : ''}`}
                        </div>
                        <div className="font-label text-[10px] text-on-surface-variant">{format(sub.d, 'dd MMM yyyy')}</div>
                      </div>
                      <div className="text-right w-28">
                        <div className="font-label text-sm font-bold tabular-nums text-on-surface">{sub.cost.toFixed(2)} PLN</div>
                        <div className="font-label text-[10px] text-on-surface-variant uppercase">{sub.billing_cycle}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </AppLayout>
  )
}
