import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Calendar, MapPin, Tag } from "lucide-react";

export const metadata = {
    title: "Messen 2026 | RussoLux Tours",
    description: "Die wichtigsten Fachmessen in Moskau 2026 - Prodexpo, TransRussia, Neftegaz und mehr",
};

interface FairData {
    id: number;
    fairId?: number;
    name: string;
    date: string;
    category: string;
    description: string;
    fullDescription?: string;
    venue?: string;
}

async function getFairs(): Promise<FairData[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
        const res = await fetch(`${baseUrl}/api/fairs`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
    } catch {
        // Fallback to static import
        const { fairs } = await import('@/lib/data');
        return fairs;
    }
}

export default async function FairsPage() {
    const fairs = await getFairs();

    return (
        <main className="min-h-screen bg-luxury-dark">
            <Navbar />

            <div className="pt-32 pb-20">
                <div className="container mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="text-luxury-gold text-sm uppercase tracking-widest">Business Events</span>
                        <h1 className="text-4xl md:text-5xl font-serif text-white mt-4 mb-6">Messen 2026</h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Besuchen Sie die wichtigsten internationalen Fachmessen in Moskau mit unserem VIP-Service.
                        </p>
                    </div>

                    {/* Fairs List */}
                    <div className="space-y-6">
                        {fairs.map((fair) => (
                            <Link
                                key={fair.id || fair.fairId}
                                href={`/fairs/${fair.id || fair.fairId}`}
                                className="group block bg-white/5 border border-white/10 rounded-lg p-6 hover:border-luxury-gold/30 transition-all duration-300"
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    {/* Date Badge */}
                                    <div className="shrink-0 w-24 h-24 bg-luxury-gold/10 border border-luxury-gold/30 rounded-lg flex flex-col items-center justify-center">
                                        <Calendar className="w-6 h-6 text-luxury-gold mb-1" />
                                        <span className="text-white font-medium text-sm text-center">{fair.date}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-serif text-white group-hover:text-luxury-gold transition-colors">
                                            {fair.name}
                                        </h3>
                                        <p className="text-gray-400 mt-2">{fair.description}</p>

                                        <div className="flex flex-wrap gap-4 mt-4">
                                            <span className="flex items-center gap-2 text-sm text-gray-300">
                                                <Tag className="w-4 h-4 text-luxury-gold" />
                                                {fair.category}
                                            </span>
                                            {fair.venue && (
                                                <span className="flex items-center gap-2 text-sm text-gray-300">
                                                    <MapPin className="w-4 h-4 text-luxury-gold" />
                                                    {fair.venue}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <div className="shrink-0 text-luxury-gold group-hover:translate-x-2 transition-transform">
                                        →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-16 text-center">
                        <p className="text-gray-400 mb-6">Interessiert an einer Messe? Wir organisieren Ihren kompletten Besuch.</p>
                        <Link
                            href="/contact"
                            className="inline-block bg-luxury-gold text-black font-medium px-8 py-4 rounded-lg hover:bg-luxury-gold-hover transition-colors"
                        >
                            Jetzt anfragen
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
