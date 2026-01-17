import { fairs } from "@/lib/data";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
    return fairs.map((fair) => ({
        id: fair.id.toString(),
    }));
}

export default async function FairPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const fair = fairs.find((f) => f.id === parseInt(id));

    if (!fair) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-luxury-dark text-gray-100 selection:bg-luxury-gold selection:text-black">
            <Navbar />

            <section className="relative h-[50vh] flex items-center justify-center bg-[#0a0a14]">
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-dark/80 to-luxury-dark/80 z-10" />
                {/* Placeholder Pattern Background */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 text-center container px-6">
                    <span className="text-luxury-gold uppercase tracking-widest text-sm font-medium mb-4 block">{fair.category}</span>
                    <h1 className="text-4xl md:text-7xl font-serif text-white mb-8">{fair.name}</h1>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-gray-200">
                        <span className="flex items-center gap-2 bg-white/5 py-2 px-4 rounded-full border border-white/10">
                            <Calendar className="w-5 h-5 text-luxury-gold" /> {fair.date}
                        </span>
                        <span className="flex items-center gap-2 bg-white/5 py-2 px-4 rounded-full border border-white/10">
                            <MapPin className="w-5 h-5 text-luxury-gold" /> {fair.venue}
                        </span>
                    </div>
                </div>
            </section>

            <section className="py-24 container mx-auto px-6 max-w-4xl">
                <div className="space-y-12">
                    <div>
                        <h2 className="text-3xl font-serif text-white mb-6">Über die Messe</h2>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {fair.fullDescription}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white/5 border border-white/10 p-8">
                            <h3 className="text-xl font-serif text-white mb-4">Highlights</h3>
                            <ul className="space-y-3">
                                {fair.highlights?.map((h, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-400">
                                        <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" />
                                        <span>{h}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-luxury-gold/5 border border-luxury-gold/10 p-8 flex flex-col justify-center text-center">
                            <h3 className="text-xl font-serif text-white mb-4">Planen Sie Ihren Besuch?</h3>
                            <p className="text-gray-400 mb-6 text-sm">
                                Wir organisieren Ihre komplette Reise: Flug, Hotel, VIP-Tickets und Dolmetscher.
                            </p>
                            <Link href="/#contact">
                                <Button className="w-full">Individuelles Angebot</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
