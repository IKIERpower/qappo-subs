import Link from 'next/link'

/**
 * Minimal navbar for landing page - Server Component
 * No client hooks, no context, no initialization delays
 */
export default function LandingNavbar() {
  return (
    <header className="z-50 w-full sticky top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant/15 transition-all">
      <div className="mx-auto px-6 h-16 flex items-center justify-between max-w-6xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-headline font-bold text-lg tracking-tighter text-on-surface">
            SubManager
          </span>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Divider */}
          <div className="w-px h-6 bg-outline-variant/25 mx-1 hidden sm:block" />

          {/* Auth buttons - always show on landing */}
          <Link
            href="/auth/login"
            className="h-9 px-4 items-center font-label text-xs font-semibold tracking-wide uppercase text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 transition-colors hidden sm:flex"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="h-9 px-4 flex items-center font-label text-xs font-semibold tracking-wide uppercase text-on-primary bg-primary hover:bg-primary/85 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}


