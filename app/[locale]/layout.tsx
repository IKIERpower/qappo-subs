import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AuthProvider } from '@/app/lib/AuthContext'
import { ThemeProvider } from '@/app/lib/ThemeContext'
import { LocaleProvider } from '@/app/lib/LocaleContext'
import type { Locale } from '@/app/lib/LocaleContext'
import { translations } from '@/app/lib/translations'

const LOCALES: Locale[] = ['en', 'pl']

export async function generateStaticParams() {
  return LOCALES.map(locale => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = translations[locale]
  return {
    title: {
      default: 'SubManager — kontroluj swoje subskrypcje',
      template: '%s | SubManager',
    },
    description: locale === 'pl'
      ? 'Zarządzaj subskrypcjami w jednym miejscu. Alerty o odnowieniach, statystyki wydatków, wielowalutowość.'
      : 'Manage subscriptions in one place. Renewal alerts, spending analytics, multi-currency support.',
    metadataBase: new URL('https://subs.qappo.pl'),
    alternates: {
      canonical: `https://subs.qappo.pl/${locale}`,
      languages: {
        'pl': 'https://subs.qappo.pl/pl',
        'en': 'https://subs.qappo.pl/en',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!LOCALES.includes(locale as Locale)) {
    notFound()
  }

  return (
    <LocaleProvider locale={locale as Locale}>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </LocaleProvider>
  )
}
