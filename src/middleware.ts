import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { canAccessRoute } from '@/config/routes';
import { UserRole } from '@/lib/authUtils';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

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

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes (signin, signup)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|auth/signin|auth/signup).*)'
  ]
};
