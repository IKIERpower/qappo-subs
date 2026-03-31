'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/app/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => {},
})

// Paths that don't require authentication
const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register', '/auth/reset', '/auth/callback', '/auth/update-password']

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)

            const isPublicPath = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/legal')
            if (!session && !isPublicPath) {
                router.replace('/auth/login')
            }
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)

            const isPublicPath = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/legal')
            if (!session && !isPublicPath) {
                router.replace('/auth/login')
            }
        })

        return () => subscription.unsubscribe()
    }, [router, pathname])

    useEffect(() => {
        const isPublicPath = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/legal')
        if (!loading && !user && !isPublicPath) {
            router.replace('/auth/login')
        }
    }, [loading, user, pathname, router])

    async function signOut() {
        await supabase.auth.signOut()
        router.replace('/')
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
