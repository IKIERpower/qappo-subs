'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const type = searchParams.get('type')

    // Listen for PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/auth/update-password')
        return
      }

      if (session) {
        // Sync display_name from metadata to profiles (first login after signup)
        const metaName = session.user.user_metadata?.display_name
        if (metaName) {
          await supabase
            .from('profiles')
            .upsert(
              { id: session.user.id, display_name: metaName },
              { onConflict: 'id' }
            )
        }

        if (type === 'recovery') {
          router.replace('/auth/update-password')
        } else {
          router.replace('/dashboard')
        }
      } else {
        router.replace('/auth/login')
      }
    })

    // Fallback: check existing session after a short delay
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && type === 'recovery') {
          router.replace('/auth/update-password')
        } else if (session) {
          router.replace('/dashboard')
        } else {
          router.replace('/auth/login')
        }
      })
    }, 2000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center animate-fade-up">
        <div className="w-8 h-8 border-2 border-outline-variant/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest">Verifying...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-outline-variant/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
