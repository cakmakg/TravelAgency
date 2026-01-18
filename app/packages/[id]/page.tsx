import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Check, Calendar, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ItineraryItem {
    day: string;
    title: string;
    desc: string;
}

interface PackageData {
    id?: number;
    packageId?: number;
    title: string;
    duration: string;
    price: string;
    image: string;
    features: string[];
    description?: string;
    inclusions?: string[];
    itinerary?: ItineraryItem[];
}

async function getPackage(id: string): Promise<PackageData | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
        const res = await fetch(`${baseUrl}/api/packages`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const packages: PackageData[] = await res.json();
        return packages.find((p) => (p.id || p.packageId) === parseInt(id)) || null;
    } catch {
        // Fallback to static data
        const { packages } = await import('@/lib/data');
        return packages.find((p) => p.id === parseInt(id)) || null;
    }
}

export default async function PackagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pkg = await getPackage(id);

    if (!pkg) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-luxury-dark text-gray-100 selection:bg-luxury-gold selection:text-black">
            <Navbar />

            {/* Hero Header */}
            <section className="relative h-[60vh] flex items-center justify-center">
                <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center container px-6">
                    <span className="text-luxury-gold uppercase tracking-widest text-sm font-medium mb-4 block">Exklusives Paket</span>
                    <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">{pkg.title}</h1>
                    <div className="flex items-center justify-center gap-6 text-gray-200">
                        <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-luxury-gold" /> {pkg.duration}</span>
                        <span className="flex items-center gap-2"><Star className="w-5 h-5 text-luxury-gold" /> 5-Sterne Service</span>
                    </div>
                </div>
            </section>

            <section className="py-24 container mx-auto px-6">
                <div className="grid lg:grid-cols-3 gap-16">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">

                        {/* Description */}
                        <div>
                            <h2 className="text-3xl font-serif text-white mb-6">Überblick</h2>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                {pkg.description || "Keine Beschreibung verfügbar."}
                            </p>
                        </div>

                        {/* Inclusions */}
                        {pkg.inclusions && pkg.inclusions.length > 0 && (
                            <div>
                                <h2 className="text-3xl font-serif text-white mb-6">Inklusivleistungen</h2>
                                <div className="bg-white/5 border border-white/10 p-8 rounded-sm">
                                    <ul className="grid sm:grid-cols-2 gap-4">
                                        {pkg.inclusions.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-gray-300">
                                                <Check className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Itinerary */}
                        {pkg.itinerary && pkg.itinerary.length > 0 && (
                            <div>
                                <h2 className="text-3xl font-serif text-white mb-6">Reiseverlauf</h2>
                                <div className="space-y-8 border-l border-white/10 pl-8 relative">
                                    {pkg.itinerary.map((day, idx) => (
                                        <div key={idx} className="relative">
                                            <span className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-luxury-gold border-4 border-luxury-dark" />
                                            <span className="text-luxury-gold text-sm font-medium uppercase tracking-wider mb-2 block">{day.day}</span>
                                            <h3 className="text-xl font-serif text-white mb-2">{day.title}</h3>
                                            <p className="text-gray-400">{day.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#0f0f1a] border border-white/10 p-8 sticky top-24">
                            <div className="text-3xl font-serif text-white mb-2">{pkg.price}</div>
                            <div className="text-gray-400 text-sm mb-8">pro Person (Doppelbelegung)</div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-luxury-gold" />
                                    <span>Sofortige Verfügbarkeit</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-luxury-gold" />
                                    <span>Kostenlose Stornierung (48h)</span>
                                </div>
                            </div>

                            <Link href="/contact" className="block">
                                <Button className="w-full" size="lg">Jetzt Anfragen</Button>
                            </Link>
                            <div className="text-center mt-4">
                                <span className="text-xs text-gray-500">Keine Kreditkarte erforderlich. Unverbindliche Anfrage.</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </main>
    );
}
