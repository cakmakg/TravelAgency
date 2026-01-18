import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";

export const metadata = {
    title: "Galerie | RussoLux Tours",
    description: "Einblicke in unvergessliche Reiseerlebnisse mit RussoLux Tours",
};

interface ImageData {
    id: number;
    imageId?: number;
    src: string;
    alt: string;
}

async function getGalleryImages(): Promise<ImageData[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
        const res = await fetch(`${baseUrl}/api/gallery`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
    } catch {
        // Fallback to static images
        return [
            { id: 1, src: "https://images.unsplash.com/photo-1547443609-f089a6873120?auto=format&fit=crop&q=80", alt: "Moskau City Skyline bei Nacht" },
            { id: 2, src: "https://images.unsplash.com/photo-1556610961-2fecc5927173?auto=format&fit=crop&q=80", alt: "St. Petersburg Kanäle" },
            { id: 3, src: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&q=80", alt: "Basilius-Kathedrale" },
            { id: 4, src: "https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&q=80", alt: "Kreml-Mauer" },
            { id: 5, src: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80", alt: "Luxus-Limousine" },
            { id: 6, src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80", alt: "5-Sterne Hotel Suite" },
        ];
    }
}

export default async function GalleryPage() {
    const galleryImages = await getGalleryImages();

    return (
        <main className="min-h-screen bg-luxury-dark">
            <Navbar />

            <div className="pt-32 pb-20">
                <div className="container mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="text-luxury-gold text-sm uppercase tracking-widest">Impressionen</span>
                        <h1 className="text-4xl md:text-5xl font-serif text-white mt-4 mb-6">Galerie</h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Entdecken Sie Einblicke in unvergessliche Reiseerlebnisse unserer Gäste.
                        </p>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {galleryImages.map((image) => (
                            <div
                                key={image.id || image.imageId}
                                className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
                            >
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                                    <div className="p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <p className="text-white text-sm">{image.alt}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
