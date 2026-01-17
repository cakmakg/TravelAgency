import Link from "next/link";
import { siteConfig } from "@/lib/data";

export const Footer = () => {
    return (
        <footer className="bg-luxury-dark border-t border-white/10 py-16">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-2">
                        <Link href="/" className="text-2xl font-serif font-bold text-white tracking-wider mb-6 block">
                            <span className="text-luxury-gold">RUSSO</span>LUX
                        </Link>
                        <p className="text-gray-400 max-w-md leading-relaxed">
                            Ihr Partner für exklusive Geschäfts- und Kulturreisen nach Russland.
                            Wir verbinden Business-Networking auf höchstem Niveau mit unvergesslichen kulturellen Erlebnissen.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-serif text-lg mb-6">Kontakt</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li>{siteConfig.phone}</li>
                            <li>{siteConfig.email}</li>
                            <li>Berlin, Deutschland</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-serif text-lg mb-6">Rechtliches</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link href="#" className="hover:text-luxury-gold transition-colors">Impressum</Link></li>
                            <li><Link href="#" className="hover:text-luxury-gold transition-colors">Datenschutz</Link></li>
                            <li><Link href="#" className="hover:text-luxury-gold transition-colors">AGB</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-gray-600 text-sm">
                    &copy; {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.
                </div>
            </div>
        </footer>
    );
};
