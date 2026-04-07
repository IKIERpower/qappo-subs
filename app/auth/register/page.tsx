'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'
import Footer from '@/app/components/Footer'
import Navbar from '@/app/components/Navbar'
import clsx from 'clsx'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const strength =
        password.length === 0
            ? 0
            : password.length < 6
                ? 1
                : password.length < 10
                    ? 2
                    : /[A-Z]/.test(password) && /[0-9]/.test(password)
                        ? 4
                        : 3

    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
    const strengthColor = [
        '',
        'bg-tertiary',
        'bg-yellow-500',
        'bg-secondary/70',
        'bg-secondary',
    ]

    async function handleRegister() {
        setError(null)
        if (!email.trim()) { setError('Email is required.'); return }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
        if (password !== confirm) { setError('Passwords do not match.'); return }

        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: displayName.trim() ? { display_name: displayName.trim() } : undefined,
            },
        })
        setLoading(false)

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
        }
    }

    function handleKey(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleRegister()
    }

    if (success) {
        return (
            <>
                <div className="min-h-screen bg-surface flex flex-col">
                    <div className="p-8"><Navbar /></div>
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="w-full max-w-[400px] text-center animate-fade-up">
                            <div className="w-12 h-12 bg-secondary flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-white text-[22px]">mark_email_read</span>
                            </div>
                            <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface mb-2">Check your inbox</h1>
                            <p className="font-label text-sm text-on-surface-variant mb-8">
                                We sent a confirmation link to <span className="font-semibold text-on-surface">{email}</span>.
                            </p>
                            <Link href="/auth/login" className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">
                                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                                Back to sign in
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        )
    }

    return (
        <>
            <div className="min-h-screen bg-surface flex relative">

                {/* Absolute Top Navigation Layer */}
                <div className="absolute top-0 left-0 w-full flex items-center justify-between p-6 lg:p-8 z-10 pointer-events-none">
                    <Link href="/" className="lg:hidden font-headline font-bold text-md tracking-tighter text-on-surface pointer-events-auto">
                        SubManager
                    </Link>
                    <div className="pointer-events-auto ml-auto">
                        <Navbar />
                    </div>
                </div>

                {/* Left panel — branding */}
                <div className="hidden lg:flex w-[480px] min-w-[480px] bg-black flex-col justify-between p-12">
                    <Link href="/" className="group block">
                        <div className="font-headline font-bold text-xl tracking-tighter text-white group-hover:text-white/80 transition-colors">SubManager</div>
                        <div className="font-label text-[10px] uppercase tracking-widest text-white/40 mt-0.5 group-hover:text-white/30 transition-colors">Sub Manager by Qappo</div>
                    </Link>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <div className="w-12 h-0.5 bg-white/20" />
                            <blockquote className="font-headline text-2xl font-semibold tracking-tight text-white leading-tight">
                                "Every subscription is a decision. Know the cost of each one."
                            </blockquote>
                        </div>

                        <div className="space-y-3">
                            {[
                                { label: 'Monthly Burn', value: '2,482.50 PLN', trend: '+4.2%', up: true },
                                { label: 'Active Licenses', value: '12 subscriptions', trend: 'nominal', up: null },
                                { label: 'Annual Projection', value: '29.7K PLN', trend: '12-month', up: null },
                            ].map(m => (
                                <div key={m.label} className="flex items-center justify-between py-3 border-t border-white/10">
                                    <span className="font-label text-xs uppercase tracking-widest text-white/40">{m.label}</span>
                                    <div className="text-right">
                                        <span className="font-label text-sm font-bold tabular-nums text-white">{m.value}</span>
                                        {m.up !== null && (
                                            <span className={clsx('ml-2 font-label text-xs', m.up ? 'text-tertiary-container' : 'text-white/40')}>
                                                {m.up ? '↑' : ''} {m.trend}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="font-label text-[10px] text-white/20 uppercase tracking-widest">
                        © {new Date().getFullYear()} QAPPO
                    </div>
                </div>

                {/* Right panel — form */}
                <div className="flex-1 flex flex-col items-center justify-start lg:justify-center p-8 pt-40 lg:pt-8 w-full">
                    <div className="w-full max-w-[400px] animate-fade-up">
                        <div className="mb-8">
                            <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface">Create account</h1>
                            <p className="font-label text-sm text-on-surface-variant mt-1">Set up your financial ledger.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={handleKey}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            <div>
                                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                                    Display Name <span className="normal-case tracking-normal text-on-surface-variant/50">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    onKeyDown={handleKey}
                                    placeholder="Your name"
                                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            <div>
                                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={handleKey}
                                        placeholder="Min. 6 characters"
                                        className="w-full px-4 py-3 pr-12 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant hover:text-on-surface transition-colors"
                                    >
                                        {showPass ? 'visibility_off' : 'visibility'}
                                    </button>
                                </div>
                                {password.length > 0 && (
                                    <div className="mt-2 flex items-center gap-2 animate-fade-in">
                                        <div className="flex-1 flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className={clsx('h-0.5 flex-1 transition-all duration-300', i <= strength ? strengthColor[strength] : 'bg-outline-variant/30')} />
                                            ))}
                                        </div>
                                        <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">{strengthLabel[strength]}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    onKeyDown={handleKey}
                                    placeholder="Repeat password"
                                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 py-3 px-4 bg-tertiary/5 border border-tertiary/20 animate-fade-in">
                                    <span className="material-symbols-outlined text-[16px] text-tertiary">error</span>
                                    <span className="font-label text-xs text-tertiary">{error}</span>
                                </div>
                            )}

                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className="w-full bg-primary text-on-primary font-label font-bold text-xs uppercase tracking-widest py-3.5 hover:bg-primary/85 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center">
                            <span className="font-label text-xs text-on-surface-variant">Already have an account? </span>
                            <Link href="/auth/login" className="font-label text-xs text-on-surface font-semibold hover:underline">Sign in →</Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
