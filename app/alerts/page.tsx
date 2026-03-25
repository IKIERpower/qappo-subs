'use client'

import { useEffect, useState } from 'react'
import { supabase, Alert } from '@/app/lib/supabase'
import { useAuth } from '@/app/lib/AuthContext'
import AppLayout from '@/app/components/AppLayout'
import clsx from 'clsx'

const ALERT_ICONS: Record<string, string> = {
  renewal: 'event_upcoming',
  budget: 'account_balance_wallet',
  duplicate: 'content_copy',
}
const ALERT_ACCENT: Record<string, string> = {
  renewal: 'text-secondary border-outline-variant/20 bg-surface-container',
  budget: 'text-tertiary border-outline-variant/20 bg-surface-container',
  duplicate: 'text-on-surface-variant border-outline-variant/20 bg-surface-container',
}

const DEFAULT_ALERTS = [
  { type: 'renewal', threshold_value: 7, threshold_unit: 'days', enabled: true, label: 'Renewal Reminder', description: 'Alert 7 days before any subscription renews' },
  { type: 'budget', threshold_value: 500, threshold_unit: 'PLN', enabled: true, label: 'Monthly Budget Cap', description: 'Alert when monthly spend exceeds threshold' },
  { type: 'duplicate', threshold_value: 24, threshold_unit: 'hours', enabled: false, label: 'Duplicate Charge', description: 'Alert for identical charges within window' },
]

export default function AlertsPage() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [seedLoading, setSeedLoading] = useState(false)

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at')
    setAlerts(data ?? [])
    setLoading(false)
  }

  async function seedAlerts() {
    setSeedLoading(true)
    for (const a of DEFAULT_ALERTS) {
      await supabase.from('alerts').insert({ ...a, user_id: user?.id })
    }
    await load()
    setSeedLoading(false)
  }

  async function toggleAlert(id: string, enabled: boolean) {
    setSaving(id)
    await supabase.from('alerts').update({ enabled }).eq('id', id)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled } : a))
    setSaving(null)
  }

  async function saveThreshold(id: string) {
    const val = parseFloat(editValue)
    if (isNaN(val)) return
    await supabase.from('alerts').update({ threshold_value: val }).eq('id', id)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, threshold_value: val } : a))
    setEditingId(null)
  }

  async function deleteAlert(id: string) {
    await supabase.from('alerts').delete().eq('id', id)
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const activeCount = alerts.filter(a => a.enabled).length

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6 lg:space-y-10">

        {/* Header */}
        <div className="flex items-start justify-between animate-fade-up">
          <div>
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Notification Layer</div>
            <h1 className="font-headline font-bold text-3xl tracking-tighter text-on-surface">Alert Configuration</h1>
            <p className="font-label text-sm text-on-surface-variant mt-1">Define granular thresholds for subscription renewals and budget overflows.</p>
          </div>
          <div className="text-right">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Active Alerts</div>
            <div className="font-label font-bold text-3xl tabular-nums text-on-surface">{activeCount}</div>
          </div>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-4 bg-surface-container-low border border-outline-variant/10 px-6 py-4 animate-fade-up delay-75">
          <div className="flex items-center gap-2">
            <span className={clsx('w-2 h-2 rounded-full animate-pulse-soft', activeCount > 0 ? 'bg-secondary' : 'bg-outline-variant')} />
            <span className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface">
              {activeCount > 0 ? 'Global Alerts Enabled' : 'All Alerts Disabled'}
            </span>
          </div>
          <span className="font-label text-xs text-on-surface-variant">
            {activeCount} of {alerts.length} rules active &middot; SMTP responding within 42ms
          </span>
        </div>

        {/* Alerts list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-surface-container-low animate-pulse" />)}
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-surface-container-low border border-outline-variant/10 p-12 text-center animate-fade-up">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-4 block">notifications_off</span>
            <p className="font-headline font-semibold text-base text-on-surface mb-1">No alerts configured</p>
            <p className="font-label text-sm text-on-surface-variant mb-6">Run the seed to add default alert rules to your ledger.</p>
            <button
              onClick={seedAlerts}
              disabled={seedLoading}
              className="bg-primary text-white font-label font-bold text-xs uppercase tracking-widest px-6 py-3 hover:bg-on-surface transition-colors disabled:opacity-50"
            >
              {seedLoading ? 'Seeding...' : 'Seed Default Alerts'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, i) => {
              const accent = ALERT_ACCENT[alert.type] ?? ALERT_ACCENT.duplicate
              const icon = ALERT_ICONS[alert.type] ?? 'notifications'
              const isEditing = editingId === alert.id
              return (
                <div
                  key={alert.id}
                  className={clsx(
                    'bg-surface-container-lowest border p-6 transition-all duration-200 animate-fade-up',
                    alert.enabled ? 'border-outline-variant/15 hover:border-outline-variant/30' : 'border-outline-variant/10 opacity-60'
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={clsx('w-9 h-9 border flex items-center justify-center flex-shrink-0', accent)}>
                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-headline font-semibold text-sm text-on-surface">{alert.label}</span>
                          <span className={clsx('font-label text-[9px] uppercase tracking-widest px-1.5 py-0.5 border', accent)}>
                            {alert.type}
                          </span>
                        </div>
                        <p className="font-label text-xs text-on-surface-variant mb-3">{alert.description}</p>

                        {/* Threshold */}
                        <div className="flex items-center gap-2">
                          <span className="font-label text-xs text-on-surface-variant">Threshold:</span>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                className="w-20 px-2 py-1 bg-surface-container-low border border-primary font-label text-sm tabular-nums text-on-surface focus:outline-none"
                                autoFocus
                                onKeyDown={e => { if (e.key === 'Enter') saveThreshold(alert.id); if (e.key === 'Escape') setEditingId(null) }}
                              />
                              <span className="font-label text-xs text-on-surface-variant">{alert.threshold_unit}</span>
                              <button onClick={() => saveThreshold(alert.id)} className="font-label text-[10px] uppercase tracking-wider text-secondary hover:text-secondary/80 transition-colors">Save</button>
                              <button onClick={() => setEditingId(null)} className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingId(alert.id); setEditValue(String(alert.threshold_value)) }}
                              className="flex items-center gap-1 font-label text-sm font-semibold tabular-nums text-on-surface hover:text-primary transition-colors group"
                            >
                              {alert.threshold_value} {alert.threshold_unit}
                              <span className="material-symbols-outlined text-[13px] text-on-surface-variant group-hover:text-primary transition-colors">edit</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => toggleAlert(alert.id, !alert.enabled)}
                        disabled={saving === alert.id}
                        className={clsx(
                          'relative w-10 h-5 transition-all duration-200 focus:outline-none',
                          alert.enabled ? 'bg-primary' : 'bg-surface-container-highest'
                        )}
                      >
                        <span className={clsx(
                          'absolute top-0.5 w-4 h-4 bg-white transition-all duration-200',
                          alert.enabled ? 'left-5' : 'left-0.5'
                        )} />
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="font-label text-[10px] text-on-surface-variant hover:text-tertiary transition-colors uppercase tracking-wider"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add new alert */}
        {alerts.length > 0 && (
          <div className="animate-fade-up delay-300">
            <AddAlertForm onAdded={load} userId={user!.id} />
          </div>
        )}

      </div>
    </AppLayout>
  )
}

