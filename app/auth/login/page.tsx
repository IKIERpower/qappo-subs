'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please try again.'
        : error.message)
      setLoading(false)
    } else {
      router.replace('/dashboard')
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[480px] min-w-[480px] bg-primary flex-col justify-between p-12">
        <div>
          <div className="font-headline font-bold text-xl tracking-tighter text-white">Subly</div>
          <div className="font-label text-[10px] uppercase tracking-widest text-white/40 mt-0.5">Sub Manager</div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <div className="w-12 h-0.5 bg-white/20" />
            <blockquote className="font-headline text-2xl font-semibold tracking-tight text-white leading-tight">
              "Every subscription is a decision. Know the cost of each one."
            </blockquote>
          </div>

          {/* Fake metric cards */}
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
          © {new Date().getFullYear()} Subly
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] animate-fade-up">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <div className="font-headline font-bold sm:hidden text-xl tracking-tighter text-on-surface">Subly</div>
            <div className="font-label text-[10px] uppercase sm:hidden tracking-widest text-on-surface-variant mt-0.5">Sub Manage</div>
          </div>

          <div className="mb-8">
            <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface">Sign in</h1>
            <p className="font-label text-sm text-on-surface-variant mt-1">Access your financial ledger.</p>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              {/*<div className="flex items-center justify-between mb-2">*/}
              {/*  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">*/}
              {/*    Password*/}
              {/*  </label>*/}
              {/*  <Link href="/auth/reset" className="font-label text-[10px] text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider">*/}
              {/*    Forgot?*/}
              {/*  </Link>*/}
              {/*</div>*/}
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPass ? 'visibility_off' : 'visibility'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 py-3 px-4 bg-tertiary/5 border border-tertiary/20 animate-fade-in">
                <span className="material-symbols-outlined text-[16px] text-tertiary flex-shrink-0">error</span>
                <span className="font-label text-xs text-tertiary">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-primary text-white font-label font-bold text-xs uppercase tracking-widest py-3.5 hover:bg-on-surface transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center">
            {/*<span className="font-label text-xs text-on-surface-variant">No account? </span>*/}
            {/*<Link href="/auth/register" className="font-label text-xs text-on-surface font-semibold hover:underline">*/}
            {/*  Create one →*/}
            {/*</Link>*/}
          </div>
        </div>
      </div>
    </div>
  )
}
