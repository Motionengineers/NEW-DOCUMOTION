import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes require admin role
    if (path.startsWith('/admin')) {
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/signin?error=Unauthorized', req.url));
      }
    }

    // Lightweight locale handling with rewrite so existing routes work
    const url = req.nextUrl;
    const { pathname } = url;
    const PUBLIC_FILE = /\.(.*)$/;
    if (
      PUBLIC_FILE.test(pathname) ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api')
    ) {
      return NextResponse.next();
    }
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
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes
        const publicRoutes = [
          '/',
          '/auth',
          '/api/auth',
          '/api/govt-schemes',
          '/api/bank-schemes',
          '/api/founders',
          '/api/pitch-decks',
        ];
        if (publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
          return true;
        }

        // In development, allow dashboard access without auth (for testing)
        // In production, require authentication
        if (
          process.env.NODE_ENV === 'development' &&
          req.nextUrl.pathname.startsWith('/dashboard')
        ) {
          // Allow access but you might want to remove this for production
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/admin/:path*'],
};
