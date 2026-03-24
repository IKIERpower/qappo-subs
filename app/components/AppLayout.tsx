'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import clsx from 'clsx'
import { useAuth } from '@/app/lib/AuthContext'
import { useTheme } from '@/app/lib/ThemeContext'

const navItems = [
  { href: '/dashboard',     icon: 'dashboard',     label: 'Dashboard' },
  { href: '/subscriptions', icon: 'subscriptions', label: 'Subscriptions' },
  { href: '/analytics',     icon: 'analytics',     label: 'Analytics' },
  { href: '/alerts',        icon: 'notifications', label: 'Alerts' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [signingOut, setSigningOut] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const displayName = user?.email?.split('@')[0] ?? '—'
  const initials = displayName.slice(0, 2).toUpperCase()
  const currentNav = navItems.find(n => pathname.startsWith(n.href))

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

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed md:static inset-y-0 left-0 z-50 w-[240px] min-w-[240px] h-screen bg-surface-container-low flex flex-col transition-transform duration-300 md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-outline-variant/20 flex items-center justify-between">
          <div>
            <div className="font-headline font-bold text-base tracking-tighter text-on-surface">Subly</div>
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">Subscription Tracker</div>
          </div>
          <button className="md:hidden material-symbols-outlined text-[20px] text-on-surface-variant" onClick={() => setSidebarOpen(false)}>close</button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 transition-all duration-150 group relative',
                  isActive
                    ? 'text-on-surface font-semibold bg-surface-container-high'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                )}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary" />}
                <span className={clsx('material-symbols-outlined text-[20px] transition-transform duration-150 group-hover:scale-105', isActive ? 'text-on-surface' : 'text-on-surface-variant')}>
                  {item.icon}
                </span>
                <span className="font-label text-sm tracking-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
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
                <div className="font-headline font-semibold text-xs text-on-surface truncate">{user?.email ?? '—'}</div>
                <div className="font-label text-[9px] uppercase tracking-widest text-secondary">Authenticated</div>
              </div>
              <span className={clsx('material-symbols-outlined text-[14px] text-on-surface-variant transition-transform duration-150', userMenuOpen ? 'rotate-180' : '')}>expand_more</span>
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface-container-lowest border border-outline-variant/30 shadow-sm animate-fade-up z-50">
                <div className="px-4 py-3 border-b border-outline-variant/20">
                  <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Signed in as</div>
                  <div className="font-label text-xs text-on-surface font-medium mt-0.5 truncate">{user?.email}</div>
                </div>
                {/* Dark mode toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 py-3 font-label text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[15px]">
                      {isDark ? 'light_mode' : 'dark_mode'}
                    </span>
                    {!isDark ? 'Light Mode' : 'Dark Mode'}
                  </div>
                  <div className={clsx('w-8 h-4 rounded-full transition-all duration-300 relative flex-shrink-0', isDark ? 'bg-on-surface' : 'bg-surface-container-highest')}>
                    <div className={clsx('absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-300', isDark ? 'left-4' : 'left-0.5')} />
                  </div>
                </button>
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 font-label text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">settings</span>
                  Settings
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
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-4 md:px-8 flex-shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button className="md:hidden material-symbols-outlined text-[22px] text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => setSidebarOpen(true)}>menu</button>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant hidden sm:block">{currentNav?.icon ?? 'dashboard'}</span>
              <span className="font-headline font-semibold text-sm tracking-tight text-on-surface">{currentNav?.label ?? 'Dashboard'}</span>
            </div>
          </div>
          <Link
            href="/subscriptions/new"
            className="flex items-center gap-1.5 bg-primary text-white font-label font-bold text-[11px] uppercase tracking-widest px-3 py-2 md:px-4 hover:opacity-80 transition-opacity duration-150"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span className="hidden sm:inline">New Entry</span>
          </Link>
        </header>

        <main className="flex-1 overflow-auto pb-20 md:pb-0" onClick={() => setUserMenuOpen(false)}>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant/20 flex">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className={clsx('flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-colors', isActive ? 'text-primary' : 'text-on-surface-variant')}>
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary" />}
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="font-label text-[9px] uppercase tracking-wider">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
