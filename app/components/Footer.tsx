'use client'

import Link from 'next/link'
import { useLocale } from '@/app/lib/LocaleContext'
import { useTranslation } from '@/app/lib/translations'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { locale } = useLocale()
  const t = useTranslation(locale)

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/20 mt-auto">
      <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <h3 className="font-headline font-bold text-lg tracking-tighter text-on-surface mb-1">
                SubManager
              </h3>
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant dark:text-on-surface-variant/80">
                SubManager by QAPPO
              </p>
            </div>
            <p className="font-label text-sm text-on-surface-variant dark:text-on-surface-variant/85 leading-relaxed">
              Manage all your subscriptions in one place. Track spending, get reminders, and stay in control.
            </p>
            <Link
              href="https://qappo.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 font-label text-xs font-semibold text-primary hover:text-on-surface dark:hover:text-on-surface-variant transition-colors"
            >
              Visit QAPPO.PL →
            </Link>
          </div>

          {/* Product - Hidden on mobile */}
          <div className="hidden md:block">
            <h4 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant dark:text-on-surface-variant/85 font-semibold mb-4">
              {t.product}
            </h4>
            <nav className="space-y-3">
              <Link
                href="/dashboard"
                className="block font-label text-sm text-on-surface dark:text-on-surface/90 hover:text-primary dark:hover:text-on-surface-variant transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/subscriptions"
                className="block font-label text-sm text-on-surface dark:text-on-surface/90 hover:text-primary dark:hover:text-on-surface-variant transition-colors"
              >
                Subscriptions
              </Link>
              <Link
                href="/analytics"
                className="block font-label text-sm text-on-surface dark:text-on-surface/90 hover:text-primary dark:hover:text-on-surface-variant transition-colors"
              >
                Analytics
              </Link>
              <Link
                href="/alerts"
                className="block font-label text-sm text-on-surface dark:text-on-surface/90 hover:text-primary dark:hover:text-on-surface-variant transition-colors"
              >
                Alerts
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant dark:text-on-surface-variant/85 font-semibold mb-4">
              {t.legal}
            </h4>
            <nav className="space-y-3">
              <Link
                href="/legal/privacy-policy"
                className="block font-label text-sm text-on-surface dark:text-on-surface/90 hover:text-primary dark:hover:text-on-surface-variant transition-colors"
              >
                {t.privacyPolicy}
              </Link>
              <Link
                href="/legal/terms-of-service"
                className="block font-label text-sm text-on-surface dark:text-on-surface/90 hover:text-primary dark:hover:text-on-surface-variant transition-colors"
              >
                {t.termsOfService}
              </Link>
              <Link
                href="/legal/cookie-policy"
                className="block font-label text-sm text-on-surface dark:text-on-surface/90 hover:text-primary dark:hover:text-on-surface-variant transition-colors"
              >
                {t.cookiePolicy}
              </Link>
              <Link
                href="/legal/gdpr"
                className="block font-label text-sm text-on-surface dark:text-on-surface/90 hover:text-primary dark:hover:text-on-surface-variant transition-colors"
              >
                {t.gdpr}
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant dark:text-on-surface-variant/85 font-semibold mb-4">
              {t.support}
            </h4>
            <nav className="space-y-3">
              <Link
                href="mailto:contact.qappo@gmail.com"
                className="block font-label text-sm text-on-surface dark:text-on-surface/90 hover:text-primary dark:hover:text-on-surface-variant transition-colors"
              >
                {t.contactSupport}
              </Link>
              <Link
                href="mailto:contact.qappo@gmail.com"
                className="block font-label text-sm text-on-surface dark:text-on-surface/90 hover:text-primary dark:hover:text-on-surface-variant transition-colors"
              >
                {t.emailQAPPO}
              </Link>
              <Link
                href="https://qappo.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-label text-sm text-on-surface dark:text-on-surface/90 hover:text-primary dark:hover:text-on-surface-variant transition-colors"
              >
                {t.qappoWebsite}
              </Link>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-outline-variant/20 pt-8 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
          {/* Copyright */}
          <div className="font-label text-xs text-on-surface-variant dark:text-on-surface-variant/85">
            © {currentYear} QAPPO. {t.allRightsReserved}. | {t.sublyProduct}{' '}
            <Link
              href="https://qappo.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-on-surface dark:hover:text-on-surface-variant transition-colors font-semibold"
            >
              QAPPO
            </Link>
          </div>

          {/* Social / Additional links */}
          <div className="flex items-center gap-6 text-on-surface-variant dark:text-on-surface-variant/85 md:ml-auto">
            <Link
              href="mailto:contact.qappo@gmail.com"
              className="font-label text-xs hover:text-primary transition-colors"
              title="Contact QAPPO"
            >
              {t.contact}
            </Link>
            <span className="text-outline-variant/40">•</span>
            <Link
              href="https://qappo.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="font-label text-xs hover:text-primary transition-colors"
              title="Visit QAPPO"
            >
              QAPPO.PL
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

