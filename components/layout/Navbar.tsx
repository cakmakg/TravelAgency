"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { clsx } from "clsx";
import { navLinks, siteConfig } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={clsx(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                isScrolled ? "bg-luxury-dark/90 backdrop-blur-md py-3 border-luxury-gold/10" : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="text-2xl font-serif font-bold text-white tracking-wider flex items-center gap-2">
                    <span className="text-luxury-gold">RUSSO</span>LUX
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-gray-300 hover:text-luxury-gold transition-colors uppercase tracking-widest"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm">
                        <Phone className="w-4 h-4" />
                        <span className="hidden lg:inline">{siteConfig.phone}</span>
                    </a>
                    <LanguageSwitcher />
                    <Link href="#contact">
                        <Button variant={isScrolled ? "primary" : "outline"} size="sm">
                            Anfrage
                        </Button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-full left-0 right-0 bg-luxury-dark border-t border-white/10 p-6 flex flex-col gap-4 shadow-2xl"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-lg font-medium text-gray-200 py-2 border-b border-white/5"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Button className="w-full mt-4" onClick={() => setIsMobileMenuOpen(false)}>
                            Jetzt Anfragen
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