function AddAlertForm({ onAdded, userId }: { onAdded: () => void, userId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: 'renewal', label: '', description: '', threshold_value: '', threshold_unit: 'days' })
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!form.label.trim() || !form.threshold_value) return
    setSaving(true)
    await supabase.from('alerts').insert({
      type: form.type,
      label: form.label,
      description: form.description,
      threshold_value: parseFloat(form.threshold_value),
      threshold_unit: form.threshold_unit,
      enabled: true,
      user_id: userId,
    })
    setSaving(false)
    setOpen(false)
    setForm({ type: 'renewal', label: '', description: '', threshold_value: '', threshold_unit: 'days' })
    onAdded()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-outline-variant/30 font-label text-xs uppercase tracking-widest text-on-surface-variant hover:border-primary hover:text-primary transition-all">
        <span className="material-symbols-outlined text-[16px]">add</span>
        Add Alert Rule
      </button>
    )
  }

  return (
    <div className="bg-surface-container-low border border-primary/20 p-6 space-y-4 animate-fade-in">
      <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-4">New Alert Rule</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Type</label>
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
            className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant/30 font-label text-sm text-on-surface focus:outline-none focus:border-primary transition-colors">
            <option value="renewal">Renewal</option>
            <option value="budget">Budget</option>
            <option value="duplicate">Duplicate</option>
          </select>
        </div>
        <div>
          <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Label</label>
          <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Alert name..."
            className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant/30 font-label text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div>
          <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Threshold Value</label>
          <input type="number" value={form.threshold_value} onChange={e => setForm(p => ({ ...p, threshold_value: e.target.value }))}
            className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant/30 font-label text-sm text-on-surface focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div>
          <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Unit</label>
          <select value={form.threshold_unit} onChange={e => setForm(p => ({ ...p, threshold_unit: e.target.value }))}
            className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant/30 font-label text-sm text-on-surface focus:outline-none focus:border-primary transition-colors">
            <option value="days">days</option>
            <option value="PLN">PLN</option>
            <option value="hours">hours</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={handleAdd} disabled={saving}
          className="bg-primary text-white font-label font-bold text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-on-surface transition-colors disabled:opacity-50">
          {saving ? 'Adding...' : 'Add Rule'}
        </button>
        <button onClick={() => setOpen(false)}
          className="px-5 py-2.5 border border-outline-variant/30 font-label text-xs uppercase tracking-wider text-on-surface-variant hover:border-primary hover:text-on-surface transition-all">
          Cancel
        </button>
      </div>
    </div>
  )
}
