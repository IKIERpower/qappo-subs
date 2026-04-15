'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useAuth } from '@/app/lib/AuthContext'
import { useTheme } from '@/app/lib/ThemeContext'
import { useLocale } from '@/app/lib/LocaleContext'
import { useTranslation } from '@/app/lib/translations'
import { supabase } from '@/app/lib/supabase'

import Footer from '@/app/components/Footer'
import FooterCompact from '@/app/components/FooterCompact'

const navItems = [
  { href: '/dashboard',     icon: 'dashboard',     labelKey: 'dashboard' },
  { href: '/subscriptions', icon: 'subscriptions', labelKey: 'subscriptionsNav' },
  { href: '/analytics',     icon: 'analytics',     labelKey: 'analytics' },
  { href: '/alerts',        icon: 'notifications', labelKey: 'alerts' },
]

const pageMap: Record<string, { icon: string; labelKey: string }> = {
  '/settings': { icon: 'settings', labelKey: 'settings' },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { locale } = useLocale()
  const t = useTranslation(locale)
  const [signingOut, setSigningOut] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)   // desktop dropdown
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false) // mobile dropdown
  const [displayName, setDisplayName] = useState('')

  // Load display name from profiles
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name)
      })
  }, [user])

  const initials = (user || (user?.email?.split('@')[0] ?? 'U')).slice(0, 2).toUpperCase()
  const sidebarName = displayName || user?.email?.split('@')[0] || '—'
  const currentNav = navItems.find(n => pathname.startsWith(n.href))
  const currentPageData = currentNav ?? pageMap[pathname] ?? { icon: 'dashboard', labelKey: 'dashboard' }
  const currentPageLabel = t[currentPageData.labelKey as keyof typeof t] || 'Dashboard'

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

      {/* ════════════════════════════════════════
          DESKTOP SIDEBAR (hidden on mobile)
      ════════════════════════════════════════ */}
      <aside className="hidden md:flex w-[240px] min-w-[240px] h-screen bg-surface-container-low flex-col">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-outline-variant/20">
          <div className="font-headline font-bold text-base tracking-tighter text-on-surface">SubManager</div>
          <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">Subscription Tracker</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
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
                <span className="font-label text-sm tracking-tight">{t[item.labelKey as keyof typeof t]}</span>
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
                <Link
                  href="/settings"
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

      {/* ════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="h-14 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-4 md:px-8 flex-shrink-0 sticky top-0 z-40">
          {/* Left: page title */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant hidden md:block">
              {currentPageData.icon}
            </span>
            <span className="font-headline font-semibold text-sm tracking-tight text-on-surface">
              {currentPageLabel}
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Link
              href="/subscriptions/new"
              className="flex items-center gap-1.5 bg-primary text-on-primary font-label font-bold text-[11px] uppercase tracking-widest px-3 h-9 hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span className="hidden md:inline">{t.newEntry}</span>
            </Link>

            {/* Mobile-only: user avatar in topbar */}
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
                    {/* Dark mode — only mobile */}
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-4 py-3 font-label text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">{!isDark ? 'light_mode' : 'dark_mode'}</span>
                        {!isDark ? t.lightMode : t.darkMode}
                      </div>
                      <div className={clsx('w-9 h-5 rounded-full transition-all duration-300 relative flex-shrink-0',isDark ? 'bg-secondary' : 'bg-surface-container-high')}>
                        <div className={clsx('absolute top-1 w-3 h-3 rounded-full shadow transition-all duration-300', isDark  ? 'left-5 bg-white' : 'left-1 bg-white')} />
                      </div>
                    </button>
                    <Link
                      href="/settings"
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

        {/* Page content */}
        <main className="flex-1 overflow-auto" onClick={() => { setUserMenuOpen(false); setMobileUserMenuOpen(false) }}>
          {children}
          {pathname === '/settings' ? <Footer /> : <FooterCompact />}
          {/* Spacer for mobile bottom nav */}
          <div className="h-14 md:hidden" />
        </main>
      </div>

      {/* ════════════════════════════════════════
          MOBILE BOTTOM NAV (hidden on desktop)
      ════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant/20 flex">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-colors',
                isActive ? 'text-on-surface-variant' : 'text-on-surface'
              )}
            >
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-on-surface-variant" />}
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="font-label text-[9px] uppercase tracking-wider">{t[item.labelKey as keyof typeof t]}</span>
            </Link>
          )
        })}
      </nav>

    </div>
  )
}
