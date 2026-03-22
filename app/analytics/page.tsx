'use client'

import { useEffect, useState } from 'react'
import { supabase, Subscription } from '@/app/lib/supabase'
import { useAuth } from '@/app/lib/AuthContext'
import AppLayout from '@/app/components/AppLayout'
import clsx from 'clsx'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const CAT_COLORS: Record<string, string> = {
  'Entertainment': '#006D42',
  'Cloud/Hosting': '#1D4ED8',
  'Dev Tools':     '#374151',
  'Development':   '#7C3AED',
  'Utilities':     '#7D0015',
  'Productivity':  '#B45309',
  'Other':         '#9CA3AF',
}

function monthlyEquivalent(sub: Subscription): number {
  if (sub.status !== 'active') return 0
  return sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost
}

interface Scenario { id: string; label: string; desc: string; checked: boolean }

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: 'paused',    label: 'Include Paused',       desc: 'Reactivates all paused subscriptions.',      checked: false },
    { id: 'inflation', label: '+10% Inflation',        desc: 'Applies 10% cost increase across all.',      checked: false },
    { id: 'no-annual', label: 'Exclude Annual',        desc: 'Monthly recurring outflow only.',            checked: false },
  ])

  useEffect(() => {
    if (!user) return
    supabase.from('subscriptions').select('*').eq('user_id', user.id)
      .then(({ data }) => { setSubs(data ?? []); setLoading(false) })
  }, [user])

  function toggleScenario(id: string) {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s))
  }

  const inclPaused = scenarios[0].checked
  const inflation  = scenarios[1].checked
  const noAnnual   = scenarios[2].checked
  const factor     = inflation ? 1.1 : 1.0

  const baseMonthly = subs.filter(s => {
    if (s.status === 'cancelled') return false
    if (s.status === 'paused' && !inclPaused) return false
    if (noAnnual && s.billing_cycle === 'yearly') return false
    return true
  }).reduce((a, s) => a + monthlyEquivalent(s), 0) * factor

  const monthlyData = MONTHS.map((month, i) => {
    let base = baseMonthly
    subs.forEach(s => {
      if (s.status === 'cancelled') return
      if (s.status === 'paused' && !inclPaused) return
      if (s.billing_cycle === 'yearly' && !noAnnual && s.next_billing_date) {
        const m = parseInt(s.next_billing_date.split('-')[1]) - 1
        if (m === i) base += (s.cost * factor) - (s.cost / 12 * factor)
      }
    })
    return { month, value: Math.max(0, base) }
  })

  let cum = 0
  const chartData = monthlyData.map(d => { cum += d.value; return { ...d, cumulative: cum } })
  const total12m = chartData[11]?.cumulative ?? 0

  const catTotals: Record<string, number> = {}
  subs.filter(s => s.status === 'active').forEach(s => {
    catTotals[s.category] = (catTotals[s.category] ?? 0) + monthlyEquivalent(s)
  })
  const catData = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))
  const catTotal = catData.reduce((a, c) => a + c.value, 0)

  const quarters = [
    { q: 'Q1', months: 'JAN–MAR', idx: [0, 1, 2] },
    { q: 'Q2', months: 'APR–JUN', idx: [3, 4, 5] },
    { q: 'Q3', months: 'JUL–SEP', idx: [6, 7, 8] },
    { q: 'Q4', months: 'OCT–DEC', idx: [9, 10, 11] },
  ]

  const miniStats = [
    { label: 'Avg / Mo',    value: (total12m / 12).toFixed(2) + ' PLN' },
    { label: 'Peak Month',  value: Math.max(0, ...chartData.map(d => d.value)).toFixed(2) + ' PLN' },
    { label: 'Total 12M',   value: total12m.toFixed(2) + ' PLN' },
    { label: 'Active Subs', value: String(subs.filter(s => s.status === 'active').length) },
  ]

  if (loading) return (
    <AppLayout>
      <div className="p-4 space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-surface-container-low" />)}
      </div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-5 md:space-y-8 max-w-[1400px]">

        {/* ── Header ── */}
        <div className="animate-fade-up">
          <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Projection Engine</div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <h1 className="font-headline font-bold text-2xl md:text-3xl tracking-tighter text-on-surface">Burn Forecast</h1>
            <div className="sm:text-right">
              <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Projected 12M</div>
              <div className="font-label font-bold text-xl md:text-2xl tabular-nums text-on-surface">
                {total12m.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                <span className="text-sm font-normal text-on-surface-variant ml-1">PLN</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Chart ── */}
        <div className="bg-surface-container-lowest border border-outline-variant/15 p-4 md:p-8 animate-fade-up delay-100">
          {/* Chart header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <div>
              <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-0.5">Cumulative Outflow</div>
              <div className="font-headline font-semibold text-base tracking-tight text-on-surface">Monthly Spend & Trend</div>
            </div>
            <div className="flex items-center gap-4 font-label text-[10px] text-on-surface-variant uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-on-surface inline-block" />Monthly</span>
              <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-secondary inline-block" />Cumulative</span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-52 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 4, right: 30, left: -10, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid stroke="#EDEEF0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontFamily: 'Space Grotesk', fontSize: 9, fill: '#777' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontFamily: 'Space Grotesk', fontSize: 9, fill: '#777' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v.toFixed(0)} domain={[0, (d: number) => Math.ceil(d * 1.3 / 100) * 100]} width={45} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontFamily: 'Space Grotesk', fontSize: 9, fill: '#006D42' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toFixed(0)} width={40} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #C6C6C6', borderRadius: 0, fontFamily: 'Space Grotesk', fontSize: 11 }}
                  formatter={(v: number, name: string) => [`${v.toFixed(2)} PLN`, name === 'value' ? 'Monthly' : 'Cumulative']}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Bar yAxisId="left" dataKey="value" radius={0}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.value > baseMonthly * 1.5 ? '#000' : '#3A3A3A'}
                      opacity={0.75 + (i / chartData.length) * 0.25} />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#006D42" strokeWidth={2}
                  strokeDasharray="5 4" dot={{ fill: '#006D42', r: 2, strokeWidth: 0 }} activeDot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Mini stats — 2 cols mobile, 4 desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 mt-5 pt-5 border-t border-outline-variant/15">
            {miniStats.map((s, i) => (
              <div key={s.label} className={clsx('px-3 md:px-6 py-2 md:py-0', i > 0 && 'border-l border-outline-variant/15', i >= 2 && 'mt-3 md:mt-0')}>
                <div className="font-label text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant mb-0.5">{s.label}</div>
                <div className="font-label font-bold text-sm md:text-lg tabular-nums text-on-surface">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scenarios + Quarterly — stacked on mobile ── */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 md:gap-6 animate-fade-up delay-200">

          {/* Scenarios */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-5 md:p-6">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Modeling</div>
            <div className="font-headline font-semibold text-base tracking-tight text-on-surface mb-4">Scenario Modifiers</div>
            {/* On mobile: horizontal chip row. On desktop: vertical list */}
            <div className="flex flex-col gap-4">
              {scenarios.map(s => (
                <button key={s.id} onClick={() => toggleScenario(s.id)} className="flex items-start gap-3 text-left group w-full">
                  <div className={clsx(
                    'w-4 h-4 border mt-0.5 flex-shrink-0 relative transition-all',
                    s.checked ? 'border-primary bg-primary' : 'border-outline-variant group-hover:border-on-surface-variant'
                  )}>
                    {s.checked && <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <div>
                    <div className="font-label text-sm text-on-surface">{s.label}</div>
                    <div className="font-label text-xs text-on-surface-variant mt-0.5">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-outline-variant/15 flex items-center justify-between">
              <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Active</div>
              <div className="font-label font-bold text-lg tabular-nums text-on-surface">
                {scenarios.filter(s => s.checked).length} / {scenarios.length}
              </div>
            </div>
          </div>

          {/* Quarterly table — scrollable on mobile */}
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-5 md:p-6">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Raw Output</div>
            <div className="font-headline font-semibold text-base tracking-tight text-on-surface mb-4">Quarterly Breakdown</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px]">
                <thead>
                  <tr className="border-b border-outline-variant/15">
                    {['Q', 'Period', 'Projected', 'Cumulative', 'Δ'].map(h => (
                      <th key={h} className="text-left py-2 px-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quarters.map(({ q, months, idx }, qi) => {
                    const proj   = idx.reduce((a, i) => a + (monthlyData[i]?.value ?? 0), 0)
                    const cumVal = chartData[idx[2]]?.cumulative ?? 0
                    const prevCum = qi === 0 ? 0 : (chartData[quarters[qi - 1].idx[2]]?.cumulative ?? 0)
                    const delta  = qi === 0 ? null : ((cumVal - prevCum) / Math.abs(prevCum || 1)) * 100
                    return (
                      <tr key={q} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-2 font-label font-bold text-sm text-on-surface">{q}</td>
                        <td className="py-3 px-2 font-label text-xs text-on-surface-variant whitespace-nowrap">{months}</td>
                        <td className="py-3 px-2 font-label text-sm tabular-nums text-on-surface">{proj.toFixed(2)}</td>
                        <td className={clsx('py-3 px-2 font-label text-sm tabular-nums', qi === 3 ? 'font-bold text-secondary' : 'text-on-surface')}>{cumVal.toFixed(2)}</td>
                        <td className="py-3 px-2">
                          {delta === null
                            ? <span className="font-label text-sm text-on-surface-variant">—</span>
                            : <span className={clsx('font-label text-xs font-bold', delta >= 0 ? 'text-tertiary' : 'text-secondary')}>
                                {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                              </span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Category Distribution ── */}
        {catData.length > 0 && (
          <div className="bg-surface-container-low border border-outline-variant/10 p-5 md:p-8 animate-fade-up delay-300">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Distribution</div>
            <div className="font-headline font-semibold text-lg tracking-tight text-on-surface mb-5">Category Allocation</div>

            {/* Pie on top on mobile, side by side on desktop */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 md:items-center">
              <div className="h-48 md:h-56 w-full md:w-[260px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                      {catData.map((_, i) => (
                        <Cell key={i} fill={CAT_COLORS[catData[i].name] ?? '#9CA3AF'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #C6C6C6', borderRadius: 0, fontFamily: 'Space Grotesk', fontSize: 11 }}
                      formatter={(v: number) => [`${v.toFixed(2)} PLN`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2.5">
                {catData.map(({ name, value }) => {
                  const pct = catTotal > 0 ? (value / catTotal * 100) : 0
                  return (
                    <div key={name} className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 flex-shrink-0" style={{ background: CAT_COLORS[name] ?? '#9CA3AF' }} />
                      <span className="font-label text-xs text-on-surface flex-1 truncate">{name}</span>
                      <div className="hidden sm:block w-24 h-1 bg-surface-container overflow-hidden flex-shrink-0">
                        <div className="h-full" style={{ width: `${pct}%`, background: CAT_COLORS[name] ?? '#9CA3AF' }} />
                      </div>
                      <span className="font-label text-xs tabular-nums text-on-surface-variant w-8 text-right flex-shrink-0">{pct.toFixed(0)}%</span>
                      <span className="font-label text-xs tabular-nums text-on-surface text-right flex-shrink-0">{value.toFixed(2)} PLN</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  )
}
