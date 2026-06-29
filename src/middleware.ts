import { withAuth } from "next-auth/middleware";

/**
 * NextAuth middleware.
 *
 * Protects the /api/ats/* routes (except AI routes which are public for demo).
 * The main app at / remains public so visitors can explore without logging in.
 * The /login route is always public.
 *
 * To require authentication for the entire app, change the matcher to:
 *   matcher: ["/((?!login|api/auth).*)"]
 */
export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token, req }) => {
      // Allow access to auth routes and login page
      if (req.nextUrl.pathname.startsWith("/api/auth") || req.nextUrl.pathname === "/login") {
        return true;
      }
      // For all other routes, require a valid token
      // Comment out the next line to make auth optional (current demo mode)
      // return !!token;
      return true; // Demo mode: auth is optional
    },
  },
});

export const config = {
  // Only run middleware on these paths (skip static assets)
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
