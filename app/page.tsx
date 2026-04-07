'use client'

import Link from 'next/link'
import Footer from '@/app/components/Footer'
import LandingNavbar from './components/LandingNavbar'
import { useLocale } from '@/app/lib/LocaleContext'
import { useTranslation } from '@/app/lib/translations'

export default function LandingPage() {
  const { locale } = useLocale()
  const t = useTranslation(locale)

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <LandingNavbar />

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-36 md:pb-28">
          <div className="max-w-2xl">
            <div className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-6 animate-fade-up opacity-0" style={{ animationDelay: '0ms' }}>
              {t.landingEyebrow}
            </div>
            <h1 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-on-surface mb-6 animate-fade-up opacity-0" style={{ animationDelay: '80ms' }}>
              {t.landingHeadline}
            </h1>
            <p className="font-body text-lg md:text-xl text-on-surface-variant leading-relaxed mb-10 max-w-lg animate-fade-up opacity-0" style={{ animationDelay: '160ms' }}>
              {t.landingSubtitle}
            </p>
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

        <div className="max-w-6xl mx-auto px-6">
          <div className="border-t border-outline-variant/15" />
        </div>

        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="mb-16">
            <div className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">
              {t.landingFeaturesEyebrow}
            </div>
            <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight text-on-surface">
              {t.landingFeaturesTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-8 bg-surface-container-lowest border border-outline-variant/15 hover:border-outline-variant/30 transition-colors">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 mb-6">
                <span className="material-symbols-outlined text-[20px] text-on-surface">monitoring</span>
              </div>
              <h3 className="font-headline font-semibold text-base text-on-surface mb-2">
                {t.landingFeature1Title}
              </h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {t.landingFeature1Desc}
              </p>
            </div>

            <div className="group p-8 bg-surface-container-lowest border border-outline-variant/15 hover:border-outline-variant/30 transition-colors">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 mb-6">
                <span className="material-symbols-outlined text-[20px] text-on-surface">notifications_active</span>
              </div>
              <h3 className="font-headline font-semibold text-base text-on-surface mb-2">
                {t.landingFeature2Title}
              </h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {t.landingFeature2Desc}
              </p>
            </div>

            <div className="group p-8 bg-surface-container-lowest border border-outline-variant/15 hover:border-outline-variant/30 transition-colors">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 mb-6">
                <span className="material-symbols-outlined text-[20px] text-on-surface">analytics</span>
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

        <div className="max-w-6xl mx-auto px-6">
          <div className="border-t border-outline-variant/15" />
        </div>

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

      <Footer />
    </div>
  )
}
