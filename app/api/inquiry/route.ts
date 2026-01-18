import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import * as z from "zod";
import { getClientIP, createRateLimiter, getRateLimitConfig } from "@/lib/rateLimit";

// Validation schema for inquiry
const InquirySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    company: z.string().optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\+?[\d\s\-()]{6,}$/, "Invalid phone number"),
    interest: z.string().min(1, "Please select an interest"),
    message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message must be less than 5000 characters"),
});

type InquiryData = z.infer<typeof InquirySchema>;

// Rate limiter: 10 inquiries per hour per IP
const inquiryLimiter = createRateLimiter(getRateLimitConfig('inquiry', process.env.NODE_ENV === 'development'));

export async function POST(req: NextRequest) {
    try {
        // Get client IP for rate limiting
        const clientIP = getClientIP(req.headers);
        const rateLimitKey = `inquiry:${clientIP}`;

        // Check rate limit
        const rateLimitResult = inquiryLimiter(rateLimitKey);
        
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many inquiries',
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

        const body = await req.json();

        // Validate request body
        const validation = InquirySchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: "Validation error",
                    details: validation.error.issues.map(e => ({
                        field: e.path.join("."),
                        message: e.message
                    }))
                },
                { status: 400 }
            );
        }

        const inquiryData: InquiryData = validation.data;

        // TODO: Implement actual email sending
        // Options:
        // 1. Use Resend API (npm install resend)
        // 2. Use SendGrid
        // 3. Use your own SMTP server
        
        // Log the inquiry with IP
        console.log("New inquiry received:", {
            timestamp: new Date().toISOString(),
            ip: clientIP,
            ...inquiryData
        });

        // TODO: Save to database
        // const inquiry = await Inquiry.create({
        //     ...inquiryData,
        //     ipAddress: clientIP,
        //     userAgent: req.headers.get('user-agent'),
        //     timestamp: new Date(),
        // });

        // Simulate email sending delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        return NextResponse.json(
            {
                success: true,
                message: "Inquiry submitted successfully. We will contact you soon.",
                remaining: rateLimitResult.remaining,
                // In production, you might want to return an inquiry ID
                // inquiryId: inquiry._id
            },
            { status: 201 }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Inquiry error:", errorMessage);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
