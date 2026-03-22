'use client'

import { useEffect, useState } from 'react'
import { supabase, Subscription } from '@/app/lib/supabase'
import { useAuth } from '@/app/lib/AuthContext'
import AppLayout from '@/app/components/AppLayout'
import Link from 'next/link'
import clsx from 'clsx'

const STATUS_COLORS = {
  active: { bg: 'bg-secondary/10', text: 'text-secondary', dot: 'bg-secondary', label: 'Active' },
  paused: { bg: 'bg-outline-variant/20', text: 'text-on-surface-variant', dot: 'bg-outline-variant', label: 'Paused' },
  cancelled: { bg: 'bg-tertiary/10', text: 'text-tertiary', dot: 'bg-tertiary', label: 'Cancelled' },
}

function monthlyEquivalent(sub: Subscription): number {
  if (sub.status !== 'active') return 0
  if (sub.billing_cycle === 'yearly') return sub.cost / 12
  return sub.cost
}

export default function SubscriptionsPage() {
  const { user } = useAuth()
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [sortCol, setSortCol] = useState<'name' | 'cost' | 'next_billing_date' | 'category'>('name')
  const [sortDir, setSortDir] = useState<1 | -1>(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    setSubs(data ?? [])
    setLoading(false)
  }

  function handleSort(col: typeof sortCol) {
    if (sortCol === col) setSortDir(d => (d === 1 ? -1 : 1))
    else { setSortCol(col); setSortDir(1) }
  }

  async function updateStatus(id: string, status: Subscription['status']) {
    await supabase.from('subscriptions').update({ status }).eq('id', id)
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  async function deleteSub(id: string) {
    setDeletingId(id)
    await supabase.from('subscriptions').delete().eq('id', id)
    setSubs(prev => prev.filter(s => s.id !== id))
    setDeletingId(null)
  }

  const categories = [...new Set(subs.map(s => s.category))].sort()

  const filtered = subs
    .filter(s => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.category.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus && s.status !== filterStatus) return false
      if (filterCategory && s.category !== filterCategory) return false
      return true
    })
    .sort((a, b) => {
      let va: string | number = a[sortCol] ?? ''
      let vb: string | number = b[sortCol] ?? ''
      if (sortCol === 'cost') { va = a.cost; vb = b.cost }
      if (va < vb) return -sortDir
      if (va > vb) return sortDir
      return 0
    })

  const activeBurn = filtered.filter(s => s.status === 'active').reduce((a, s) => a + monthlyEquivalent(s), 0)

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="px-4 lg:px-8 py-3 lg:py-4 border-b border-outline-variant/15 bg-surface-container-lowest flex flex-wrap items-center gap-2 lg:gap-4 flex-shrink-0">
          <div className="relative flex items-center flex-1 min-w-[160px] max-w-xs">
            <span className="material-symbols-outlined absolute left-3 text-[16px] text-on-surface-variant pointer-events-none">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/20 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-outline-variant/20 text-on-surface font-label text-xs uppercase tracking-wide focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-outline-variant/20 text-on-surface font-label text-xs uppercase tracking-wide focus:outline-none focus:border-primary transition-colors cursor-pointer hidden sm:block"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="ml-auto font-label text-xs text-on-surface-variant whitespace-nowrap">
            <span className="tabular-nums">{filtered.length}</span> entries &middot; burn{' '}
            <span className="tabular-nums text-on-surface font-semibold">{activeBurn.toFixed(2)} PLN/mo</span>
          </div>
        </div>

        {/* Table / Cards */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-4 lg:p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-surface-container-low animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center font-label text-sm text-on-surface-variant">
              No subscriptions found.
            </div>
          ) : (
            <>
              {/* ── MOBILE CARDS (hidden on lg+) ── */}
              <div className="lg:hidden divide-y divide-outline-variant/10">
                {filtered.map((sub, i) => {
                  const sc = STATUS_COLORS[sub.status] ?? STATUS_COLORS.active
                  const isExpanded = expandedId === sub.id
                  const monthly = monthlyEquivalent(sub)
                  return (
                    <div
                      key={sub.id}
                      className={clsx(
                        'animate-fade-up',
                        sub.status === 'cancelled' && 'opacity-50'
                      )}
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors"
                      >
                        <div className="w-8 h-8 bg-surface-container flex items-center justify-center font-label font-bold text-[10px] text-on-surface-variant flex-shrink-0">
                          {sub.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-headline font-semibold text-sm text-on-surface truncate">{sub.name}</div>
                          <div className="font-label text-[10px] uppercase tracking-wide text-on-surface-variant">{sub.category}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-label font-bold text-sm tabular-nums text-on-surface">{sub.cost.toFixed(2)} <span className="font-normal text-on-surface-variant text-xs">{sub.currency}</span></div>
                          <div className={clsx('font-label text-[10px] font-semibold uppercase tracking-wider', sc.text)}>{sc.label}</div>
                        </div>
                        <span className={clsx('material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200 flex-shrink-0 ml-1', isExpanded && 'rotate-180')}>expand_more</span>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 bg-surface-container-low animate-fade-in space-y-3">
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-outline-variant/10">
                            <div>
                              <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-0.5">Monthly</div>
                              <div className="font-label font-bold tabular-nums text-on-surface">{monthly.toFixed(2)} PLN</div>
                            </div>
                            <div>
                              <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-0.5">Next Renewal</div>
                              <div className="font-label text-sm tabular-nums text-on-surface">{sub.next_billing_date ?? '—'}</div>
                            </div>
                            <div>
                              <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-0.5">Annual</div>
                              <div className="font-label font-bold tabular-nums text-on-surface">{(sub.billing_cycle === 'yearly' ? sub.cost : sub.cost * 12).toFixed(2)} PLN</div>
                            </div>
                            <div>
                              <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-0.5">Cycle</div>
                              <div className="font-label text-sm text-on-surface uppercase">{sub.billing_cycle}</div>
                            </div>
                          </div>
                          {sub.notes && <p className="font-label text-xs text-on-surface-variant">{sub.notes}</p>}
                          <div className="flex gap-2 pt-1">
                            {sub.status !== 'cancelled' && (
                              <button
                                onClick={() => updateStatus(sub.id, sub.status === 'active' ? 'paused' : 'active')}
                                className="flex-1 font-label text-xs uppercase tracking-wider py-2 border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all"
                              >
                                {sub.status === 'active' ? 'Pause' : 'Reactivate'}
                              </button>
                            )}
                            <Link
                              href={`/subscriptions/${sub.id}/edit`}
                              className="flex-1 text-center font-label text-xs uppercase tracking-wider py-2 border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => deleteSub(sub.id)}
                              disabled={deletingId === sub.id}
                              className="flex-1 font-label text-xs uppercase tracking-wider py-2 border border-tertiary/30 text-tertiary hover:border-tertiary hover:bg-tertiary/5 transition-all disabled:opacity-40"
                            >
                              {deletingId === sub.id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ── DESKTOP TABLE (hidden on mobile) ── */}
              <table className="hidden lg:table w-full border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/15">
                    {[
                      { col: 'name', label: 'Service' },
                      { col: 'category', label: 'Category' },
                      { col: 'cost', label: 'Cost' },
                      { col: 'next_billing_date', label: 'Next Renewal' },
                    ].map(({ col, label }) => (
                      <th
                        key={col}
                        onClick={() => handleSort(col as typeof sortCol)}
                        className={clsx(
                          'text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest cursor-pointer select-none transition-colors',
                          sortCol === col ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
                        )}
                      >
                        {label}
                        {sortCol === col && <span className="ml-1">{sortDir === 1 ? '↑' : '↓'}</span>}
                      </th>
                    ))}
                    <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Status</th>
                    <th className="px-6 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub, i) => {
                    const sc = STATUS_COLORS[sub.status] ?? STATUS_COLORS.active
                    const isExpanded = expandedId === sub.id
                    const monthly = monthlyEquivalent(sub)
                    return (
                      <>
                        <tr
                          key={sub.id}
                          onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                          className={clsx(
                            'border-b border-outline-variant/10 cursor-pointer transition-all duration-150 group animate-fade-up',
                            isExpanded ? 'bg-surface-container-low' : 'bg-surface-container-lowest hover:bg-surface-container-low',
                            sub.status === 'cancelled' && 'opacity-50'
                          )}
                          style={{ animationDelay: `${i * 30}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 bg-surface-container flex items-center justify-center font-label font-bold text-[10px] text-on-surface-variant flex-shrink-0">
                                {sub.name.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-headline font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">{sub.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-label text-xs text-on-surface-variant uppercase tracking-wide">{sub.category}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-label font-semibold text-sm tabular-nums text-on-surface">
                              {sub.cost.toFixed(2)} <span className="text-on-surface-variant font-normal">{sub.currency}</span>
                            </div>
                            <div className="font-label text-[10px] text-on-surface-variant uppercase">{sub.billing_cycle}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-label text-sm tabular-nums text-on-surface-variant">
                              {sub.next_billing_date ?? '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={clsx('inline-flex items-center gap-1.5 px-2 py-1', sc.bg)}>
                              <span className={clsx('w-1.5 h-1.5 rounded-full', sc.dot)} />
                              <span className={clsx('font-label text-[10px] font-semibold uppercase tracking-wider', sc.text)}>{sc.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={clsx('material-symbols-outlined text-[16px] text-on-surface-variant transition-transform duration-200', isExpanded && 'rotate-180')}>
                              expand_more
                            </span>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr key={`${sub.id}-expanded`} className="bg-surface-container-low animate-fade-in">
                            <td colSpan={6} className="px-6 pb-5 pt-0">
                              <div className="flex items-start justify-between pt-4 border-t border-outline-variant/10">
                                <div className="grid grid-cols-3 gap-8">
                                  <div>
                                    <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Monthly Equiv.</div>
                                    <div className="font-label font-bold text-lg tabular-nums text-on-surface">{monthly.toFixed(2)} PLN</div>
                                  </div>
                                  <div>
                                    <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Annual Cost</div>
                                    <div className="font-label font-bold text-lg tabular-nums text-on-surface">{(sub.billing_cycle === 'yearly' ? sub.cost : sub.cost * 12).toFixed(2)} PLN</div>
                                  </div>
                                  {sub.notes && (
                                    <div>
                                      <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Notes</div>
                                      <div className="font-label text-sm text-on-surface">{sub.notes}</div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  {sub.status !== 'cancelled' && (
                                    <button
                                      onClick={e => { e.stopPropagation(); updateStatus(sub.id, sub.status === 'active' ? 'paused' : 'active') }}
                                      className="font-label text-xs uppercase tracking-wider px-3 py-1.5 border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all"
                                    >
                                      {sub.status === 'active' ? 'Pause' : 'Reactivate'}
                                    </button>
                                  )}
                                  <Link
                                    href={`/subscriptions/${sub.id}/edit`}
                                    onClick={e => e.stopPropagation()}
                                    className="font-label text-xs uppercase tracking-wider px-3 py-1.5 border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    onClick={e => { e.stopPropagation(); deleteSub(sub.id) }}
                                    disabled={deletingId === sub.id}
                                    className="font-label text-xs uppercase tracking-wider px-3 py-1.5 border border-tertiary/30 text-tertiary hover:border-tertiary hover:bg-tertiary/5 transition-all disabled:opacity-40"
                                  >
                                    {deletingId === sub.id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
