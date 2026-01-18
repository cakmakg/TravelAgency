import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCORSConfig, getCORSHeaders } from '@/lib/cors';
import { getClientIP } from '@/lib/rateLimit';
import { verifySession } from '@/lib/auth';
import edgeLogger from '@/lib/logger-edge';

/**
 * Middleware for protected admin routes, authentication, CORS, and request logging
 * Validates JWT session token, handles authorization, and logs all requests
 */
export async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const requestOrigin = request.headers.get('origin');
    const corsConfig = getCORSConfig();
    const clientIP = getClientIP(request.headers);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const startTime = Date.now();

    // Log incoming request (Edge Logger - console only)
    edgeLogger.logRequest(request.method, `${pathname}${search}`, clientIP, {
        userAgent,
    });

    // Handle CORS preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
        const corsHeaders = getCORSHeaders(requestOrigin || undefined, corsConfig);
        return new NextResponse(null, {
            status: 200,
            headers: corsHeaders,
        });
    }

    // Allow GET requests to public API routes with CORS headers
    if (pathname.startsWith('/api/') && request.method === 'GET') {
        const corsHeaders = getCORSHeaders(requestOrigin || undefined, corsConfig);
        const response = NextResponse.next();
        Object.entries(corsHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        const duration = Date.now() - startTime;
        edgeLogger.logResponse(request.method, `${pathname}${search}`, 200, duration, { ip: clientIP });

        return response;
    }

    // Protect admin pages (except /admin/login)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const token = request.cookies.get('admin-session')?.value;

        if (!token) {
            edgeLogger.warn('Admin access denied: No session token', {
                context: 'AUTH',
                metadata: {
                    method: request.method,
                    url: `${pathname}${search}`,
                    ip: clientIP,
                    reason: 'no_session_token',
                },
            });
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        const session = await verifySession(token);

        if (!session) {
            edgeLogger.warn('Admin access denied: Invalid or expired session', {
                context: 'AUTH',
                metadata: {
                    method: request.method,
                    url: `${pathname}${search}`,
                    ip: clientIP,
                    reason: 'invalid_session',
                },
            });
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            response.cookies.delete('admin-session');
            return response;
        }

        edgeLogger.debug('Admin access granted', {
            context: 'AUTH',
            metadata: {
                method: request.method,
                url: `${pathname}${search}`,
                ip: clientIP,
                userId: session.username,
            },
        });

        return NextResponse.next();
    }

    // Protect admin API endpoints (except /api/auth/login)
    if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/auth/logout')) {
        const token = request.cookies.get('admin-session')?.value;
        const corsHeaders = getCORSHeaders(requestOrigin || undefined, corsConfig);

        if (!token) {
            edgeLogger.warn('Admin API access denied: No session token', {
                context: 'AUTH',
                metadata: {
                    method: request.method,
                    url: `${pathname}${search}`,
                    ip: clientIP,
                    reason: 'no_session_token',
                },
            });
            return NextResponse.json(
                { error: 'Unauthorized: No session token' },
                {
                    status: 401,
                    headers: corsHeaders,
                }
            );
        }

        const session = await verifySession(token);

        if (!session) {
            edgeLogger.warn('Admin API access denied: Invalid or expired session', {
                context: 'AUTH',
                metadata: {
                    method: request.method,
                    url: `${pathname}${search}`,
                    ip: clientIP,
                    reason: 'invalid_session',
                },
            });
            return NextResponse.json(
                { error: 'Unauthorized: Invalid or expired session' },
                {
                    status: 401,
                    headers: corsHeaders,
                }
            );
        }

        edgeLogger.debug('Admin API access granted', {
            context: 'AUTH',
            metadata: {
                method: request.method,
                url: `${pathname}${search}`,
                ip: clientIP,
                userId: session.username,
            },
        });

        // Token is valid, attach session to request for use in route handlers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-admin-session', JSON.stringify(session));

        // Add CORS headers
        Object.entries(corsHeaders).forEach(([key, value]) => {
            requestHeaders.set(key, value);
        });

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // Redirect /admin/login to /admin dashboard if already logged in
    if (pathname === '/admin/login') {
        const token = request.cookies.get('admin-session')?.value;

        if (token) {
            const session = await verifySession(token);
            if (session) {
                edgeLogger.debug('Redirecting already logged-in admin to dashboard', {
                    context: 'AUTH',
                    metadata: {
                        method: request.method,
                        url: `${pathname}${search}`,
                        ip: clientIP,
                        userId: session.username,
                    },
                });
                return NextResponse.redirect(new URL('/admin', request.url));
            } else {
                edgeLogger.debug('Clearing expired session cookie', {
                    context: 'AUTH',
                    metadata: {
                        method: request.method,
                        url: `${pathname}${search}`,
                        ip: clientIP,
                    },
                });
                const response = NextResponse.next();
                response.cookies.delete('admin-session');
                return response;
            }
        }
    }

    const response = NextResponse.next();
    const duration = Date.now() - startTime;
    edgeLogger.logResponse(request.method, `${pathname}${search}`, 200, duration, { ip: clientIP });

    return response;
}

/**
 * Routes protected by middleware
 * - /admin/* - Admin dashboard pages
 * - /api/admin/* - Admin API endpoints
 * - /api/auth/* - Auth endpoints
 * - /api/* - All API endpoints (for CORS)
 */
export const config = {
    matcher: ['/admin/:path*', '/api/:path*'],
};

