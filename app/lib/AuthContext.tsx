'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useMemo, useCallback } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/app/lib/supabase'
const supabase = getSupabaseBrowserClient()
import { useRouter, usePathname } from 'next/navigation'
import { LOCALES } from '@/app/lib/LocaleContext'
import type { Locale } from '@/app/lib/LocaleContext'

const INACTIVITY_TIMEOUT_MS = 8 * 60 * 60 * 1000 // 8 godzin
const INACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const
const LAST_ACTIVE_KEY = 'submanager_last_active'

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

const PUBLIC_PATH_SEGMENTS = ['', 'auth', 'legal']

function getLocaleFromPathname(pathname: string): Locale {
    const segment = pathname.split('/')[1]
    return LOCALES.includes(segment as Locale) ? (segment as Locale) : 'pl'
}

function isPublicPath(pathname: string): boolean {
    const parts = pathname.split('/')
    const withoutLocale = LOCALES.includes(parts[1] as Locale)
        ? '/' + parts.slice(2).join('/')
        : pathname
    const firstSegment = withoutLocale.split('/')[1] ?? ''
    return PUBLIC_PATH_SEGMENTS.includes(firstSegment)
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [initialized, setInitialized] = useState(false)
    const [displayName, setDisplayNameState] = useState('')
    const displayNameLoadedRef = useRef(false)
    const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const router = useRouter()
    const pathname = usePathname()

    // --- Inactivity timeout ---

    const handleInactivitySignOut = useCallback(async () => {
        const locale = getLocaleFromPathname(window.location.pathname)
        await supabase.auth.signOut()
        localStorage.removeItem(LAST_ACTIVE_KEY)
        router.replace(`/${locale}/auth/login`)
    }, [router])

    const resetInactivityTimer = useCallback(() => {
        localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = setTimeout(handleInactivitySignOut, INACTIVITY_TIMEOUT_MS)
    }, [handleInactivitySignOut])

    // Start/stop inactivity tracking based on user login state
    useEffect(() => {
        if (!user) {
            // User not logged in - clear everything
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
            INACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, resetInactivityTimer))
            return
        }

        // Check if already inactive since last visit
        const lastActive = localStorage.getItem(LAST_ACTIVE_KEY)
        if (lastActive) {
            const elapsed = Date.now() - parseInt(lastActive, 10)
            if (elapsed > INACTIVITY_TIMEOUT_MS) {
                handleInactivitySignOut()
                return
            }
        }

        // Start tracking
        resetInactivityTimer()
        INACTIVITY_EVENTS.forEach(e => window.addEventListener(e, resetInactivityTimer, { passive: true }))

        return () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
            INACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, resetInactivityTimer))
        }
    }, [user, resetInactivityTimer, handleInactivitySignOut])

    // --- Auth init ---

    useEffect(() => {
        let isMounted = true
        const initializeAuth = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (isMounted) {
                    setSession(null)
                    setUser(user ?? null)
                    setLoading(false)
                    setInitialized(true)
                }
            } catch {
                if (isMounted) {
                    setLoading(false)
                    setInitialized(true)
                }
            }
        }
        initializeAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                setSession(session)
                setUser(session?.user ?? null)
            }
        })

        return () => {
            isMounted = false
            subscription.unsubscribe()
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
            } catch {
                if (isMounted) setDisplayNameState(user!.email?.split('@')[0] || '')
            }
        }
        loadDisplayName()
        return () => { isMounted = false }
    }, [user?.id])

    useEffect(() => {
        if (!initialized || loading) return
        if (!user && !isPublicPath(pathname)) {
            const locale = getLocaleFromPathname(pathname)
            router.replace(`/${locale}/auth/login`)
        }
    }, [initialized, loading, user, pathname, router])

    async function setDisplayName(name: string) {
        if (!user) return
        try {
            await supabase.from('profiles').upsert({ id: user.id, display_name: name }, { onConflict: 'id' })
            setDisplayNameState(name)
        } catch (error) {
            console.error('Error saving display name:', error)
        }
    }

    async function signOut() {
        const locale = getLocaleFromPathname(pathname)
        localStorage.removeItem(LAST_ACTIVE_KEY)
        await supabase.auth.signOut()
        setDisplayNameState('')
        displayNameLoadedRef.current = false
        router.replace(`/${locale}`)
    }

    const value = useMemo(
        () => ({ user, session, loading, displayName, setDisplayName, signOut }),
        [user, session, loading, displayName]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    return useContext(AuthContext)
}
