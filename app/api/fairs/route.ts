import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Fair } from '@/lib/models';
import { fairs as defaultFairs } from '@/lib/data';
import { getClientIP, createRateLimiter, getRateLimitConfig } from '@/lib/rateLimit';

// Rate limiter: 60 requests per minute per IP for public API
const fairsLimiter = createRateLimiter(getRateLimitConfig('publicAPI', process.env.NODE_ENV === 'development'));

/**
 * GET /api/fairs
 * Public endpoint to fetch all trade fairs
 */
export async function GET(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const clientIP = getClientIP(request.headers);
        const rateLimitKey = `fairs:${clientIP}`;

        // Check rate limit
        const rateLimitResult = fairsLimiter(rateLimitKey);
        
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many requests',
                    message: 'Rate limit exceeded',
                    retryAfter: rateLimitResult.retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': rateLimitResult.retryAfter.toString(),
                        'X-RateLimit-Limit': '60',
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
                    },
                }
            );
        }

        await dbConnect();

        const fairs = await Fair.find({}).sort({ fairId: 1 }).lean();

        // If no fairs in DB, return default data
        if (fairs.length === 0) {
            return NextResponse.json(
                defaultFairs.map(fair => ({
                    ...fair,
                    fairId: fair.id
                })),
                { 
                    status: 200,
                    headers: {
                        'X-RateLimit-Limit': '60',
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
                    }
                }
            );
        }

        // Map fairId to id for frontend compatibility
        const formattedFairs = fairs.map((fair: Record<string, unknown>) => ({
            id: fair.fairId,
            fairId: fair.fairId,
            name: fair.name,
            date: fair.date,
            category: fair.category,
            description: fair.description,
            fullDescription: fair.fullDescription || '',
            venue: fair.venue || '',
            highlights: fair.highlights || []
        }));

        return NextResponse.json(
            formattedFairs, 
            { 
                status: 200,
                headers: {
                    'X-RateLimit-Limit': '60',
                    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                    'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
                }
            }
        );
    } catch (error) {
        console.error('GET fairs error:', error instanceof Error ? error.message : 'Unknown error');
        // Fallback to static data if DB fails
        return NextResponse.json(
            defaultFairs.map(fair => ({
                ...fair,
                fairId: fair.id
            })),
            { status: 200 }
        );
    }
}
