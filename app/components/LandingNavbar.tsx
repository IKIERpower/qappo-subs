'use client'

import Link from 'next/link'
import { useLocale } from '@/app/lib/LocaleContext'
import { useTheme } from '@/app/lib/ThemeContext'
import { useTranslation } from '@/app/lib/translations'

export default function LandingNavbar() {
  const { locale, setLocale } = useLocale()
  const { isDark, toggleTheme } = useTheme()
  const t = useTranslation(locale)

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/15">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-headline font-bold text-lg text-on-surface hover:opacity-80 transition-opacity">
          SubManager
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'pl' : 'en')}
            className="h-9 px-3 font-label text-xs font-semibold tracking-wide uppercase text-on-surface-variant hover:text-on-surface bg-surface-container-low/50 backdrop-blur-sm hover:bg-surface-container border border-outline-variant/20 transition-colors"
            title={locale === 'en' ? 'Polski' : 'English'}
          >
            {locale === 'en' ? 'PL' : 'EN'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="h-9 w-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface bg-surface-container-low/50 backdrop-blur-sm hover:bg-surface-container border border-outline-variant/20 transition-colors"
            title={isDark ? t.lightMode : t.darkMode}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-outline-variant/25 mx-1" />

          <Link
            href="/auth/login"
            className="h-9 px-4 flex items-center font-label text-xs font-semibold tracking-wide uppercase text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 transition-colors"
          >
            {t.landingLogin}
          </Link>
          <Link
            href="/auth/register"
            className="h-9 px-4 flex items-center justify-center font-label text-xs font-semibold tracking-wide uppercase text-on-primary bg-primary hover:bg-primary/85 transition-colors"
          >
            {t.landingGetStarted}
          </Link>
        </div>
      </nav>
    </header>
  )
}

