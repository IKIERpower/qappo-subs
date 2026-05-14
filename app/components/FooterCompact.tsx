'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/app/lib/LocaleContext'
import { useTranslation } from '@/app/lib/translations'
import ContactModal from '@/app/components/ContactModal'

export default function FooterCompact() {
  const currentYear = new Date().getFullYear()
  const { locale } = useLocale()
  const t = useTranslation(locale)
  const [contactModalOpen, setContactModalOpen] = useState(false)

  return (
    <>
      <footer className="border-t border-outline-variant/15 mt-auto">
        <div className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Copyright */}
          <span className="font-label text-[11px] text-on-surface-variant/70">
            © {currentYear} QAPPO
          </span>

          {/* Links */}
          <nav className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              href={`/${locale}/legal/privacy-policy`}
              className="font-label text-[11px] text-on-surface-variant/70 hover:text-on-surface-variant transition-colors"
            >
              {t.privacyPolicy}
            </Link>
            <Link
              href={`/${locale}/legal/terms-of-service`}
              className="font-label text-[11px] text-on-surface-variant/70 hover:text-on-surface-variant transition-colors"
            >
              {t.termsOfService}
            </Link>
            <Link
              href={`/${locale}/legal/cookie-policy`}
              className="font-label text-[11px] text-on-surface-variant/70 hover:text-on-surface-variant transition-colors"
            >
              {t.cookiePolicy}
            </Link>
            <button
              onClick={() => setContactModalOpen(true)}
              className="font-label text-[11px] text-on-surface-variant/70 hover:text-on-surface-variant transition-colors"
            >
              {t.contact}
            </button>
            <Link
              href="https://qappo.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="font-label text-[11px] text-on-surface-variant/70 hover:text-on-surface-variant transition-colors"
            >
              QAPPO.PL
            </Link>
          </nav>
        </div>
      </footer>
      <ContactModal open={contactModalOpen} onClose={() => setContactModalOpen(false)} />
    </>
  )
}

