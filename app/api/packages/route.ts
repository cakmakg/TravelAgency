import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Package } from '@/lib/models';
import { packages as defaultPackages } from '@/lib/data';
import { getClientIP, createRateLimiter, getRateLimitConfig } from '@/lib/rateLimit';

// Rate limiter: 60 requests per minute per IP for public API
const packagesLimiter = createRateLimiter(getRateLimitConfig('publicAPI', process.env.NODE_ENV === 'development'));

/**
 * GET /api/packages
 * Public endpoint to fetch all travel packages
 */
export async function GET(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const clientIP = getClientIP(request.headers);
        const rateLimitKey = `packages:${clientIP}`;

        // Check rate limit
        const rateLimitResult = packagesLimiter(rateLimitKey);
        
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

        const packages = await Package.find({}).sort({ packageId: 1 }).lean();

        // If no packages in DB, return default data
        if (packages.length === 0) {
            return NextResponse.json(
                defaultPackages.map(pkg => ({
                    ...pkg,
                    packageId: pkg.id
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

        // Map packageId to id for frontend compatibility
        const formattedPackages = packages.map((pkg: Record<string, unknown>) => ({
            id: pkg.packageId,
            packageId: pkg.packageId,
            title: pkg.title,
            duration: pkg.duration,
            price: pkg.price,
            image: pkg.image,
            features: pkg.features,
            description: pkg.description || '',
            inclusions: pkg.inclusions || [],
            itinerary: pkg.itinerary || []
        }));

        return NextResponse.json(
            formattedPackages, 
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
        console.error('GET packages error:', error instanceof Error ? error.message : 'Unknown error');
        // Fallback to static data if DB fails
        return NextResponse.json(
            defaultPackages.map(pkg => ({
                ...pkg,
                packageId: pkg.id
            })),
            { status: 200 }
        );
    }
}
