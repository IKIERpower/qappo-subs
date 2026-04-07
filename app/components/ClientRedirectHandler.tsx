'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

/**
 * Component that handles checking user session and redirecting to dashboard
 * or login page when user clicks login/register buttons.
 * This component is used only when needed to avoid unnecessary session checks on static pages.
 */
export function ClientRedirectHandler() {
  const router = useRouter()

  // Check session on mount
  useEffect(() => {
    const checkAndRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // If user is already logged in and lands on login/register, redirect to dashboard
      if (user && (window.location.pathname === '/auth/login' || window.location.pathname === '/auth/register')) {
        router.push('/dashboard')
      }
    }

    checkAndRedirect()
  }, [router])

  return null
}

