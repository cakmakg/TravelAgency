import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { SiteSettings } from '@/lib/models';
import * as z from 'zod';

// Validation schema for site settings
const SiteSettingsSchema = z.object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters').optional(),
    tagline: z.string().min(5, 'Tagline must be at least 5 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().regex(/^\+?[\d\s\-()]{6,}$/, 'Invalid phone number').optional(),
    address: z.string().min(5, 'Address must be at least 5 characters').optional(),
    city: z.string().min(2, 'City must be at least 2 characters').optional(),
    country: z.string().min(2, 'Country must be at least 2 characters').optional(),
    facebook: z.string().url('Invalid Facebook URL').or(z.string().length(0)).optional(),
    instagram: z.string().url('Invalid Instagram URL').or(z.string().length(0)).optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').or(z.string().length(0)).optional(),
    heroTitle: z.string().min(3, 'Hero title must be at least 3 characters').optional(),
    heroSubtitle: z.string().min(3, 'Hero subtitle must be at least 3 characters').optional(),
    heroDescription: z.string().min(10, 'Hero description must be at least 10 characters').optional(),
}).strict();

// GET site settings
export async function GET() {
    try {
        await dbConnect();

        let settings = await SiteSettings.findOne({});

        // If no settings exist, create default
        if (!settings) {
            settings = await SiteSettings.create({
                companyName: 'RussoLux Tours',
                tagline: 'Exklusive Geschäfts- und Kulturreisen nach Russland',
                email: 'contact@russoluxtours.com',
                phone: '+49 123 456 789',
                address: 'Musterstraße 123',
                city: 'Berlin',
                country: 'Deutschland',
                facebook: '',
                instagram: '',
                linkedin: '',
                heroTitle: 'Geschäfts- & Kulturreisen',
                heroSubtitle: 'für anspruchsvolle Professionals',
                heroDescription: 'Verbinden Sie Ihre geschäftlichen Ziele auf Moskauer Messen mit unvergesslichen, luxuriösen Kulturerlebnissen.'
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('GET settings error:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

// PUT update settings
export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate input
        const validation = SiteSettingsSchema.safeParse(data);
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

        await dbConnect();

        let settings = await SiteSettings.findOne({});

        if (!settings) {
            // Create new settings if none exist
            settings = await SiteSettings.create(validation.data);
        } else {
            // Update existing settings
            Object.assign(settings, validation.data);
            await settings.save();
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('PUT settings error:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            { error: 'Database error' },
            { status: 500 }
        );
    }
}
