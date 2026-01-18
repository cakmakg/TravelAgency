import mongoose, { Schema, Document } from 'mongoose';

// Package Interface
export interface IPackage extends Document {
    packageId: number;
    title: string;
    duration: string;
    price: string;
    image: string;
    features: string[];
    description?: string;
    inclusions?: string[];
    itinerary?: Array<{ day: string; title: string; desc: string }>;
}

// Package Schema
const PackageSchema = new Schema<IPackage>({
    packageId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    features: [{ type: String }],
    description: { type: String },
    inclusions: [{ type: String }],
    itinerary: [{
        day: String,
        title: String,
        desc: String
    }]
}, { timestamps: true });

// Fair Interface
export interface IFair extends Document {
    fairId: number;
    name: string;
    date: string;
    category: string;
    description: string;
    fullDescription?: string;
    venue?: string;
    highlights?: string[];
}

// Fair Schema
const FairSchema = new Schema<IFair>({
    fairId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    fullDescription: { type: String },
    venue: { type: String },
    highlights: [{ type: String }]
}, { timestamps: true });

// Gallery Image Interface
export interface IGalleryImage extends Document {
    imageId: number;
    src: string;
    alt: string;
}

// Gallery Schema
const GalleryImageSchema = new Schema<IGalleryImage>({
    imageId: { type: Number, required: true, unique: true },
    src: { type: String, required: true },
    alt: { type: String, required: true }
}, { timestamps: true });

// Site Settings Interface
export interface ISiteSettings extends Document {
    companyName: string;
    tagline: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
}

// Site Settings Schema
const SiteSettingsSchema = new Schema<ISiteSettings>({
    companyName: { type: String, default: 'RussoLux Tours' },
    tagline: { type: String, default: 'Exklusive Geschäfts- und Kulturreisen nach Russland' },
    email: { type: String, default: 'contact@russoluxtours.com' },
    phone: { type: String, default: '+49 123 456 789' },
    address: { type: String, default: 'Musterstraße 123' },
    city: { type: String, default: 'Berlin' },
    country: { type: String, default: 'Deutschland' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    heroTitle: { type: String, default: 'Geschäfts- & Kulturreisen' },
    heroSubtitle: { type: String, default: 'für anspruchsvolle Professionals' },
    heroDescription: { type: String, default: 'Verbinden Sie Ihre geschäftlichen Ziele auf Moskauer Messen mit unvergesslichen, luxuriösen Kulturerlebnissen.' }
}, { timestamps: true });

// Export models (with Next.js hot-reload protection)
export const Package = mongoose.models.Package || mongoose.model<IPackage>('Package', PackageSchema);
export const Fair = mongoose.models.Fair || mongoose.model<IFair>('Fair', FairSchema);
export const GalleryImage = mongoose.models.GalleryImage || mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);
export const SiteSettings = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

