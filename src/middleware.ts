import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { canAccessRoute } from '@/config/routes';
import { UserRole } from '@/lib/authUtils';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Allow root path to pass through without authentication
    if (pathname === '/') {
      return NextResponse.next();
    }

    // If no token, redirect to signin
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    const userRole = token.role as UserRole;

    // Check if user can access the requested route
    if (!canAccessRoute(userRole, pathname)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token // Require authentication for all protected routes
    }
  }
);

// Configure which routes to protect - be more specific
export const config = {
  matcher: [
    // Only protect dashboard routes and other specific protected paths
    '/dashboard/:path*',
    '/unauthorized',
    '/profile',
    '/settings'
  ]
};
