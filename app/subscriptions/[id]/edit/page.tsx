'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, Subscription } from '@/app/lib/supabase'
import AppLayout from '@/app/components/AppLayout'
import Link from 'next/link'
import clsx from 'clsx'

const CATEGORIES = ['Entertainment', 'Cloud/Hosting', 'Dev Tools', 'Development', 'Utilities', 'Productivity', 'Other']

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

export default function EditSubscriptionPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<Subscription>>({})

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('subscriptions').select('*').eq('id', id).single()
      if (data) setForm(data)
      setLoading(false)
    }
    load()
  }, [id])

  function set(key: keyof Subscription, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    setSaving(true)
    await supabase.from('subscriptions').update({
      name: form.name,
      category: form.category,
      cost: form.cost,
      currency: form.currency,
      billing_cycle: form.billing_cycle,
      next_billing_date: form.next_billing_date,
      status: form.status,
      notes: form.notes,
      website: form.website,
    }).eq('id', id)
    setSaving(false)
    router.push('/subscriptions')
  }

  if (loading) {
    return <AppLayout><div className="p-8 animate-pulse"><div className="h-96 bg-surface-container-low" /></div></AppLayout>
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 lg:py-10 animate-fade-up">
        <div className="flex items-center gap-3 mb-10">
          <Link href="/subscriptions" className="font-label text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Subscriptions
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="font-label text-xs text-on-surface">Edit</span>
        </div>

        <div className="mb-8">
          <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface">Edit Record</h1>
          <p className="font-label text-sm text-on-surface-variant mt-1">{form.name}</p>
        </div>

        <div className="space-y-6">
          <div>
            <FieldLabel>Service Name</FieldLabel>
            <Input value={form.name ?? ''} onChange={e => set('name', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Cost</FieldLabel>
              <Input type="number" value={form.cost ?? ''} onChange={e => set('cost', parseFloat(e.target.value))} step="0.01" />
            </div>
            <div>
              <FieldLabel>Currency</FieldLabel>
              <select
                value={form.currency ?? 'PLN'}
                onChange={e => set('currency', e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm focus:outline-none focus:border-primary transition-colors"
              >
                {['PLN', 'USD', 'EUR', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Billing Cycle</FieldLabel>
              <div className="flex">
                {(['monthly', 'yearly'] as const).map(cycle => (
                  <button key={cycle} type="button" onClick={() => set('billing_cycle', cycle)}
                    className={clsx('flex-1 py-3 font-label text-xs uppercase tracking-wider border transition-all',
                      form.billing_cycle === cycle ? 'bg-primary text-white border-primary' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary')}>
                    {cycle}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Next Billing Date</FieldLabel>
              <Input type="date" value={form.next_billing_date ?? ''} onChange={e => set('next_billing_date', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Category</FieldLabel>
              <select value={form.category ?? ''} onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm focus:outline-none focus:border-primary transition-colors">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <div className="flex">
                {(['active', 'paused', 'cancelled'] as const).map(s => (
                  <button key={s} type="button" onClick={() => set('status', s)}
                    className={clsx('flex-1 py-3 font-label text-[10px] uppercase tracking-wider border transition-all',
                      form.status === s ? 'bg-primary text-white border-primary' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <FieldLabel>Notes</FieldLabel>
            <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} rows={3}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 bg-primary text-white font-label font-bold text-xs uppercase tracking-widest py-3.5 hover:bg-on-surface transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/subscriptions"
              className="px-6 py-3.5 border border-outline-variant/30 font-label text-xs uppercase tracking-wider text-on-surface-variant hover:border-primary hover:text-on-surface transition-all">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
