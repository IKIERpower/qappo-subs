'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSupabaseBrowserClient, Subscription } from '@/app/lib/supabase'
const supabase = getSupabaseBrowserClient()
import { useLocale } from '@/app/lib/LocaleContext'
import AppLayout from '@/app/components/AppLayout'
import Link from 'next/link'
import clsx from 'clsx'
import CategoryDropdown from '@/app/components/CategoryDropdown'
import { motion, AnimatePresence } from 'framer-motion'

const CURRENCIES = ['PLN', 'USD', 'EUR']
const BILLING_CYCLES = [
    { value: 'weekly',      label: 'Weekly' },
    { value: 'monthly',     label: 'Monthly' },
    { value: 'quarterly',   label: 'Every 3 Mo.' },
    { value: 'half-yearly', label: 'Every 6 Mo.' },
    { value: 'yearly',      label: 'Yearly' },
] as const

// ── Shared UI atoms ──────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return (
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            {children}
        </span>
    )
}

function ToggleButton({ active, onClick, children, className }: {
    active: boolean; onClick: () => void; children: React.ReactNode; className?: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={clsx(
                'py-3 px-2 font-label text-[10px] uppercase tracking-wider border transition-all duration-200 text-center leading-tight h-full',
                active
                    ? 'bg-on-surface text-surface border-on-surface'
                    : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface',
                className
            )}
        >
            {children}
        </button>
    )
}

