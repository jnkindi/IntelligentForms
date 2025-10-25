import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                       req.nextUrl.pathname.startsWith('/signup');

    // Protected routes
    const protectedRoutes = [
      '/dashboard',
      '/forms',
      '/profile',
      '/add-form',
      '/manage-forms',
      '/form-replies',
    ];

    const isProtectedRoute = protectedRoutes.some(route =>
      req.nextUrl.pathname.startsWith(route)
    );

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.next();
    }

    if (isProtectedRoute && !isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/forms/:path*',
    '/profile/:path*',
    '/add-form/:path*',
    '/manage-forms/:path*',
    '/form-replies/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
  ],
};
