'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReset() {
    if (!email.trim()) { setError('Please enter your email.'); return }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  if (sent) return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="w-full max-w-[400px] text-center animate-fade-up">
        <div className="w-12 h-12 bg-primary flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-white text-[22px]">mark_email_read</span>
        </div>
        <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface mb-2">Reset link sent</h1>
        <p className="font-label text-sm text-on-surface-variant mb-8">
          Check <span className="font-semibold text-on-surface">{email}</span> for a password reset link.
        </p>
        <Link href="/auth/login" className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>Back to sign in
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="w-full max-w-[400px] animate-fade-up">
        <Link href="/auth/login" className="inline-flex items-center gap-1 font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors mb-10">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>Back
        </Link>

        <div className="mb-8">
          <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface">Reset password</h1>
          <p className="font-label text-sm text-on-surface-variant mt-1">We'll send you a reset link.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              placeholder="you@example.com"
              autoFocus
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 py-3 px-4 bg-tertiary/5 border border-tertiary/20">
              <span className="material-symbols-outlined text-[16px] text-tertiary">error</span>
              <span className="font-label text-xs text-tertiary">{error}</span>
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-primary text-white font-label font-bold text-xs uppercase tracking-widest py-3.5 hover:bg-on-surface transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Send Reset Link
          </button>
        </div>
      </div>
    </div>
  )
}
