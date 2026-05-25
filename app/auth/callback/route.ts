import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = ['en', 'pl']

function getLocale(request: NextRequest): string {
    const cookie = request.cookies.get('NEXT_LOCALE')?.value
    if (cookie && LOCALES.includes(cookie)) return cookie
    const acceptLang = request.headers.get('accept-language') ?? ''
    const preferred = acceptLang.split(',')[0].split('-')[0].toLowerCase()
    return LOCALES.includes(preferred) ? preferred : 'pl'
}

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const error = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const locale = getLocale(request)

    console.log('🔐 CALLBACK DEBUG:', { code: code?.slice(0, 8), token_hash: token_hash?.slice(0, 8), type, error, errorCode, locale })

    const pendingIntent = request.cookies.get('pending_auth_intent')?.value

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )

    // Handle errors
    if (error || errorCode) {
        console.log('❌ Callback error:', { error, errorCode })
        return NextResponse.redirect(`${origin}/${locale}/auth/login?error=${error || errorCode}`)
    }

    if (code) {
        console.log('📝 Exchanging code for session...')
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (!exchangeError) {
            const isRecovery = type === 'recovery' || pendingIntent === 'recovery'
            console.log('✅ Code exchange success. isRecovery:', isRecovery)
            if (isRecovery) {
                console.log('🔄 Redirecting to update-password')
                const response = NextResponse.redirect(`${origin}/auth/update-password`)
                response.cookies.set('auth_intent', 'recovery', { path: '/', maxAge: 600, httpOnly: false })
                response.cookies.delete('pending_auth_intent')
                return response
            }
            console.log('🏠 Redirecting to dashboard')
            return NextResponse.redirect(`${origin}/${locale}/dashboard`)
        }
        console.log('❌ Code exchange failed:', exchangeError?.message)
    }

    if (token_hash && type) {
        console.log('🎟️ Processing token_hash for type:', type)
        if (type === 'recovery') {
            console.log('🔄 Recovery mode - redirecting to update-password')
            const response = NextResponse.redirect(`${origin}/auth/update-password`)
            response.cookies.set('auth_intent', 'recovery', { path: '/', maxAge: 600, httpOnly: false })
            return response
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
        if (!verifyError) {
            console.log('✅ OTP verified')
            if (type === 'email_change') {
                console.log('📧 Redirecting to settings for email change')
                return NextResponse.redirect(`${origin}/${locale}/settings`)
            }
            console.log('🏠 Redirecting to dashboard')
            return NextResponse.redirect(`${origin}/${locale}/dashboard`)
        }
        console.log('❌ OTP verification failed:', verifyError?.message)
    }

    console.log('❌ No valid callback parameters found')
    return NextResponse.redirect(`${origin}/${locale}/auth/login?error=callback_failed`)
}
