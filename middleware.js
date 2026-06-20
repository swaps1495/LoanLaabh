import { NextResponse } from 'next/server'

// Multi-domain routing: admin.loanlaabh.com→ only /admin/* paths
export function middleware(request) {
  const host = (request.headers.get('host') || '').toLowerCase()
  const url = request.nextUrl

  // Admin subdomain handling
  if (host.startsWith('admin.')) {
    // Root → redirect to /admin
    if (url.pathname === '/' || url.pathname === '') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    // Allow /admin/*, /api/*, /login, /_next/*
    const allowed = url.pathname.startsWith('/admin') ||
                    url.pathname.startsWith('/api') ||
                    url.pathname.startsWith('/login') ||
                    url.pathname.startsWith('/_next') ||
                    url.pathname.includes('.')
    if (!allowed) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
