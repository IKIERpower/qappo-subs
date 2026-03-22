import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/app/lib/AuthContext'

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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
