import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Fair } from '@/lib/models';
import { fairs as defaultFairs } from '@/lib/data';
import * as z from 'zod';

// Validation schema for fair updates
const FairUpdateSchema = z.object({
    fairId: z.number().int().positive('Fair ID must be a positive number'),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    date: z.string().min(1, 'Date is required').optional(),
    category: z.string().min(1, 'Category is required').optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    fullDescription: z.string().optional(),
    venue: z.string().optional(),
    highlights: z.array(z.string().min(1)).optional(),
}).strict();

// GET all fairs
export async function GET() {
    try {
        await dbConnect();

        let fairs = await Fair.find({}).sort({ fairId: 1 });

        // If no fairs in DB, seed with default data
        if (fairs.length === 0) {
            const seedData = defaultFairs.map((fair) => ({
                fairId: fair.id,
                name: fair.name,
                date: fair.date,
                category: fair.category,
                description: fair.description,
                fullDescription: fair.fullDescription || '',
                venue: fair.venue || '',
                highlights: fair.highlights || []
            }));

            await Fair.insertMany(seedData);
            fairs = await Fair.find({}).sort({ fairId: 1 });
        }

        return NextResponse.json(fairs);
    } catch (error) {
        console.error('GET fairs error:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

// PUT update a fair
export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate input
        const validation = FairUpdateSchema.safeParse(data);
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

        const { fairId, ...updateData } = validation.data;

        if (!fairId) {
            return NextResponse.json(
                { error: 'Fair ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if fair exists first
        const existingFair = await Fair.findOne({ fairId });
        if (!existingFair) {
            return NextResponse.json(
                { error: 'Fair not found' },
                { status: 404 }
            );
        }

        const updated = await Fair.findOneAndUpdate(
            { fairId },
            updateData,
            { new: true, runValidators: true }
        );

        return NextResponse.json(updated);
    } catch (error) {
        console.error('PUT fair error:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
