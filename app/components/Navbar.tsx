'use client'

import Link from 'next/link'
import { useAuth } from '@/app/lib/AuthContext'
import { useLocale } from '@/app/lib/LocaleContext'
import { useTheme } from '@/app/lib/ThemeContext'
import { useTranslation } from '@/app/lib/translations'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export default function Navbar() {
  const { user } = useAuth()
  const { locale, setLocale } = useLocale()
  const { isDark, toggleTheme } = useTheme()
  const t = useTranslation(locale)
  const pathname = usePathname()


  const isAuthPage = pathname?.startsWith('/auth')

  return (
    <header className={clsx(
      "z-50 w-full transition-all",
      isAuthPage 
        ? "sticky top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant/15" 
        : "sticky top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant/15"
    )}>
      <div className={clsx(
        "mx-auto px-4 sm:px-6 h-16 flex items-center justify-between",
        isAuthPage ? "max-w-none" : "max-w-6xl"
      )}>
        {/* Logo */}

        {/* Right side controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'pl' : 'en')}
            className="h-9 px-2 sm:px-3 font-label text-[10px] sm:text-xs font-semibold tracking-wide uppercase text-on-surface-variant hover:text-on-surface bg-surface-container-low/50 backdrop-blur-sm hover:bg-surface-container border border-outline-variant/20 transition-colors"
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
          <div className="w-px h-6 bg-outline-variant/25 mx-1 hidden sm:block" />

          {/* Auth buttons */}
          {user ? (
            <Link
              href="/dashboard"
              className="h-9 px-3 sm:px-4 flex items-center font-label text-[10px] sm:text-xs font-semibold tracking-wide uppercase text-on-primary bg-primary hover:bg-primary/85 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              {/* Only show login/register buttons in Navbar if NOT on an auth page */}
              {!isAuthPage && (
                <>
                  <Link
                    href="/auth/login"
                    className="h-9 px-2.5 sm:px-4 hidden xs:flex items-center font-label text-[10px] sm:text-xs font-semibold tracking-wide uppercase text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 transition-colors"
                  >
                    {t.landingLogin}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="h-9 px-2.5 sm:px-4 flex items-center font-label text-[10px] sm:text-xs font-semibold tracking-wide uppercase text-on-primary bg-primary hover:bg-primary/85 transition-colors"
                  >
                    {t.landingGetStarted}
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
