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
      console.log(
        `Middleware: No token found, redirecting to signin from ${pathname}`
      );
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    const userRole = token.role as UserRole;
    console.log(
      `Middleware: Checking access for ${pathname} with role ${userRole}`
    );

    // Check if user can access the requested route
    if (!canAccessRoute(userRole, pathname)) {
      console.log(
        `Middleware: Access denied for ${pathname} with role ${userRole}`
      );
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    console.log(
      `Middleware: Access granted for ${pathname} with role ${userRole}`
    );
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
    // Protect dashboard routes
    '/dashboard/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|public|auth).*)'
  ]
};
