import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Definicja ścieżek publicznych
  const publicPaths = ['/', '/auth/login', '/auth/register', '/auth/reset', '/auth/callback', '/auth/update-password']
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith('/legal')

  // Nie sprawdzaj sesji dla ścieżek publicznych - to zmniejszy opóźnienia
  if (isPublicPath) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next()
          response.cookies.set(name, value, options)
        },
        remove(name: string, _options: CookieOptions) {
          response = NextResponse.next()
          response.cookies.delete(name)
        },
      },
    }
  )

  // Pobranie sesji użytkownika TYLKO dla chronionych ścieżek
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Jeśli użytkownik nie jest zalogowany na chronionych ścieżkach, redirect na login
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  } catch (error) {
    // Jeśli error w getUser, redirect na login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}



