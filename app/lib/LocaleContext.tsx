'use client'

// LocaleContext - uproszczony, locale pochodzi z URL (/pl/... lub /en/...)
// Komponent używa useParams() żeby czytać locale, a do zmiany przekierowuje na inny URL

import { createContext, useContext } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'

export type Locale = 'en' | 'pl'
export const LOCALES: Locale[] = ['en', 'pl']

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'pl',
  setLocale: () => {},
})

export function LocaleProvider({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const router = useRouter()
  const pathname = usePathname()

  function setLocale(newLocale: Locale) {
    if (newLocale === locale) return
    // Swap the locale segment in the URL: /pl/dashboard -> /en/dashboard
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`
    router.push(newPath)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
