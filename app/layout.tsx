import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/app/lib/AuthContext'
import { ThemeProvider } from '@/app/lib/ThemeContext'

export const metadata: Metadata = {
  title: 'Subly',
  description: 'Subscription Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
