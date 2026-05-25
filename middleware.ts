import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = ['en', 'pl'] as const
type Locale = typeof LOCALES[number]
const DEFAULT_LOCALE: Locale = 'pl'

function getLocaleFromPathname(pathname: string): Locale | null {
    const segment = pathname.split('/')[1]
    return LOCALES.includes(segment as Locale) ? (segment as Locale) : null
}

function detectLocale(request: NextRequest): Locale {
    const cookie = request.cookies.get('NEXT_LOCALE')?.value
    if (cookie && LOCALES.includes(cookie as Locale)) return cookie as Locale
    const acceptLang = request.headers.get('accept-language') ?? ''
    const preferred = acceptLang.split(',')[0].split('-')[0].toLowerCase()
    if (LOCALES.includes(preferred as Locale)) return preferred as Locale
    return DEFAULT_LOCALE
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip — nie dotykaj cookies, pozwól route handler zrobić swoje
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/auth/callback') ||
        pathname.startsWith('/auth/update-password') ||
        pathname === '/favicon.ico' ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml' ||
        /\.\w+$/.test(pathname)
    ) {
        return NextResponse.next()
    }

    const localeInPath = getLocaleFromPathname(pathname)
    if (!localeInPath) {
        const locale = detectLocale(request)
        const url = request.nextUrl.clone()
        url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
        const response = NextResponse.redirect(url)
        response.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
        return response
    }

    let supabaseResponse = NextResponse.next({ request })
    supabaseResponse = await handleSupabase(request, supabaseResponse)
    supabaseResponse.cookies.set('NEXT_LOCALE', localeInPath, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return supabaseResponse
}

async function handleSupabase(request: NextRequest, baseResponse: NextResponse): Promise<NextResponse> {
    let supabaseResponse = baseResponse
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )
    await supabase.auth.getUser()
    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
