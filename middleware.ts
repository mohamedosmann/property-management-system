import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isAuth = !!token
        const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
        const isClientRoute = req.nextUrl.pathname.startsWith("/client")
        const isHomePage = req.nextUrl.pathname === "/"

        // If on home page and authenticated, redirect to dashboard based on role
        if (isHomePage && isAuth) {
            if (token.role === "ADMIN") {
                return NextResponse.redirect(new URL("/admin", req.url))
            } else {
                return NextResponse.redirect(new URL("/client", req.url))
            }
        }

        // If on auth page and already authenticated, redirect to dashboard
        if (isAuthPage && isAuth) {
            if (token.role === "ADMIN") {
                return NextResponse.redirect(new URL("/admin", req.url))
            } else {
                return NextResponse.redirect(new URL("/client", req.url))
            }
        }

        // Protect admin routes - only admins can access
        if (isAdminRoute && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/client", req.url))
        }

        // Protect client routes - only authenticated users can access
        if (isClientRoute && token?.role !== "CLIENT" && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/auth/login", req.url))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
                const isApiRoute = req.nextUrl.pathname.startsWith("/api")

                // Allow access to auth pages and API routes
                if (isAuthPage || isApiRoute) {
                    return true
                }

                // All other routes require authentication
                return !!token
            },
        },
    }
)

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
