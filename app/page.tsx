'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/lib/AuthContext'
import { useLocale } from '@/app/lib/LocaleContext'
import { useTheme } from '@/app/lib/ThemeContext'
import { useTranslation } from '@/app/lib/translations'
import { useRouter } from 'next/navigation'
import Footer from '@/app/components/Footer'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const { locale, setLocale } = useLocale()
  const { isDark, toggleTheme } = useTheme()
  const t = useTranslation(locale)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [loading, user, router])

  // While loading or redirecting logged-in user, show nothing
  if (loading || user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-on-surface-variant/30 border-t-on-surface rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/15">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-headline font-bold text-lg tracking-tighter text-on-surface">
              SubManager
            </span>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            {mounted && (
              <button
                onClick={() => setLocale(locale === 'en' ? 'pl' : 'en')}
                className="h-9 px-3 font-label text-xs font-semibold tracking-wide uppercase text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 transition-colors"
                title={locale === 'en' ? 'Polski' : 'English'}
              >
                {locale === 'en' ? 'PL' : 'EN'}
              </button>
            )}

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="h-9 w-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 transition-colors"
                title={isDark ? t.lightMode : t.darkMode}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-outline-variant/25 mx-1 hidden sm:block" />

            {/* Auth buttons */}
            <Link
              href="/auth/login"
              className="h-9 px-4 items-center font-label text-xs font-semibold tracking-wide uppercase text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 transition-colors hidden sm:flex"
            >
              {t.landingLogin}
            </Link>
            <Link
              href="/auth/register"
              className="h-9 px-4 flex items-center font-label text-xs font-semibold tracking-wide uppercase text-on-primary bg-primary hover:bg-primary/85 transition-colors"
            >
              {t.landingGetStarted}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-36 md:pb-28">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-6 animate-fade-up opacity-0" style={{ animationDelay: '0ms' }}>
              {t.landingEyebrow}
            </div>

            {/* Headline */}
            <h1 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-on-surface mb-6 animate-fade-up opacity-0" style={{ animationDelay: '80ms' }}>
              {t.landingHeadline}
            </h1>

            {/* Subtitle */}
            <p className="font-body text-lg md:text-xl text-on-surface-variant leading-relaxed mb-10 max-w-lg animate-fade-up opacity-0" style={{ animationDelay: '160ms' }}>
              {t.landingSubtitle}
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-up opacity-0" style={{ animationDelay: '240ms' }}>
              <Link
                href="/auth/register"
                className="h-12 px-8 flex items-center justify-center font-label text-sm font-semibold tracking-wide uppercase text-on-primary bg-primary hover:bg-primary/85 transition-colors"
              >
                {t.landingCTA}
              </Link>
              <Link
                href="/auth/login"
                className="h-12 px-8 flex items-center justify-center font-label text-sm font-semibold tracking-wide uppercase text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant/25 transition-colors"
              >
                {t.landingLogin}
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Divider ─── */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="border-t border-outline-variant/15" />
        </div>

        {/* ─── Features ─── */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          {/* Section header */}
          <div className="mb-16">
            <div className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">
              {t.landingFeaturesEyebrow}
            </div>
            <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight text-on-surface">
              {t.landingFeaturesTitle}
            </h2>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group p-8 bg-surface-container-lowest border border-outline-variant/15 hover:border-outline-variant/30 transition-colors">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 mb-6">
                <span className="material-symbols-outlined text-[20px] text-on-surface">
                  monitoring
                </span>
              </div>
              <h3 className="font-headline font-semibold text-base text-on-surface mb-2">
                {t.landingFeature1Title}
              </h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {t.landingFeature1Desc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-surface-container-lowest border border-outline-variant/15 hover:border-outline-variant/30 transition-colors">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 mb-6">
                <span className="material-symbols-outlined text-[20px] text-on-surface">
                  notifications_active
                </span>
              </div>
              <h3 className="font-headline font-semibold text-base text-on-surface mb-2">
                {t.landingFeature2Title}
              </h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {t.landingFeature2Desc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-surface-container-lowest border border-outline-variant/15 hover:border-outline-variant/30 transition-colors">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 mb-6">
                <span className="material-symbols-outlined text-[20px] text-on-surface">
                  analytics
                </span>
              </div>
              <h3 className="font-headline font-semibold text-base text-on-surface mb-2">
                {t.landingFeature3Title}
              </h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {t.landingFeature3Desc}
              </p>
            </div>
          </div>
        </section>

        {/* ─── Divider ─── */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="border-t border-outline-variant/15" />
        </div>

        {/* ─── Bottom CTA ─── */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight text-on-surface mb-4">
            {t.landingBottomTitle}
          </h2>
          <p className="font-body text-base text-on-surface-variant mb-8 max-w-md mx-auto">
            {t.landingBottomSubtitle}
          </p>
          <Link
            href="/auth/register"
            className="inline-flex h-12 px-10 items-center justify-center font-label text-sm font-semibold tracking-wide uppercase text-on-primary bg-primary hover:bg-primary/85 transition-colors"
          >
            {t.landingCTA}
          </Link>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <Footer />
    </div>
  )
}
