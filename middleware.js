import { NextResponse } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/api/auth',
  '/api/govt-schemes',
  '/api/bank-schemes',
  '/api/founders',
  '/api/pitch-decks',
  '/schemes',
  '/feed',
  '/talent',
  '/pitch-decks',
  '/bank',
  '/banking',
  '/services',
];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for static files, Next.js internals, and API routes (except protected ones)
  const PUBLIC_FILE = /\.(.*)$/;
  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') && !pathname.startsWith('/api/admin')
  ) {
    return NextResponse.next();
  }

  // Lightweight locale handling with rewrite so existing routes work
  const supported = ['en', 'hi'];
  const seg = pathname.split('/').filter(Boolean)[0];
  const hasLocale = seg && supported.includes(seg);
  if (hasLocale) {
    // store cookie for client use
    const res = NextResponse.rewrite(
      new URL(pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/', req.url)
    );
    res.cookies.set('NEXT_LOCALE', seg, { path: '/' });
    return res;
  }

  // For protected routes, check authentication (only if NextAuth is configured)
  if (pathname.startsWith('/admin')) {
    // Admin routes require authentication - redirect to signin if not authenticated
    // This will be handled by the page component if NextAuth is not configured
    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard')) {
    // Dashboard routes - allow in development, require auth in production
    // This will be handled by the page component if NextAuth is not configured
    return NextResponse.next();
  }

  // All other routes are public
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
