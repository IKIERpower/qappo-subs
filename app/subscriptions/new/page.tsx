'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { useAuth } from '@/app/lib/AuthContext'
import AppLayout from '@/app/components/AppLayout'
import Link from 'next/link'
import clsx from 'clsx'

const CATEGORIES = ['Entertainment', 'Dev Tools', 'Development', 'Utilities', 'Productivity']
const CURRENCIES = ['PLN', 'USD', 'EUR', 'GBP']

interface FormState {
  name: string
  category: string
  cost: string
  currency: string
  billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
  next_billing_date: string
  status: 'active' | 'paused' | 'cancelled'
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

export default function NewSubscriptionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [customCurrency, setCustomCurrency] = useState(false)
  const [customCurrencyValue, setCustomCurrencyValue] = useState('')
  const [customCategory, setCustomCategory] = useState(false)
  const [customCategoryValue, setCustomCategoryValue] = useState('')

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

  // function normalizeUrl(url: string): string {
  //   if (!url) return ''
  //   if (!url.startsWith('http://') && !url.startsWith('https://')) {
  //     return `https://${url}`
  //   }
  //   return url
  // }

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
       // website: form.website ? normalizeUrl(form.website) : null,
       user_id: user!.id,
     })
     setSaving(false)
     if (error) {
       alert(`Error: ${error.message}`)
       return
     }
     router.push('/subscriptions')
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
          <span className="font-label text-xs text-on-surface">New Sub</span>
        </div>

        <div className="mb-8">
          <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface">New Sub</h1>
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
                    className="w-full mt-2 px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Billing Cycle</FieldLabel>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {(['weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly'] as const).map(cycle => {
                  const labels = {
                    weekly: 'Weekly',
                    monthly: 'Monthly',
                    quarterly: 'Every 3 Months',
                    'half-yearly': 'Every 6 Months',
                    yearly: 'Yearly'
                  }
                  return (
                    <button
                      key={cycle}
                      type="button"
                      onClick={(e) => { e.preventDefault(); set('billing_cycle', cycle); }}
                      className={clsx(
                        'py-2.5 px-1 font-label text-[9px] uppercase tracking-wider border transition-all text-center',
                        form.billing_cycle === cycle
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-on-surface'
                      )}
                    >
                      {labels[cycle]}
                    </button>
                  )
                })}
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

           <div>
             <FieldLabel>Category</FieldLabel>
             <div className="grid grid-cols-6 gap-1">
               {CATEGORIES.map(c => (
                 <button
                   key={c}
                   type="button"
                   onClick={() => { set('category', c); setCustomCategory(false) }}
                   className={clsx(
                     'py-2.5 px-1 font-label text-[9px] uppercase tracking-wider border transition-all text-center line-clamp-2',
                     !customCategory && form.category === c
                       ? 'bg-primary text-white border-primary'
                       : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-on-surface'
                   )}
                 >
                   {c}
                 </button>
               ))}
               <button
                 type="button"
                 onClick={() => { setCustomCategory(true); set('category', customCategoryValue || '') }}
                 className={clsx(
                   'py-2.5 px-1 font-label text-[9px] uppercase tracking-wider border transition-all text-center',
                   customCategory
                     ? 'bg-primary text-white border-primary'
                     : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-on-surface'
                 )}
               >
                 Other
               </button>
             </div>
             <div className={clsx('expand-wrapper', customCategory && 'open')}>
               <div className="expand-inner">
                 <input
                   type="text"
                   value={customCategoryValue}
                   onChange={e => {
                     const v = e.target.value.slice(0, 30)
                     setCustomCategoryValue(v)
                     set('category', v)
                   }}
                   placeholder="e.g. Gaming, Education"
                   maxLength={30}
                   autoFocus={customCategory}
                   tabIndex={customCategory ? 0 : -1}
                   className="w-full mt-2 px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                 />
               </div>
             </div>
           </div>

           <div>
             <FieldLabel>Status</FieldLabel>
             <div className="flex gap-1">
               {(['active', 'paused', 'cancelled'] as const).map(s => (
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

          <div>
            <FieldLabel>Website (optional)</FieldLabel>
            <div className="relative">
              <Input
                type="url"
                value={form.website}
                onChange={e => set('website', e.target.value)}
                placeholder="youtube.com"
              />
              {/*{form.website && (*/}
              {/*  <a*/}
              {/*    href={form.website}*/}
              {/*    target="_blank"*/}
              {/*    rel="noopener noreferrer"*/}
              {/*    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"*/}
              {/*  >*/}
              {/*    <span className="material-symbols-outlined text-[18px]">open_in_new</span>*/}
              {/*  </a>*/}
              {/*)}*/}
            </div>
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
