'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { useAuth } from '@/app/lib/AuthContext'
import AppLayout from '@/app/components/AppLayout'
import Link from 'next/link'
import clsx from 'clsx'

const CATEGORIES = ['Entertainment', 'Cloud/Hosting', 'Dev Tools', 'Development', 'Utilities', 'Productivity', 'Other']

interface FormState {
  name: string
  category: string
  cost: string
  currency: string
  billing_cycle: 'monthly' | 'yearly'
  next_billing_date: string
  status: 'active' | 'paused'
  notes: string
  website: string
}

const INITIAL: FormState = {
  name: '',
  category: 'Entertainment',
  cost: '',
  currency: 'PLN',
  billing_cycle: 'monthly',
  next_billing_date: '',
  status: 'active',
  notes: '',
  website: '',
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">{children}</label>
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        'w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm',
        'placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors',
        className
      )}
    />
  )
}

function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        'w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm',
        'focus:outline-none focus:border-primary transition-colors cursor-pointer',
        className
      )}
    >
      {children}
    </select>
  )
}

export default function NewSubscriptionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  function set(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function validate() {
    const errs: typeof errors = {}
    if (!form.name.trim()) errs.name = 'Service name is required'
    if (!form.cost || isNaN(parseFloat(form.cost)) || parseFloat(form.cost) <= 0) errs.cost = 'Valid cost required'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    const { error } = await supabase.from('subscriptions').insert({
      name: form.name.trim(),
      category: form.category,
      cost: parseFloat(form.cost),
      currency: form.currency,
      billing_cycle: form.billing_cycle,
      next_billing_date: form.next_billing_date || null,
      status: form.status,
      notes: form.notes || null,
      website: form.website || null,
      user_id: user!.id,
    })
    setSaving(false)
    if (!error) router.push('/subscriptions')
  }

  const monthlyCost = form.billing_cycle === 'yearly'
    ? (parseFloat(form.cost) || 0) / 12
    : parseFloat(form.cost) || 0
  const annualCost = form.billing_cycle === 'monthly'
    ? (parseFloat(form.cost) || 0) * 12
    : parseFloat(form.cost) || 0

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 lg:py-10 animate-fade-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <Link href="/subscriptions" className="font-label text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Subscriptions
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="font-label text-xs text-on-surface">New Entry</span>
        </div>

        <div className="mb-8">
          <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface">Initialize Protocol</h1>
          <p className="font-label text-sm text-on-surface-variant mt-1">Add a new subscription to your financial ledger.</p>
        </div>

        {/* Cost preview */}
        {parseFloat(form.cost) > 0 && (
          <div className="bg-surface-container-low border border-outline-variant/15 p-6 mb-8 flex gap-8 animate-fade-in">
            <div>
              <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Monthly</div>
              <div className="font-label font-bold text-2xl tabular-nums text-on-surface">{monthlyCost.toFixed(2)} <span className="text-sm font-normal text-on-surface-variant">{form.currency}</span></div>
            </div>
            <div className="w-px bg-outline-variant/20" />
            <div>
              <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Annual</div>
              <div className="font-label font-bold text-2xl tabular-nums text-on-surface">{annualCost.toFixed(2)} <span className="text-sm font-normal text-on-surface-variant">{form.currency}</span></div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          <div>
            <FieldLabel>Service Name</FieldLabel>
            <Input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Netflix, AWS, GitHub Copilot"
              autoFocus
            />
            {errors.name && <p className="font-label text-xs text-tertiary mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Cost</FieldLabel>
              <div className="relative">
                <Input
                  type="number"
                  value={form.cost}
                  onChange={e => set('cost', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label text-xs text-on-surface-variant">{form.currency}</span>
              </div>
              {errors.cost && <p className="font-label text-xs text-tertiary mt-1">{errors.cost}</p>}
            </div>
            <div>
              <FieldLabel>Currency</FieldLabel>
              <Select value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option value="PLN">PLN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Billing Cycle</FieldLabel>
              <div className="flex">
                {(['monthly', 'yearly'] as const).map(cycle => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => set('billing_cycle', cycle)}
                    className={clsx(
                      'flex-1 py-3 font-label text-xs uppercase tracking-wider border transition-all',
                      form.billing_cycle === cycle
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-on-surface'
                    )}
                  >
                    {cycle}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Next Billing Date</FieldLabel>
              <Input
                type="date"
                value={form.next_billing_date}
                onChange={e => set('next_billing_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Category</FieldLabel>
              <Select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <div className="flex">
                {(['active', 'paused'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('status', s)}
                    className={clsx(
                      'flex-1 py-3 font-label text-xs uppercase tracking-wider border transition-all',
                      form.status === s
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-on-surface'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <FieldLabel>Website (optional)</FieldLabel>
            <Input
              type="url"
              value={form.website}
              onChange={e => set('website', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <FieldLabel>Notes (optional)</FieldLabel>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any additional context..."
              rows={3}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-primary text-white font-label font-bold text-xs uppercase tracking-widest py-3.5 hover:bg-on-surface transition-colors disabled:opacity-50"
            >
              {saving ? 'Injecting...' : '{ } Inject Record'}
            </button>
            <Link
              href="/subscriptions"
              className="px-6 py-3.5 border border-outline-variant/30 font-label text-xs uppercase tracking-wider text-on-surface-variant hover:border-primary hover:text-on-surface transition-all"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
