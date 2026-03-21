import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect routes based on user session status
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/signup') || 
                      request.nextUrl.pathname.startsWith('/reset-password') || 
                      request.nextUrl.pathname === '/'

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // Protected application routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/hub') || 
                           request.nextUrl.pathname.startsWith('/lessons')

  // Admin routes: must be authenticated AND have admin role
  if (isAdminRoute) {
    if (!user) {
      console.log('[Middleware] Admin route accessed without user, redirecting to login');
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    console.log('[Middleware] Admin route accessed by user ID:', user.id);

    // Check admin role in profiles table
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('[Middleware] Profile lookup result:', { profile, profileErr });

    if (!profile || profile.role !== 'admin') {
      console.log('[Middleware] Blocked: User does not have admin role. Re-routing to hub.');
      const url = request.nextUrl.clone()
      url.pathname = '/hub'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }

    console.log('[Middleware] Allowed: User is an admin.');
  }

  if (!user && isProtectedRoute) {
    // Redirect unauthenticated users to login if they try to access protected areas
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && !user.is_anonymous && isAuthRoute) {
    // Redirect non-anonymous (permanent) users away from auth pages to the hub
    const url = request.nextUrl.clone()
    url.pathname = '/hub'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
