import Link from 'next/link'
import Footer from '@/app/components/Footer'
import LandingNavbar from '@/app/components/LandingNavbar'
import { Metadata } from 'next'
import { translations } from '@/app/lib/translations'
import type { Locale } from '@/app/lib/LocaleContext'
import { notFound } from 'next/navigation'

const LOCALES: Locale[] = ['en', 'pl']

export const revalidate = false

export async function generateStaticParams() {
  return LOCALES.map(locale => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = translations[locale]
  return {
    title: `SubManager — ${t.landingHeadline}`,
    description: t.landingSubtitle,
  }
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!LOCALES.includes(locale as Locale)) notFound()

  const t = translations[locale as Locale]

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
                href={`/${locale}/auth/register`}
                className="h-12 px-8 flex items-center justify-center font-label text-sm font-semibold tracking-wide uppercase text-on-primary bg-primary hover:bg-primary/85 transition-colors"
              >
                {t.landingCTA}
              </Link>
              <Link
                href={`/${locale}/auth/login`}
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
            {[
              { icon: 'monitoring', title: t.landingFeature1Title, desc: t.landingFeature1Desc },
              { icon: 'notifications_active', title: t.landingFeature2Title, desc: t.landingFeature2Desc },
              { icon: 'analytics', title: t.landingFeature3Title, desc: t.landingFeature3Desc },
            ].map((f, i) => (
              <div key={i} className="group p-8 bg-surface-container-lowest border border-outline-variant/15 hover:border-outline-variant/30 transition-colors">
                <div className="w-10 h-10 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 mb-6">
                  <span className="material-symbols-outlined text-[20px] text-on-surface">{f.icon}</span>
                </div>
                <h3 className="font-headline font-semibold text-base text-on-surface mb-2">{f.title}</h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
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
            href={`/${locale}/auth/register`}
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
