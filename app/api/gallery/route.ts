import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { GalleryImage } from '@/lib/models';
import { getClientIP, createRateLimiter, getRateLimitConfig } from '@/lib/rateLimit';

const defaultImages = [
    { id: 1, src: "https://images.unsplash.com/photo-1547443609-f089a6873120?auto=format&fit=crop&q=80", alt: "Moskau City Skyline bei Nacht" },
    { id: 2, src: "https://images.unsplash.com/photo-1556610961-2fecc5927173?auto=format&fit=crop&q=80", alt: "St. Petersburg Kanäle" },
    { id: 3, src: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&q=80", alt: "Basilius-Kathedrale" },
    { id: 4, src: "https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&q=80", alt: "Kreml-Mauer" },
    { id: 5, src: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80", alt: "Luxus-Limousine" },
    { id: 6, src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80", alt: "5-Sterne Hotel Suite" },
];

// Rate limiter: 60 requests per minute per IP for public API
const galleryLimiter = createRateLimiter(getRateLimitConfig('publicAPI', process.env.NODE_ENV === 'development'));

/**
 * GET /api/gallery
 * Public endpoint to fetch all gallery images
 */
export async function GET(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const clientIP = getClientIP(request.headers);
        const rateLimitKey = `gallery:${clientIP}`;

        // Check rate limit
        const rateLimitResult = galleryLimiter(rateLimitKey);
        
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

        const images = await GalleryImage.find({}).sort({ imageId: 1 }).lean();

        // If no images in DB, return default data
        if (images.length === 0) {
            return NextResponse.json(
                defaultImages, 
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

        // Map imageId to id for frontend compatibility
        const formattedImages = images.map((img: Record<string, unknown>) => ({
            id: img.imageId,
            imageId: img.imageId,
            src: img.src,
            alt: img.alt
        }));

        return NextResponse.json(
            formattedImages, 
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
        console.error('GET gallery error:', error instanceof Error ? error.message : 'Unknown error');
        // Fallback to static data if DB fails
        return NextResponse.json(defaultImages, { status: 200 });
    }
}
