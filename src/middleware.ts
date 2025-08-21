import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware function runs after authentication check
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // If trying to access dashboard routes, require authentication
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*']
}
