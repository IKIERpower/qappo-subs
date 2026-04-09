'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useMemo } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/app/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    displayName: string
    setDisplayName: (name: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    displayName: '',
    setDisplayName: async () => {},
    signOut: async () => {},
})

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register', '/auth/reset', '/auth/callback', '/auth/update-password']

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [initialized, setInitialized] = useState(false)
    const [displayName, setDisplayNameState] = useState('')
    const displayNameLoadedRef = useRef(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        let isMounted = true
        let sessionCheckInterval: NodeJS.Timeout
        
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (isMounted) {
                    setSession(session)
                    setUser(session?.user ?? null)
                    setLoading(false)
                    setInitialized(true)
                }
            } catch (error) {
                if (isMounted) {
                    setLoading(false)
                    setInitialized(true)
                }
            }
        }

        initializeAuth()

        // Check session validity every 5 minutes
        sessionCheckInterval = setInterval(async () => {
            if (!isMounted) return
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (isMounted) {
                    setSession(session)
                    setUser(session?.user ?? null)
                }
            } catch (error) {
                console.error('Session validation error:', error)
            }
        }, 5 * 60 * 1000)

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                setSession(session)
                setUser(session?.user ?? null)
            }
        })

        return () => {
            isMounted = false
            subscription.unsubscribe()
            clearInterval(sessionCheckInterval)
        }
    }, [])

    useEffect(() => {
        if (!user || displayNameLoadedRef.current) return
        
        displayNameLoadedRef.current = true
        let isMounted = true
        
        async function loadDisplayName() {
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('id', user!.id)
                    .single()
                if (isMounted) {
                    setDisplayNameState(data?.display_name || user!.email?.split('@')[0] || '')
                }
            } catch (error) {
                if (isMounted) {
                    setDisplayNameState(user!.email?.split('@')[0] || '')
                }
            }
        }
        loadDisplayName()
        return () => { isMounted = false }
    }, [user?.id])

    useEffect(() => {
        if (!initialized || loading) return
        
        const isPublicPath = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/legal')
        if (!user && !isPublicPath) {
            router.replace('/auth/login')
        }
    }, [initialized, loading, user, pathname, router])

    async function setDisplayName(name: string) {
        if (!user) return
        try {
            await supabase
                .from('profiles')
                .upsert({ id: user.id, display_name: name }, { onConflict: 'id' })
            setDisplayNameState(name)
        } catch (error) {
            console.error('Error saving display name:', error)
        }
    }

    async function signOut() {
        await supabase.auth.signOut()
        setDisplayNameState('')
        displayNameLoadedRef.current = false
        router.replace('/')
    }

    const value = useMemo(
        () => ({ user, session, loading, displayName, setDisplayName, signOut }),
        [user, session, loading, displayName]
    )

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
