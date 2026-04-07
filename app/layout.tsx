import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/app/lib/AuthContext'
import { ThemeProvider } from '@/app/lib/ThemeContext'
import { LocaleProvider } from '@/app/lib/LocaleContext'
import { inter, spaceGrotesk, jetbrainsMono } from '@/app/lib/fonts';
import 'material-symbols/outlined.css';

export const metadata: Metadata = {
    title: {
        default: 'SubManager — kontroluj swoje subskrypcje',
        template: '%s | SubManager',
    },
    description: 'Zarządzaj subskrypcjami w jednym miejscu. Alerty o odnowieniach, statystyki wydatków, wielowalutowość.',
    keywords: ['subskrypcje', 'zarządzanie subskrypcjami', 'kontrola wydatków'],
    metadataBase: new URL('https://subs.qappo.pl'),
    alternates: {
        canonical: 'https://subs.qappo.pl',
    },
    openGraph: {
        type: 'website',
        locale: 'pl_PL',
        url: 'https://subs.qappo.pl',
        title: 'SubManager — kontroluj swoje subskrypcje',
        description: 'Zarządzaj subskrypcjami w jednym miejscu. Alerty, statystyki, wielowalutowość.',
        siteName: 'SubManager',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SubManager' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SubManager — kontroluj swoje subskrypcje',
        description: 'Zarządzaj subskrypcjami w jednym miejscu.',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
    },
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl"
          className={`
        ${inter.variable}
        ${spaceGrotesk.variable}
        ${jetbrainsMono.variable}
      `}>
      <body>
        <LocaleProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
