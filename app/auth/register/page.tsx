'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Password strength
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', 'bg-tertiary', 'bg-yellow-500', 'bg-secondary/70', 'bg-secondary']

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
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] text-center animate-fade-up">
          <div className="w-12 h-12 bg-secondary flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-white text-[22px]">mark_email_read</span>
          </div>
          <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface mb-2">Check your inbox</h1>
          <p className="font-label text-sm text-on-surface-variant mb-8">
            We sent a confirmation link to <span className="font-semibold text-on-surface">{email}</span>. Click it to activate your account.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[480px] min-w-[480px] bg-primary flex-col justify-between p-12">
        <div>
          <div className="font-headline font-bold text-xl tracking-tighter text-white">Precision Editorial</div>
          <div className="font-label text-[10px] uppercase tracking-widest text-white/40 mt-0.5">Financial Architect</div>
        </div>
        <div className="space-y-6">
          <div className="w-12 h-0.5 bg-white/20" />
          <p className="font-headline text-xl font-semibold tracking-tight text-white leading-tight">
            Take architectural control of your recurring costs.
          </p>
          <div className="space-y-4 font-label text-sm text-white/50">
            {['Track every subscription in one ledger', 'Forecast your 12-month burn rate', 'Set smart alerts before renewals hit'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-white/30 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="font-label text-[10px] text-white/20 uppercase tracking-widest">
          © {new Date().getFullYear()} Precision Editorial
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="lg:hidden mb-10">
            <div className="font-headline font-bold text-xl tracking-tighter text-on-surface">Precision Editorial</div>
          </div>

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
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
                placeholder="you@example.com"
                autoFocus
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Min. 6 characters"
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
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2 animate-fade-in">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-0.5 flex-1 transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-outline-variant/30'}`} />
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
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Repeat password"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 py-3 px-4 bg-tertiary/5 border border-tertiary/20 animate-fade-in">
                <span className="material-symbols-outlined text-[16px] text-tertiary flex-shrink-0">error</span>
                <span className="font-label text-xs text-tertiary">{error}</span>
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-primary text-white font-label font-bold text-xs uppercase tracking-widest py-3.5 hover:bg-on-surface transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center">
            <span className="font-label text-xs text-on-surface-variant">Already have an account? </span>
            <Link href="/auth/login" className="font-label text-xs text-on-surface font-semibold hover:underline">
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
