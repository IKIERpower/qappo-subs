import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/app/lib/AuthContext'

export const metadata: Metadata = {
  title: 'Precision Editorial — Financial Architect',
  description: 'Subscription ledger & financial analytics dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
