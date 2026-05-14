'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient, Subscription } from '@/app/lib/supabase'
const supabase = getSupabaseBrowserClient()
import AppLayout from '@/app/components/AppLayout'
import clsx from 'clsx'

const CATEGORIES = ['Entertainment', 'Cloud/Hosting', 'Dev Tools', 'Utilities', 'Productivity', 'Development', 'Other']
const CURRENCIES = ['PLN', 'USD', 'EUR', 'GBP']

interface SubscriptionFormProps {
  initial?: Partial<Subscription>
  id?: string
}

export default function SubscriptionForm({ initial, id }: SubscriptionFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [customCurrency, setCustomCurrency] = useState(!CURRENCIES.includes(initial?.currency ?? 'PLN'))
  const [customCurrencyValue, setCustomCurrencyValue] = useState(
    !CURRENCIES.includes(initial?.currency ?? 'PLN') ? (initial?.currency ?? '') : ''
  )

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    category: initial?.category ?? 'Other',
    cost: initial?.cost?.toString() ?? '',
    currency: initial?.currency ?? 'PLN',
    billing_cycle: initial?.billing_cycle ?? 'monthly',
    next_billing_date: initial?.next_billing_date ?? '',
    status: initial?.status ?? 'active',
    description: initial?.description ?? '',
    website: initial?.website ?? '',
    notes: initial?.notes ?? '',
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Service name is required'
    const cost = parseFloat(form.cost)
    if (isNaN(cost) || cost <= 0) e.cost = 'Enter a valid positive amount'
    setErrors(e)
    return Object.keys(e).length === 0
  }

   async function handleSubmit() {
     if (!validate()) return
     setSaving(true)

     const payload = {
       name: form.name.trim().toUpperCase(),
       category: form.category,
       cost: parseFloat(form.cost),
       currency: form.currency,
       billing_cycle: form.billing_cycle as 'weekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly',
       next_billing_date: form.next_billing_date || null,
       status: form.status as Subscription['status'],
       description: form.description || null,
       website: form.website || null,
       notes: form.notes || null,
     }

     if (id) {
       const { error } = await supabase.from('subscriptions').update(payload).eq('id', id)
       if (error) {
         alert(`Error saving: ${error.message}`)
         setSaving(false)
         return
       }
     } else {
       const { error } = await supabase.from('subscriptions').insert(payload)
       if (error) {
         alert(`Error creating: ${error.message}`)
         setSaving(false)
         return
       }
     }

     setSaving(false)
     router.push('/subscriptions')
     router.refresh()
   }

  const inputClass = (field: string) => clsx(
    'w-full px-4 py-3 bg-surface-container-low border font-label text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none transition-colors',
    errors[field] ? 'border-tertiary/60 focus:border-tertiary' : 'border-outline-variant/30 focus:border-primary'
  )

  const labelClass = 'font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block'

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="font-headline font-bold text-2xl tracking-tight text-on-surface">
            {id ? 'Edit Subscription' : 'New Subscription'}
          </h1>
          <p className="font-label text-sm text-on-surface-variant mt-1">
            {id ? 'Update the details for this subscription.' : 'Add a new recurring subscription to your ledger.'}
          </p>
        </div>

        <div className="space-y-6 animate-fade-up delay-75">
          {/* Name */}
          <div>
            <label className={labelClass}>Service Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Netflix, AWS, Figma..."
              className={inputClass('name')}
            />
            {errors.name && <p className="font-label text-xs text-tertiary mt-1">{errors.name}</p>}
          </div>

          {/* Cost + Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cost *</label>
              <input
                type="number"
                value={form.cost}
                onChange={e => set('cost', e.target.value)}
                placeholder="0.00"
                step="0.01"
                className={inputClass('cost')}
              />
              {errors.cost && <p className="font-label text-xs text-tertiary mt-1">{errors.cost}</p>}
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                {CURRENCIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { set('currency', c); setCustomCurrency(false) }}
                    className={clsx(
                      'py-3 font-label text-xs uppercase tracking-wider border transition-all',
                      !customCurrency && form.currency === c
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-on-surface'
                    )}
                  >
                    {c}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setCustomCurrency(true); set('currency', customCurrencyValue || '') }}
                  className={clsx(
                    'py-3 font-label text-xs uppercase tracking-wider border transition-all',
                    customCurrency
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-on-surface'
                  )}
                >
                  Other
                </button>
              </div>
              <div className={clsx('expand-wrapper', customCurrency && 'open')}>
                <div className="expand-inner">
                  <input
                    type="text"
                    value={customCurrencyValue}
                    onChange={e => {
                      const v = e.target.value.toUpperCase().slice(0, 5)
                      setCustomCurrencyValue(v)
                      set('currency', v)
                    }}
                    placeholder="e.g. CHF, JPY"
                    maxLength={5}
                    autoFocus={customCurrency}
                    tabIndex={customCurrency ? 0 : -1}
                    className={clsx(inputClass('currency'), 'mt-2')}
                  />
                </div>
              </div>
            </div>
          </div>

           {/* Category + Billing Cycle */}
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className={labelClass}>Category</label>
               <select value={form.category} onChange={e => set('category', e.target.value)} className={inputClass('category')}>
                 {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
             <div>
               <label className={labelClass}>Billing Cycle</label>
               <select value={form.billing_cycle} onChange={e => set('billing_cycle', e.target.value)} className={inputClass('billing_cycle')}>
                 <option value="weekly">Weekly</option>
                 <option value="monthly">Monthly</option>
                 <option value="quarterly">Every 3 Months</option>
                 <option value="half-yearly">Every 6 Months</option>
                 <option value="yearly">Yearly</option>
               </select>
             </div>
           </div>

          {/* Next billing date + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Next Billing Date</label>
              <input
                type="date"
                value={form.next_billing_date}
                onChange={e => set('next_billing_date', e.target.value)}
                className={inputClass('next_billing_date')}
              />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={inputClass('status')}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Brief description..."
              className={inputClass('description')}
            />
          </div>

          {/* Website */}
          <div>
            <label className={labelClass}>Website</label>
            <input
              type="url"
              value={form.website}
              onChange={e => set('website', e.target.value)}
              placeholder="https://..."
              className={inputClass('website')}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className={clsx(inputClass('notes'), 'resize-none')}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white font-label font-bold text-xs uppercase tracking-widest px-6 py-3 hover:bg-on-surface transition-colors disabled:opacity-50"
            >
              {saving && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
              {id ? 'Save Changes' : 'Add Subscription'}
            </button>
            <button
              onClick={() => router.back()}
              className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
