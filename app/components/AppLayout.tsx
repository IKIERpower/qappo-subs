'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import clsx from 'clsx'
import { useAuth } from '@/app/lib/AuthContext'

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/subscriptions', icon: 'subscriptions', label: 'Subscriptions' },
  { href: '/analytics', icon: 'analytics', label: 'Analytics' },
  { href: '/alerts', icon: 'notifications', label: 'Alerts' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Derive display name from email
  const displayName = user?.email?.split('@')[0] ?? '—'
  const initials = displayName.slice(0, 2).toUpperCase()

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
  }

  // Show nothing while auth loads to avoid flash
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-outline-variant/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] min-w-[240px] h-screen bg-surface-container-low flex flex-col">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-outline-variant/20">
          <div className="font-headline font-bold text-lg tracking-tighter text-on-surface">Subly</div>
          <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">Subscription Manager</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 transition-all duration-150 group relative',
                  isActive
                    ? 'text-on-surface font-semibold bg-surface-container-high'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary" />
                )}
                <span className={clsx(
                  'material-symbols-outlined text-[20px] transition-transform duration-150 group-hover:scale-105',
                  isActive ? 'text-on-surface' : 'text-on-surface-variant'
                )}>
                  {item.icon}
                </span>
                <span className="font-label text-sm tracking-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-outline-variant/20">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container transition-colors group"
            >
              <div className="w-7 h-7 bg-primary flex items-center justify-center font-label font-bold text-[11px] text-white flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-headline font-semibold text-xs text-on-surface truncate">{user?.email ?? '—'}</div>
                <div className="font-label text-[9px] uppercase tracking-widest text-secondary">Authenticated</div>
              </div>
              <span className={clsx(
                'material-symbols-outlined text-[14px] text-on-surface-variant transition-transform duration-150',
                userMenuOpen ? 'rotate-180' : ''
              )}>expand_more</span>
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface-container-lowest border border-outline-variant/30 shadow-sm animate-fade-up z-50">
                <div className="px-4 py-3 border-b border-outline-variant/20">
                  <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Signed in as</div>
                  <div className="font-label text-xs text-on-surface font-medium mt-0.5 truncate">{user?.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-2 px-4 py-3 font-label text-xs text-on-surface-variant hover:text-tertiary hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  {signingOut ? (
                    <span className="w-3.5 h-3.5 border-2 border-outline-variant/30 border-t-on-surface-variant rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[15px]">logout</span>
                  )}
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-8 flex-shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              {navItems.find(n => pathname.startsWith(n.href))?.icon ?? 'dashboard'}
            </span>
            <span className="font-headline font-semibold text-sm tracking-tight text-on-surface">
              {navItems.find(n => pathname.startsWith(n.href))?.label ?? 'Dashboard'}
            </span>
          </div>
          <Link
            href="/subscriptions/new"
            className="flex items-center gap-2 bg-primary text-white font-label font-bold text-[11px] uppercase tracking-widest px-4 py-2 hover:bg-on-surface transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            New Entry
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto" onClick={() => setUserMenuOpen(false)}>
          {children}
        </main>
      </div>
    </div>
  )
}