function FieldInput({ className, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
    return (
        <input
            {...props}
            className={clsx(
                'w-full px-4 py-3 bg-surface-container-low border text-on-surface font-label text-sm',
                'placeholder:text-on-surface-variant/50 focus:outline-none transition-colors duration-200',
                error ? 'border-tertiary' : 'border-outline-variant/30 focus:border-on-surface/40',
                className
            )}
        />
    )
}

function BillingCycleSlider({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const activeIndex = BILLING_CYCLES.findIndex(c => c.value === value)
    const idx = activeIndex === -1 ? 1 : activeIndex
    const percent = (idx / (BILLING_CYCLES.length - 1)) * 100

    return (
        <div className="space-y-4">
            <div className="relative pt-2 px-[10px]">
                <input
                    type="range" min="0" max={BILLING_CYCLES.length - 1} step="1" value={idx}
                    onChange={e => onChange(BILLING_CYCLES[parseInt(e.target.value)].value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="relative h-[2px] bg-outline-variant/20">
                    <div className="absolute h-full bg-on-surface transition-all duration-300 ease-out" style={{ width: `${percent}%` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-on-surface border-2 border-surface rounded-full shadow-md transition-all duration-300 ease-out -translate-x-1/2" style={{ left: `${percent}%` }} />
                </div>
            </div>
            <div className="grid grid-cols-5 w-full">
                {BILLING_CYCLES.map(cycle => (
                    <button
                        key={cycle.value} type="button" onClick={() => onChange(cycle.value)}
                        className={clsx(
                            'font-label text-[9px] uppercase tracking-wider transition-all duration-200 focus:outline-none text-center',
                            value === cycle.value ? 'text-on-surface font-bold' : 'text-on-surface-variant hover:text-on-surface'
                        )}
                    >
                        {cycle.label}
                    </button>
                ))}
            </div>
        </div>
    )
}


// ── Main component ────────────────────────────────────────────────────────────

export default function EditSubscriptionPage() {
    const { locale } = useLocale()
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<Partial<Subscription>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})
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
        setErrors(prev => ({ ...prev, [key]: '' }))
    }

    function normalizeUrl(url: string): string {
        if (!url) return ''
        return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
    }

    function validate() {
        const errs: Record<string, string> = {}
        if (!form.name?.trim()) errs.name = 'Service name is required'
        if (!form.cost || isNaN(Number(form.cost)) || Number(form.cost) <= 0) errs.cost = 'Valid cost required'
        return errs
    }

    async function handleSubmit() {
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }
        setSaving(true)
        const { error } = await supabase.from('subscriptions').update({
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
        if (error) { alert(`Error: ${error.message}`); return }
        router.push(`/${locale}/subscriptions`)
    }

    const costVal = Number(form.cost) || 0
    const cycleToMonthly: Record<string, number> = {
        weekly: 4.33, monthly: 1, quarterly: 1 / 3, 'half-yearly': 1 / 6, yearly: 1 / 12,
    }
    const monthly = costVal * (cycleToMonthly[form.billing_cycle ?? 'monthly'] ?? 1)
    const annual = monthly * 12

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 w-32 bg-surface-container-low" />
                        <div className="h-8 w-48 bg-surface-container-low" />
                        <div className="h-96 bg-surface-container-low" />
                    </div>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-fade-up">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-8">
                    <Link href={`/${locale}/subscriptions`} className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">arrow_back</span>
                        Subscriptions
                    </Link>
                    <span className="text-outline-variant/40">/</span>
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface">Edit</span>
                </div>

                {/* Header */}
                <div className="mb-8 pb-6 border-b border-outline-variant/20">
                    <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface">Edit Record</h1>
                    <p className="font-label text-sm text-on-surface-variant mt-1">{form.name}</p>
                </div>

                {/* Live cost preview */}
                {costVal > 0 && (
                    <div className="mb-6 p-4 border border-outline-variant/15 bg-surface-container-lowest grid grid-cols-2 gap-4 animate-fade-in">
                        <div>
                            <Label>Monthly</Label>
                            <div className="font-label font-bold text-xl tabular-nums text-on-surface mt-1">
                                {monthly.toFixed(2)} <span className="text-xs font-normal text-on-surface-variant">{form.currency}</span>
                            </div>
                        </div>
                        <div className="border-l border-outline-variant/15 pl-4">
                            <Label>Annual</Label>
                            <div className="font-label font-bold text-xl tabular-nums text-on-surface mt-1">
                                {annual.toFixed(2)} <span className="text-xs font-normal text-on-surface-variant">{form.currency}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Service name */}
                    <div className="space-y-2">
                        <Label>Service Name</Label>
                        <FieldInput
                            type="text" value={form.name ?? ''}
                            onChange={e => set('name', e.target.value)}
                            placeholder="e.g. Netflix, AWS, GitHub Copilot"
                            error={!!errors.name}
                        />
                        {errors.name && <p className="font-label text-[10px] text-tertiary uppercase tracking-wider">{errors.name}</p>}
                    </div>

                    {/* Cost + Currency */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_280px] gap-x-4 gap-y-6">
                        <div className="space-y-2">
                            <Label>Cost</Label>
                            <div className="relative">
                                <FieldInput
                                    type="number" value={form.cost ?? ''}
                                    onChange={e => set('cost', parseFloat(e.target.value))}
                                    placeholder="0.00" step="0.01" min="0" className="pr-14"
                                    error={!!errors.cost}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant pointer-events-none">
                                    {form.currency ?? 'PLN'}
                                </span>
                            </div>
                            {errors.cost && <p className="font-label text-[10px] text-tertiary uppercase tracking-wider">{errors.cost}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <div className="grid grid-cols-4 gap-1 h-[46px]">
                                {CURRENCIES.map(c => (
                                    <ToggleButton key={c} active={!customCurrency && form.currency === c}
                                        onClick={() => { set('currency', c); setCustomCurrency(false) }}>
                                        {c}
                                    </ToggleButton>
                                ))}
                                <ToggleButton active={customCurrency}
                                    onClick={() => { setCustomCurrency(true); set('currency', customCurrencyValue || '') }}>
                                    {customCurrency ? (customCurrencyValue || '???') : 'Other'}
                                </ToggleButton>
                            </div>
                            <AnimatePresence>
                                {customCurrency && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                        animate={{ height: 'auto', opacity: 1, marginTop: 4 }}
                                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <FieldInput
                                            type="text" value={customCurrencyValue}
                                            onChange={e => { const v = e.target.value.toUpperCase().slice(0, 5); setCustomCurrencyValue(v); set('currency', v) }}
                                            placeholder="e.g. CHF, JPY" maxLength={5}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Billing Cycle */}
                    <div className="space-y-2">
                        <Label>Billing Cycle</Label>
                        <div className="px-1 pb-1 pt-3">
                            <BillingCycleSlider
                                value={form.billing_cycle ?? 'monthly'}
                                onChange={v => set('billing_cycle', v)}
                            />
                        </div>
                    </div>

                    {/* Category + Next Billing Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <CategoryDropdown value={form.category ?? ''} onChange={v => set('category', v)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Next Billing Date</Label>
                            <FieldInput type="date" value={form.next_billing_date ?? ''} onChange={e => set('next_billing_date', e.target.value)} />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="grid grid-cols-3 gap-1">
                            {(['active', 'paused', 'cancelled'] as const).map(s => (
                                <ToggleButton key={s} active={form.status === s} onClick={() => set('status', s)}>
                                    {s}
                                </ToggleButton>
                            ))}
                        </div>
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                        <Label>Website (optional)</Label>
                        <FieldInput type="url" value={form.website ?? ''} onChange={e => set('website', e.target.value)} placeholder="youtube.com" />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <textarea
                            value={form.notes ?? ''} onChange={e => set('notes', e.target.value)}
                            placeholder="Any additional context..." rows={3}
                            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:border-on-surface/40 transition-colors duration-200 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-2 pb-8 flex gap-2">
                        <button
                            onClick={handleSubmit} disabled={saving}
                            className="flex-1 bg-on-surface text-surface font-label font-bold text-[10px] uppercase tracking-widest py-4 hover:bg-on-surface/85 transition-colors duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <><span className="w-3 h-3 border-2 border-surface/30 border-t-surface rounded-full animate-spin" /> Saving...</>
                            ) : '{ } Update Record'}
                        </button>
                        <Link href={`/${locale}/subscriptions`} className="px-6 py-4 border border-outline-variant/30 font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:border-outline-variant transition-all duration-200 flex items-center whitespace-nowrap">
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
