'use client'

import { useEffect, useState } from 'react'
import { supabase, Subscription } from '@/app/lib/supabase'
import { useAuth } from '@/app/lib/AuthContext'
import AppLayout from '@/app/components/AppLayout'
import clsx from 'clsx'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const CAT_COLORS: Record<string, string> = {
  'Entertainment': '#006D42',
  'Cloud/Hosting': '#1D4ED8',
  'Dev Tools': '#374151',
  'Development': '#7C3AED',
  'Utilities': '#7D0015',
  'Productivity': '#B45309',
  'Other': '#9CA3AF',
}

function monthlyEquivalent(sub: Subscription): number {
  if (sub.status !== 'active') return 0
  if (sub.billing_cycle === 'yearly') return sub.cost / 12
  return sub.cost
}

interface Scenario {
  id: string
  label: string
  desc: string
  checked: boolean
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: 'paused', label: 'Include Paused Subscriptions', desc: 'Recalculates burn as if all paused services reactivate.', checked: false },
    { id: 'inflation', label: 'Simulate +10% Inflation', desc: 'Applies a 10% cost increase across all active records.', checked: false },
    { id: 'no-annual', label: 'Exclude Annual Renewals', desc: 'Isolates strict monthly recurring outflow only.', checked: false },
  ])

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
      setSubs(data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  function toggleScenario(id: string) {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s))
  }

  const inclPaused = scenarios[0].checked
  const inflation = scenarios[1].checked
  const noAnnual = scenarios[2].checked
  const factor = inflation ? 1.1 : 1.0

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

  // Category breakdown for pie
  const catTotals: Record<string, number> = {}
  subs.filter(s => s.status === 'active').forEach(s => {
    catTotals[s.category] = (catTotals[s.category] ?? 0) + monthlyEquivalent(s)
  })
  const catData = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  const quarters = [
    { q: 'Q1', months: 'JAN – MAR', idx: [0, 1, 2] },
    { q: 'Q2', months: 'APR – JUN', idx: [3, 4, 5] },
    { q: 'Q3', months: 'JUL – SEP', idx: [6, 7, 8] },
    { q: 'Q4', months: 'OCT – DEC', idx: [9, 10, 11] },
  ]

  if (loading) {
    return <AppLayout><div className="p-8 animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-surface-container-low" />)}</div></AppLayout>
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6 lg:space-y-10 max-w-[1400px]">

        {/* Header */}
        <div className="flex items-start justify-between animate-fade-up">
          <div>
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Projection Engine</div>
            <h1 className="font-headline font-bold text-3xl tracking-tighter text-on-surface">Burn Forecast</h1>
            <p className="font-label text-sm text-on-surface-variant mt-1">12-month projection & scenario modeling</p>
          </div>
          <div className="text-right">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Projected 12M Burn</div>
            <div className="font-label font-bold text-3xl tabular-nums text-on-surface">
              {total12m.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-base font-normal text-on-surface-variant ml-1">PLN</span>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-surface-container-lowest border border-outline-variant/15 p-8 animate-fade-up delay-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Cumulative Outflow</div>
              <div className="font-headline font-semibold text-lg tracking-tight text-on-surface">Monthly Spend & Trend</div>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 font-label text-[10px] text-on-surface-variant uppercase tracking-wider">
                <span className="w-3 h-3 bg-on-surface inline-block" />Monthly Spend
              </div>
              <div className="flex items-center gap-2 font-label text-[10px] text-on-surface-variant uppercase tracking-wider">
                <span className="w-5 border-t-2 border-dashed border-secondary inline-block" />Cumulative
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 40, left: 10, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid stroke="#EDEEF0" vertical={false} strokeDasharray="0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontFamily: 'Space Grotesk', fontSize: 10, fill: '#777' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontFamily: 'Space Grotesk', fontSize: 10, fill: '#777' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v.toFixed(0)}
                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.3 / 100) * 100]}
                  width={55}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontFamily: 'Space Grotesk', fontSize: 10, fill: '#006D42' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toFixed(0)}
                  width={50}
                />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #C6C6C6', borderRadius: 0, fontFamily: 'Space Grotesk', fontSize: 11 }}
                  formatter={(v: number, name: string) => [`${v.toFixed(2)} PLN`, name === 'value' ? 'Monthly Spend' : 'Cumulative']}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Bar yAxisId="left" dataKey="value" radius={0}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.value > baseMonthly * 1.5 ? '#000000' : '#3A3A3A'}
                      opacity={0.75 + (i / chartData.length) * 0.25}
                    />
                  ))}
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#006D42"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ fill: '#006D42', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#006D42' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Mini stats below chart */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 mt-6 pt-6 border-t border-outline-variant/15">
            {[
              { label: 'Avg Monthly', value: (total12m / 12).toFixed(2) + ' PLN' },
              { label: 'Peak Month', value: Math.max(...chartData.map(d => d.value)).toFixed(2) + ' PLN' },
              { label: 'Total 12M', value: total12m.toFixed(2) + ' PLN' },
              { label: 'Active Subs', value: subs.filter(s => s.status === 'active').length.toString() },
            ].map((s, i) => (
              <div key={s.label} className={clsx('px-6', i > 0 && 'border-l border-outline-variant/15')}>
                <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">{s.label}</div>
                <div className="font-label font-bold text-lg tabular-nums text-on-surface">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenarios + Quarterly Table */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6 animate-fade-up delay-200">
          {/* Scenarios */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-6 flex flex-col">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Modeling</div>
            <div className="font-headline font-semibold text-base tracking-tight text-on-surface mb-6">Scenario Modifiers</div>
            <div className="space-y-5 flex-1">
              {scenarios.map(s => (
                <button key={s.id} onClick={() => toggleScenario(s.id)} className="w-full flex items-start gap-3 text-left group">
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
            <div className="mt-6 pt-4 border-t border-outline-variant/15">
              <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Active Modifiers</div>
              <div className="font-label font-bold text-lg tabular-nums text-on-surface">
                {scenarios.filter(s => s.checked).length} / {scenarios.length}
              </div>
            </div>
          </div>

          {/* Quarterly table */}
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-6">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Raw Output</div>
            <div className="font-headline font-semibold text-base tracking-tight text-on-surface mb-6">Quarterly Breakdown</div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/15">
                  {['Quarter', 'Period', 'Projected', 'Cumulative', 'Delta'].map(h => (
                    <th key={h} className="text-left py-2 px-3 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quarters.map(({ q, months, idx }, qi) => {
                  const proj = idx.reduce((a, i) => a + (monthlyData[i]?.value ?? 0), 0)
                  const cumVal = chartData[idx[2]]?.cumulative ?? 0
                  const prevCum = qi === 0 ? 0 : (chartData[quarters[qi - 1].idx[2]]?.cumulative ?? 0)
                  const delta = qi === 0 ? null : ((cumVal - prevCum) / Math.abs(prevCum || 1)) * 100
                  return (
                    <tr key={q} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-3 font-label font-bold text-sm text-on-surface">{q}</td>
                      <td className="py-3 px-3 font-label text-sm text-on-surface-variant">{months}</td>
                      <td className="py-3 px-3 font-label text-sm tabular-nums text-on-surface">{proj.toFixed(2)}</td>
                      <td className={clsx('py-3 px-3 font-label text-sm tabular-nums font-semibold', qi === 3 ? 'text-on-surface' : 'text-on-surface')}>{cumVal.toFixed(2)}</td>
                      <td className="py-3 px-3">
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

        {/* Category Pie */}
        <div className="bg-surface-container-low border border-outline-variant/10 p-8 animate-fade-up delay-300">
          <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Distribution</div>
          <div className="font-headline font-semibold text-lg tracking-tight text-on-surface mb-6">Category Allocation</div>
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 lg:gap-8 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" stroke="none">
                    {catData.map((entry, i) => (
                      <Cell key={i} fill={CAT_COLORS[entry.name] ?? '#9CA3AF'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #C6C6C6', borderRadius: 0, fontFamily: 'Space Grotesk', fontSize: 11 }}
                    formatter={(v: number) => [`${v.toFixed(2)} PLN`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {catData.map(({ name, value }) => {
                const total = catData.reduce((a, c) => a + c.value, 0)
                const pct = total > 0 ? (value / total * 100) : 0
                return (
                  <div key={name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="w-2.5 h-2.5 flex-shrink-0" style={{ background: CAT_COLORS[name] ?? '#9CA3AF' }} />
                      <span className="font-label text-sm text-on-surface">{name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-1 bg-surface-container overflow-hidden">
                        <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: CAT_COLORS[name] ?? '#9CA3AF' }} />
                      </div>
                      <span className="font-label text-xs tabular-nums text-on-surface-variant w-10 text-right">{pct.toFixed(0)}%</span>
                      <span className="font-label text-sm tabular-nums text-on-surface w-28 text-right">{value.toFixed(2)} PLN</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
