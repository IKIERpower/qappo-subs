'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Supabase handles the token from URL hash automatically
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/auth/login')
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center animate-fade-up">
        <div className="w-8 h-8 border-2 border-outline-variant/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest">Verifying...</p>
      </div>
    </div>
  )
}
