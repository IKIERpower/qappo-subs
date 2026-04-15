            Sign In
            className="font-label text-sm text-on-surface hover:text-on-surface/80 transition-colors"
'use client'

import Link from 'next/link'

export default function LandingNavbar() {
  const { locale, setLocale } = useLocale()
  const { isDark, toggleTheme } = useTheme()
  const t = useTranslation(locale)

  return (
        <Link href="/" className="font-headline font-bold text-lg text-on-surface hover:opacity-80 transition-opacity">
          SubManager
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'pl' : 'en')}
        <div className="flex items-center gap-4">
          <Link
            href="/auth/register"
            className="h-10 px-6 flex items-center justify-center font-label text-sm font-semibold text-on-primary bg-primary hover:bg-primary/85 transition-colors"
            className="h-9 px-4 flex items-center justify-center font-label text-xs font-semibold tracking-wide uppercase text-on-primary bg-primary hover:bg-primary/85 transition-colors"
          >
            Sign Up
            {t.landingGetStarted}
          </Link>
        </div>
      </nav>
    </header>
  )
}

