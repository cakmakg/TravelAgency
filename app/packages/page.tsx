import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
    title: "Unsere Reisepakete | RussoLux Tours",
    description: "Entdecken Sie unsere exklusiven Geschäfts- und Kulturreisen nach Russland",
};

interface PackageData {
    id: number;
    packageId?: number;
    title: string;
    duration: string;
    price: string;
    image: string;
    features: string[];
    description?: string;
}

async function getPackages(): Promise<PackageData[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
        const res = await fetch(`${baseUrl}/api/packages`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
    } catch {
        // Fallback to static import
        const { packages } = await import('@/lib/data');
        return packages;
    }
}

export default async function PackagesPage() {
    const packages = await getPackages();

    return (
        <main className="min-h-screen bg-luxury-dark">
            <Navbar />

            <div className="pt-32 pb-20">
                <div className="container mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="text-luxury-gold text-sm uppercase tracking-widest">Exklusive Erlebnisse</span>
                        <h1 className="text-4xl md:text-5xl font-serif text-white mt-4 mb-6">Unsere Reisepakete</h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Entdecken Sie unsere sorgfältig zusammengestellten Pakete für Geschäftsreisende und Kulturliebhaber.
                        </p>
                    </div>

                    {/* Packages Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {packages.map((pkg) => (
                            <Link
                                key={pkg.id || pkg.packageId}
                                href={`/packages/${pkg.id || pkg.packageId}`}
                                className="group bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-luxury-gold/30 transition-all duration-300"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <Image
                                        src={pkg.image}
                                        alt={pkg.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <span className="inline-block bg-luxury-gold text-black text-sm font-medium px-3 py-1 rounded mb-2">
                                            {pkg.price}
                                        </span>
                                        <h3 className="text-xl font-serif text-white">{pkg.title}</h3>
                                        <p className="text-gray-300 text-sm mt-1">{pkg.duration}</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {pkg.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {pkg.features.slice(0, 3).map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                                <span className="w-1.5 h-1.5 bg-luxury-gold rounded-full" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-6 text-luxury-gold text-sm font-medium group-hover:translate-x-2 transition-transform">
                                        Details ansehen →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
