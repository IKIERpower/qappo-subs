'use client'
import { useLocale } from '@/app/lib/LocaleContext'

import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/app/lib/supabase'
const supabase = getSupabaseBrowserClient()
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'
import Footer from '@/app/components/Footer'
import Navbar from '@/app/components/Navbar'

export default function LoginPage() {
  const router = useRouter()
  const { locale } = useLocale()
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
      router.replace(`/${locale}/dashboard`)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <>
    <div className="min-h-screen bg-surface flex relative">

      {/* Absolute Top Navigation Layer */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between p-6 lg:p-8 z-10 pointer-events-none">
        {/* Mobile Branding (hidden on desktop) */}
        <Link href={`/${locale}`} className="lg:hidden font-headline font-bold text-md tracking-tighter text-on-surface pointer-events-auto">
          SubManager
        </Link>
        {/* Global Navbar Buttons */}
        <div className="pointer-events-auto ml-auto">
          <Navbar />
        </div>
      </div>

       {/* Left panel — branding */}
       <div className="hidden lg:flex w-[480px] min-w-[480px] bg-black flex-col justify-between p-12">
         <Link href={`/${locale}`} className="group block">
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
          © {new Date().getFullYear()} QAPPO
        </div>
      </div>

       {/* Right panel — form */}
       <div className="flex-1 flex flex-col items-center justify-start lg:justify-center p-8 pt-32 lg:pt-8 w-full">
         <div className="w-full max-w-[400px] animate-fade-up">

           <div className="w-full">
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
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                      PASSWORD
                  </label>
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

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link href={`/${locale}/auth/reset`} className="font-label text-xs text-primary hover:text-primary/85 transition-colors">
                  Forgot password?
                </Link>
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
                className="w-full bg-primary text-on-primary font-label font-bold text-xs uppercase tracking-widest py-3.5 hover:bg-primary/85 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
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
                <span className="font-label text-xs text-on-surface-variant">No account? </span>
                <Link href={`/${locale}/auth/register`} className="font-label text-xs text-on-surface font-semibold hover:underline">
                  Create one →
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}
