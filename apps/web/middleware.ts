import { type NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password']

/**
 * Route protection middleware.
 * Checks for access_token cookie; redirects unauthenticated users to /login.
 *
 * Note: cookie presence is checked here for UX only.
 * Every API request is independently verified server-side via JWT.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  const hasSession = request.cookies.has('access_token')

  if (!isPublicPath && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isPublicPath && hasSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|healthz).*)'],
}
