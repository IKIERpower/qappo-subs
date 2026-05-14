import type { Metadata } from 'next'
import './globals.css'
import { inter, spaceGrotesk, jetbrainsMono } from '@/app/lib/fonts'
import 'material-symbols/outlined.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://subs.qappo.pl'),
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
