'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, Subscription } from '@/app/lib/supabase'
import AppLayout from '@/app/components/AppLayout'
import Link from 'next/link'
import clsx from 'clsx'

const CATEGORIES = ['Entertainment', 'Cloud/Hosting', 'Dev Tools', 'Development', 'Utilities', 'Productivity', 'Other']
const CURRENCIES = ['PLN', 'USD', 'EUR', 'GBP']

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
    const [customCurrency, setCustomCurrency] = useState(false)
    const [customCurrencyValue, setCustomCurrencyValue] = useState('')

    useEffect(() => {
        async function load() {
            const { data } = await supabase.from('subscriptions').select('*').eq('id', id).single()
            if (data) {
                setForm(data)
                if (!CURRENCIES.includes(data.currency)) {
                    setCustomCurrency(true)
                    setCustomCurrencyValue(data.currency)
                }
            }
            setLoading(false)
        }
        load()
    }, [id])

    function set(key: keyof Subscription, value: string | number) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    function normalizeUrl(url: string): string {
        if (!url) return ''
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`
        }
        return url
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
            website: form.website ? normalizeUrl(form.website) : null,
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
                            <div className="relative">
                                <Input type="number" value={form.cost ?? ''} onChange={e => set('cost', parseFloat(e.target.value))} step="0.01" className="pr-16" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label text-xs text-on-surface-variant">{form.currency ?? 'PLN'}</span>
                            </div>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Billing Cycle</FieldLabel>
                            <div className="flex gap-1">
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
                            <div className="flex gap-1">
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
                        <FieldLabel>Website (optional)</FieldLabel>
                        <div className="relative">
                            <Input type="url" value={form.website ?? ''} onChange={e => set('website', e.target.value)} placeholder="youtube.com" />
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
