import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Package } from '@/lib/models';
import { packages as defaultPackages } from '@/lib/data';
import * as z from 'zod';

// Validation schemas
const ItinerarySchema = z.object({
    day: z.string().min(1, 'Day is required'),
    title: z.string().min(1, 'Title is required'),
    desc: z.string().min(1, 'Description is required'),
});

const PackageUpdateSchema = z.object({
    packageId: z.number().int().positive('Package ID must be a positive number'),
    title: z.string().min(3, 'Title must be at least 3 characters').optional(),
    duration: z.string().min(1, 'Duration is required').optional(),
    price: z.string().min(1, 'Price is required').optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    features: z.array(z.string().min(1)).optional(),
    description: z.string().optional(),
    inclusions: z.array(z.string().min(1)).optional(),
    itinerary: z.array(ItinerarySchema).optional(),
}); // Remove .strict() to allow stripping of unknown fields like 'id'

// GET all packages
export async function GET() {
    try {
        await dbConnect();

        const packages = await Package.find({}).sort({ packageId: 1 }).lean();

        // If no packages in DB, return default data
        if (packages.length === 0) {
            return NextResponse.json(defaultPackages.map(pkg => ({
                ...pkg,
                packageId: pkg.id
            })));
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

        return NextResponse.json(formattedPackages);
    } catch (error) {
        console.error('GET packages error:', error instanceof Error ? error.message : 'Unknown error');
        // Fallback to static data if DB fails
        return NextResponse.json(defaultPackages.map(pkg => ({
            ...pkg,
            packageId: pkg.id
        })));
    }
}

// PUT update a package
export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate input
        const validation = PackageUpdateSchema.safeParse(data);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Validation error',
                    details: validation.error.issues.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                },
                { status: 400 }
            );
        }

        const { packageId, ...updateData } = validation.data;

        if (!packageId) {
            return NextResponse.json(
                { error: 'Package ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const updated = await Package.findOneAndUpdate(
            { packageId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json(
                { error: 'Package not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('PUT package error:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            { error: 'Database error' },
            { status: 500 }
        );
    }
}
