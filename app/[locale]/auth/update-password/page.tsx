'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/app/lib/supabase'
const supabase = getSupabaseBrowserClient()
import { useLocale } from '@/app/lib/LocaleContext'
import { useTranslation } from '@/app/lib/translations'
import Link from 'next/link'
import Footer from '@/app/components/Footer'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { locale } = useLocale()
  const t = useTranslation(locale)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleUpdate() {
    setError('')
    if (!newPassword) { setError(t.passwordRequired); return }
    if (newPassword.length < 6) { setError(t.passwordMinLength); return }
    if (newPassword !== confirmPassword) { setError(t.passwordMismatch); return }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <>
        <div className="min-h-screen bg-surface flex items-center justify-center p-8">
          <div className="w-full max-w-[400px] text-center animate-fade-up">
            <div className="w-12 h-12 bg-primary flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-white text-[22px]">check_circle</span>
            </div>
            <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface mb-2">
              {locale === 'en' ? 'Your password has been updated successfully.' : 'Twoje hasło zostało pomyślnie zaktualizowane.'}
            </h1>
            <p className="font-label text-sm text-on-surface-variant mb-8">
              {locale === 'en'
                ? 'You can now sign in with your new password.'
                : 'Możesz teraz zalogować się nowym hasłem.'}
            </p>
            <button
              onClick={() => router.replace('/settings')}
              className="w-full bg-primary text-on-primary font-label font-bold text-xs uppercase tracking-widest py-3.5 hover:opacity-80 transition-opacity"
            >
              {locale === 'en' ? 'Go to Settings' : 'Przejdź do ustawień'}
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] animate-fade-up">
          <Link
            href={`/${locale}/settings`}
            className="inline-flex items-center gap-1 font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors mb-10"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            {t.back}
          </Link>

          <div className="mb-8">
            <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface">
              {locale === 'en' ? 'Set New Password' : 'Ustaw nowe hasło'}
            </h1>
            <p className="font-label text-sm text-on-surface-variant mt-1">
              {locale === 'en'
                ? 'Enter your new password below.'
                : 'Wpisz poniżej swoje nowe hasło.'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                {t.newPassword}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                autoFocus
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                {t.confirmPassword}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                onKeyDown={e => e.key === 'Enter' && handleUpdate()}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 py-3 px-4 bg-tertiary/5 border border-tertiary/20 animate-fade-in">
                <span className="material-symbols-outlined text-[16px] text-tertiary">error</span>
                <span className="font-label text-xs text-tertiary">{error}</span>
              </div>
            )}

            <button
              onClick={handleUpdate}
              disabled={loading || !newPassword}
              className="w-full bg-primary text-on-primary font-label font-bold text-xs uppercase tracking-widest py-3.5 hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
              {locale === 'en' ? 'Update Password' : 'Zaktualizuj hasło'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
