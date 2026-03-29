import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/app/lib/AuthContext'
import { ThemeProvider } from '@/app/lib/ThemeContext'
import { LocaleProvider } from '@/app/lib/LocaleContext'

export const metadata: Metadata = {
  title: 'SubManager',
  description: 'Subscription Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
