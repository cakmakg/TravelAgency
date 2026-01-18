import Link from "next/link";
import { siteConfig } from "@/lib/data";
import { Facebook, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-luxury-dark border-t border-white/10 py-16">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-2">
                        <Link href="/" className="text-2xl font-serif font-bold text-white tracking-wider mb-6 block">
                            <span className="text-luxury-gold">RUSSO</span>LUX
                        </Link>
                        <p className="text-gray-400 max-w-md leading-relaxed mb-6">
                            Ihr Partner für exklusive Geschäfts- und Kulturreisen nach Russland.
                            Wir verbinden Business-Networking auf höchstem Niveau mit unvergesslichen kulturellen Erlebnissen.
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex gap-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-luxury-gold hover:border-luxury-gold/30 transition-all"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-luxury-gold hover:border-luxury-gold/30 transition-all"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-luxury-gold hover:border-luxury-gold/30 transition-all"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
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
                            <li><Link href="/impressum" className="hover:text-luxury-gold transition-colors">Impressum</Link></li>
                            <li><Link href="/datenschutz" className="hover:text-luxury-gold transition-colors">Datenschutz</Link></li>
                            <li><Link href="/agb" className="hover:text-luxury-gold transition-colors">AGB</Link></li>
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
