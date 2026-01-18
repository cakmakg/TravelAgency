import { NextRequest, NextResponse } from 'next/server';
import { createSession, verifyCredentials } from '@/lib/auth';
import { getClientIP, createRateLimiter, getRateLimitConfig } from '@/lib/rateLimit';
import * as z from 'zod';

// Validation schema for login request
const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

// Rate limiter: 5 attempts per 15 minutes per IP
const loginLimiter = createRateLimiter(getRateLimitConfig('login', process.env.NODE_ENV === 'development'));

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const clientIP = getClientIP(request.headers);
        const rateLimitKey = `login:${clientIP}`;

        // Check rate limit
        const rateLimitResult = loginLimiter(rateLimitKey);
        
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many login attempts',
                    message: 'Please try again later',
                    retryAfter: rateLimitResult.retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': rateLimitResult.retryAfter.toString(),
                    },
                }
            );
        }

        const body = await request.json();

        // Validate request body
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input: Email and password are required' },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        // Verify credentials using bcrypt
        const isValid = await verifyCredentials(email, password);

        if (!isValid) {
            // Log failed attempt
            console.warn(`Failed login attempt from IP: ${clientIP}, email: ${email}`);
            
            // Add delay to prevent brute force
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return NextResponse.json(
                { 
                    error: 'Invalid credentials',
                    remaining: rateLimitResult.remaining,
                },
                { status: 401 }
            );
        }

        // Create JWT session token
        const token = await createSession(email);

        // Create response with session cookie
        const response = NextResponse.json({ 
            success: true, 
            message: 'Login successful',
            email,
        });

        // Set secure session cookie
        response.cookies.set('admin-session', token, {
            httpOnly: true, // Prevent XSS attacks
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax', // CSRF protection
            maxAge: 2 * 60 * 60, // 2 hours (aligned with SESSION_EXPIRATION_HOURS)
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
