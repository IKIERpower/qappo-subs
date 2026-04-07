'use client'

import Link from 'next/link'

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/15">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-headline font-bold text-lg text-on-surface hover:opacity-80 transition-opacity">
          SubManager
        </Link>
        
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="font-label text-sm text-on-surface hover:text-on-surface/80 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="h-10 px-6 flex items-center justify-center font-label text-sm font-semibold text-on-primary bg-primary hover:bg-primary/85 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  )
}

