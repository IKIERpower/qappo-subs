import Link from 'next/link'
import Footer from '@/app/components/Footer'
import LandingNavbar from './components/LandingNavbar'
import { Metadata } from 'next'

// Static Generation - no dynamic content
export const revalidate = false

export const metadata: Metadata = {
  title: 'SubManager - Manage All Your Subscriptions in One Place',
  description: 'Track your subscriptions, manage billing cycles, get reminders, and optimize spending. All in one beautiful dashboard.',
  keywords: ['subscriptions', 'billing', 'expense tracking', 'subscription manager'],
  openGraph: {
    title: 'SubManager - Manage All Your Subscriptions',
    description: 'Track your subscriptions and optimize your spending',
    url: 'https://submanager.app',
    type: 'website',
  },
}

const translations = {
  landingEyebrow: 'Subscription Management',
  landingHeadline: 'Never Lose Track of Your Subscriptions Again',
  landingSubtitle: 'Monitor all your recurring payments in one place. Get reminders, track spending, and take control of your digital subscriptions.',
  landingCTA: 'Get Started',
  landingLogin: 'Sign In',
  landingFeaturesEyebrow: 'Features',
  landingFeaturesTitle: 'Everything You Need to Stay in Control',
  landingFeature1Title: 'Real-Time Monitoring',
  landingFeature1Desc: 'Track all your subscriptions and their renewal dates in real time.',
  landingFeature2Title: 'Smart Reminders',
  landingFeature2Desc: 'Get notified before your subscriptions renew so you never miss a payment.',
  landingFeature3Title: 'Spending Analytics',
  landingFeature3Desc: 'Visualize your subscription spending and identify opportunities to save.',
  landingBottomTitle: 'Ready to Take Control?',
  landingBottomSubtitle: 'Join thousands of users who are managing their subscriptions smarter.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <LandingNavbar />

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-36 md:pb-28">
          <div className="max-w-2xl">
            <div className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-6 animate-fade-up opacity-0" style={{ animationDelay: '0ms' }}>
              {translations.landingEyebrow}
            </div>
            <h1 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-on-surface mb-6 animate-fade-up opacity-0" style={{ animationDelay: '80ms' }}>
              {translations.landingHeadline}
            </h1>
            <p className="font-body text-lg md:text-xl text-on-surface-variant leading-relaxed mb-10 max-w-lg animate-fade-up opacity-0" style={{ animationDelay: '160ms' }}>
              {translations.landingSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-up opacity-0" style={{ animationDelay: '240ms' }}>
              <Link
                href="/auth/register"
                className="h-12 px-8 flex items-center justify-center font-label text-sm font-semibold tracking-wide uppercase text-on-primary bg-primary hover:bg-primary/85 transition-colors"
              >
                {translations.landingCTA}
              </Link>
              <Link
                href="/auth/login"
                className="h-12 px-8 flex items-center justify-center font-label text-sm font-semibold tracking-wide uppercase text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant/25 transition-colors"
              >
                {translations.landingLogin}
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
              {translations.landingFeaturesEyebrow}
            </div>
            <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight text-on-surface">
              {translations.landingFeaturesTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-8 bg-surface-container-lowest border border-outline-variant/15 hover:border-outline-variant/30 transition-colors">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 mb-6">
                <span className="material-symbols-outlined text-[20px] text-on-surface">monitoring</span>
              </div>
              <h3 className="font-headline font-semibold text-base text-on-surface mb-2">
                {translations.landingFeature1Title}
              </h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {translations.landingFeature1Desc}
              </p>
            </div>

            <div className="group p-8 bg-surface-container-lowest border border-outline-variant/15 hover:border-outline-variant/30 transition-colors">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 mb-6">
                <span className="material-symbols-outlined text-[20px] text-on-surface">notifications_active</span>
              </div>
              <h3 className="font-headline font-semibold text-base text-on-surface mb-2">
                {translations.landingFeature2Title}
              </h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {translations.landingFeature2Desc}
              </p>
            </div>

            <div className="group p-8 bg-surface-container-lowest border border-outline-variant/15 hover:border-outline-variant/30 transition-colors">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 mb-6">
                <span className="material-symbols-outlined text-[20px] text-on-surface">analytics</span>
              </div>
              <h3 className="font-headline font-semibold text-base text-on-surface mb-2">
                {translations.landingFeature3Title}
              </h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {translations.landingFeature3Desc}
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6">
          <div className="border-t border-outline-variant/15" />
        </div>

        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight text-on-surface mb-4">
            {translations.landingBottomTitle}
          </h2>
          <p className="font-body text-base text-on-surface-variant mb-8 max-w-md mx-auto">
            {translations.landingBottomSubtitle}
          </p>
          <Link
            href="/auth/register"
            className="inline-flex h-12 px-10 items-center justify-center font-label text-sm font-semibold tracking-wide uppercase text-on-primary bg-primary hover:bg-primary/85 transition-colors"
          >
            {translations.landingCTA}
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
