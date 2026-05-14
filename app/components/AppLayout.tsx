'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import clsx from 'clsx'
import { useAuth } from '@/app/lib/AuthContext'
import { useTheme } from '@/app/lib/ThemeContext'
import { useLocale } from '@/app/lib/LocaleContext'
import { useTranslation } from '@/app/lib/translations'
import Footer from '@/app/components/Footer'
import FooterCompact from '@/app/components/FooterCompact'

const NAV_ITEMS = [
  { path: 'dashboard',     icon: 'dashboard',     labelKey: 'dashboard' },
  { path: 'subscriptions', icon: 'subscriptions', labelKey: 'subscriptionsNav' },
  { path: 'analytics',     icon: 'analytics',     labelKey: 'analytics' },
  { path: 'alerts',        icon: 'notifications', labelKey: 'alerts' },
] as const

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading, signOut, displayName } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { locale, setLocale } = useLocale()
  const t = useTranslation(locale)
  const [signingOut, setSigningOut] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false)

  const initials = (user?.email?.split('@')[0] ?? 'U').slice(0, 2).toUpperCase()
  const sidebarName = displayName || user?.email?.split('@')[0] || '—'

  // Determine active nav item from pathname (e.g. /pl/dashboard -> dashboard)
  const pathSegments = pathname.split('/')
  const currentPath = pathSegments[2] ?? '' // after locale
  const currentNav = NAV_ITEMS.find(n => currentPath.startsWith(n.path))
  const currentPageLabel = currentNav ? t[currentNav.labelKey] : t.settings

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-outline-variant/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-[240px] min-w-[240px] h-screen bg-surface-container-low flex-col">
        <div className="px-6 py-6 border-b border-outline-variant/20">
          <Link href={`/${locale}`} className="block">
            <div className="font-headline font-bold text-base tracking-tighter text-on-surface">SubManager</div>
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">Subscription Tracker</div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const href = `/${locale}/${item.path}`
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={item.path}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 transition-all duration-150 group relative',
                  isActive
                    ? 'text-on-surface font-semibold bg-surface-container-high'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                )}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary" />}
                <span className={clsx('material-symbols-outlined text-[20px]', isActive ? 'text-on-surface' : 'text-on-surface-variant')}>
                  {item.icon}
                </span>
                <span className="font-label text-sm tracking-tight">{t[item.labelKey]}</span>
              </Link>
            )
          })}
        </nav>

        {/* Desktop user section */}
        <div className="px-3 py-3 border-t border-outline-variant/20">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container transition-colors"
            >
              <div className="w-7 h-7 bg-primary flex items-center justify-center font-label font-bold text-[11px] text-white flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-headline font-semibold text-xs text-on-surface truncate">{sidebarName}</div>
                <div className="font-label text-[9px] uppercase tracking-widest text-secondary">Authenticated</div>
              </div>
              <span className={clsx('material-symbols-outlined text-[14px] text-on-surface-variant transition-transform duration-150', userMenuOpen ? 'rotate-180' : '')}>expand_more</span>
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface-container-lowest border border-outline-variant/30 shadow-sm animate-fade-up z-50">
                <div className="px-4 py-3 border-b border-outline-variant/20">
                  <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{t.signedInAs}</div>
                  <div className="font-label text-xs text-on-surface font-medium mt-0.5 truncate">{user?.email}</div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 py-3 font-label text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[15px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
                    {!isDark ? t.lightMode : t.darkMode}
                  </div>
                  <div className={clsx('w-8 h-4 rounded-full transition-all duration-300 relative flex-shrink-0', isDark ? 'bg-secondary' : 'bg-surface-container-high')}>
                    <div className={clsx('absolute top-0.5 w-3 h-3 rounded-full shadow transition-all duration-300', isDark ? 'left-4 bg-white' : 'left-0.5 bg-white')} />
                  </div>
                </button>
                {/* Language switcher */}
                <button
                  onClick={() => setLocale(locale === 'en' ? 'pl' : 'en')}
                  className="w-full flex items-center gap-2 px-4 py-3 font-label text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">language</span>
                  {locale === 'en' ? 'Polski' : 'English'}
                </button>
                <Link
                  href={`/${locale}/settings`}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 font-label text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">settings</span>
                  {t.settings}
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-2 px-4 py-3 font-label text-xs text-on-surface-variant hover:text-tertiary hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  {signingOut
                    ? <span className="w-3.5 h-3.5 border-2 border-outline-variant/30 border-t-on-surface-variant rounded-full animate-spin" />
                    : <span className="material-symbols-outlined text-[15px]">logout</span>
                  }
                  {t.signOut}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-4 md:px-8 flex-shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant hidden md:block">
              {currentNav?.icon ?? 'settings'}
            </span>
            <span className="font-headline font-semibold text-sm tracking-tight text-on-surface">
              {currentPageLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/subscriptions/new`}
              className="flex items-center gap-1.5 bg-primary text-on-primary font-label font-bold text-[11px] uppercase tracking-widest px-3 h-9 hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span className="hidden md:inline">{t.newEntry}</span>
            </Link>

            {/* Mobile user avatar */}
            <div className="md:hidden relative">
              <button
                onClick={() => setMobileUserMenuOpen(v => !v)}
                className="w-9 h-9 bg-primary flex items-center justify-center font-label font-bold text-[11px] text-on-primary"
              >
                {initials}
              </button>

              {mobileUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMobileUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest border border-outline-variant/30 shadow-lg animate-fade-up z-50">
                    <div className="px-4 py-3 border-b border-outline-variant/20">
                      <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{t.signedInAs}</div>
                      <div className="font-label text-xs text-on-surface font-medium mt-0.5 truncate">{user?.email}</div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-4 py-3 font-label text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">{!isDark ? 'light_mode' : 'dark_mode'}</span>
                        {!isDark ? t.lightMode : t.darkMode}
                      </div>
                    </button>
                    <button
                      onClick={() => setLocale(locale === 'en' ? 'pl' : 'en')}
                      className="w-full flex items-center gap-2 px-4 py-3 font-label text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors border-t border-outline-variant/10"
                    >
                      <span className="material-symbols-outlined text-[16px]">language</span>
                      {locale === 'en' ? 'Polski' : 'English'}
                    </button>
                    <Link
                      href={`/${locale}/settings`}
                      onClick={() => setMobileUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 font-label text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors border-t border-outline-variant/10"
                    >
                      <span className="material-symbols-outlined text-[16px]">settings</span>
                      {t.settings}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full flex items-center gap-2 px-4 py-3 font-label text-xs text-on-surface-variant hover:text-tertiary hover:bg-surface-container-low transition-colors disabled:opacity-50 border-t border-outline-variant/10"
                    >
                      {signingOut
                        ? <span className="w-3.5 h-3.5 border-2 border-outline-variant/30 border-t-on-surface-variant rounded-full animate-spin" />
                        : <span className="material-symbols-outlined text-[16px]">logout</span>
                      }
                      {t.signOut}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto" onClick={() => { setUserMenuOpen(false); setMobileUserMenuOpen(false) }}>
          {children}
          {currentPath === 'settings' ? <Footer /> : <FooterCompact />}
          <div className="h-14 md:hidden" />
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant/20 flex">
        {NAV_ITEMS.map(item => {
          const href = `/${locale}/${item.path}`
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={item.path}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-colors',
                isActive ? 'text-on-surface' : 'text-on-surface-variant'
              )}
            >
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-on-surface" />}
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="font-label text-[9px] uppercase tracking-wider">{t[item.labelKey]}</span>
            </Link>
          )
        })}
      </nav>

    </div>
  )
}
