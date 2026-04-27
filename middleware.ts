import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Mbrojtja e admin — lejo vetëm /admin/login dhe /api/admin/auth
  if (
    pathname.startsWith('/admin') &&
    pathname !== '/admin/login' &&
    !pathname.startsWith('/api/admin/auth')
  ) {
    const adminToken = request.cookies.get('cineal_admin')
    const adminSecret = process.env.ADMIN_SECRET

    // Nëse nuk ka secret të konfiguruar, lejo hyrjen (dev mode)
    if (!adminSecret) {
      return NextResponse.next()
    }

    if (!adminToken || adminToken.value !== adminSecret) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
}
