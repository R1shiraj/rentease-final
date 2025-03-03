// src/middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from session
    const token = await getToken({ req: request });
    const isAuthenticated = !!token;

    // Extract user role with better handling for both token structures
    const userRole = token?.role as string || token?.user?.role as string;
    const isAdmin = userRole === 'ADMIN';
    const isProvider = userRole === 'PROVIDER';
    const isUser = userRole === 'USER';

    // Define public routes that don't require authentication
    const publicRoutes = [
        '/auth/login',
        '/auth/register',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/api/auth/register',
    ];

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith('/api/auth/')
    );

    // Define role-based route prefixes
    const userRoutes = ['/user'];
    const providerRoutes = ['/provider'];
    const adminRoutes = ['/admin'];

    // Handle root path redirect based on role
    if (pathname === '/' || pathname === '') {
        if (!isAuthenticated) {
            const url = new URL('/auth/login', request.url);
            return NextResponse.redirect(url);
        } else if (isAdmin) {
            return NextResponse.redirect(new URL('/admin', request.url));
        } else if (isProvider) {
            return NextResponse.redirect(new URL('/provider', request.url));
        } else if (isUser) {
            return NextResponse.redirect(new URL('/user', request.url));
        }
    }

    // 1. If user is not authenticated and trying to access a non-public route,
    // redirect to login page with callback URL
    if (!isAuthenticated && !isPublicRoute) {
        const url = new URL('/auth/login', request.url);
        url.searchParams.set('callbackUrl', encodeURI(request.url));
        return NextResponse.redirect(url);
    }

    // 2. If authenticated user is trying to access auth pages, redirect to appropriate role page
    if (isAuthenticated && publicRoutes.includes(pathname)) {
        if (isAdmin) {
            return NextResponse.redirect(new URL('/admin', request.url));
        } else if (isProvider) {
            return NextResponse.redirect(new URL('/provider', request.url));
        } else {
            return NextResponse.redirect(new URL('/user', request.url));
        }
    }

    // 3. Handle role-based access restrictions for authenticated users
    if (isAuthenticated) {
        // User routes protection - only USER role can access /user routes
        if (userRoutes.some(route => pathname.startsWith(route)) && !isUser) {
            if (isAdmin) {
                return NextResponse.redirect(new URL('/admin', request.url));
            } else if (isProvider) {
                return NextResponse.redirect(new URL('/provider', request.url));
            }
        }

        // Provider routes protection - only PROVIDER role can access /provider routes
        if (providerRoutes.some(route => pathname.startsWith(route)) && !isProvider) {
            if (isAdmin) {
                return NextResponse.redirect(new URL('/admin', request.url));
            } else if (isUser) {
                return NextResponse.redirect(new URL('/user', request.url));
            }
        }

        // Admin routes protection - only ADMIN role can access /admin routes
        if (adminRoutes.some(route => pathname.startsWith(route)) && !isAdmin) {
            if (isProvider) {
                return NextResponse.redirect(new URL('/provider', request.url));
            } else if (isUser) {
                return NextResponse.redirect(new URL('/user', request.url));
            }
        }
    }

    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * 1. /_next (Next.js internals)
         * 2. /static (static files)
         * 3. /favicon.ico, /robots.txt (public files)
         * 4. /api/auth/* (NextAuth.js authentication endpoints)
         */
        '/((?!_next|static|favicon.ico|robots.txt).*)',
    ],
};