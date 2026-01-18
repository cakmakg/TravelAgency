import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { GalleryImage } from '@/lib/models';
import * as z from 'zod';

// Validation schema for gallery images
const GalleryImageSchema = z.object({
    imageId: z.number().int().positive().optional(),
    id: z.number().int().positive().optional(),
    src: z.string().url('Image URL must be a valid URL'),
    alt: z.string().min(1, 'Alt text is required').max(200, 'Alt text must be less than 200 characters'),
});

const GalleryUpdateSchema = z.array(GalleryImageSchema).min(1, 'At least one image is required');

const defaultImages = [
    { imageId: 1, src: "https://images.unsplash.com/photo-1547443609-f089a6873120?auto=format&fit=crop&q=80", alt: "Moskau City Skyline bei Nacht" },
    { imageId: 2, src: "https://images.unsplash.com/photo-1556610961-2fecc5927173?auto=format&fit=crop&q=80", alt: "St. Petersburg Kanäle" },
    { imageId: 3, src: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&q=80", alt: "Basilius-Kathedrale" },
    { imageId: 4, src: "https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&q=80", alt: "Kreml-Mauer" },
    { imageId: 5, src: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80", alt: "Luxus-Limousine" },
    { imageId: 6, src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80", alt: "5-Sterne Hotel Suite" },
];

// GET all gallery images
export async function GET() {
    try {
        await dbConnect();

        let images = await GalleryImage.find({}).sort({ imageId: 1 });

        // If no images in DB, seed with default data
        if (images.length === 0) {
            await GalleryImage.insertMany(defaultImages);
            images = await GalleryImage.find({}).sort({ imageId: 1 });
        }

        return NextResponse.json(images);
    } catch (error) {
        console.error('GET gallery error:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

// PUT update all gallery images
export async function PUT(request: NextRequest) {
    try {
        const images = await request.json();

        // Validate input
        const validation = GalleryUpdateSchema.safeParse(images);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Validation error',
                    details: validation.error.issues.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                },
                { status: 400 }
            );
        }

        await dbConnect();

        // Format and validate images before saving
        const formattedImages = validation.data.map((img, index) => {
            const imageId = img.imageId || img.id || index + 1;
            
            // Sanitize input: ensure image ID is within reasonable range
            if (imageId < 1 || imageId > 1000) {
                throw new Error(`Invalid image ID: ${imageId}. Must be between 1 and 1000`);
            }

            return {
                imageId,
                src: img.src,
                alt: img.alt
            };
        });

        // Delete all existing images and insert new ones
        await GalleryImage.deleteMany({});

        if (formattedImages.length > 0) {
            await GalleryImage.insertMany(formattedImages);
        }

        const updated = await GalleryImage.find({}).sort({ imageId: 1 });
        return NextResponse.json(updated);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('PUT gallery error:', errorMessage);
        return NextResponse.json(
            { error: 'Database error', message: errorMessage },
            { status: 500 }
        );
    }
}
