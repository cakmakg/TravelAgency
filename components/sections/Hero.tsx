"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

const heroImages = [
    {
        src: "https://images.unsplash.com/photo-1547443609-f089a6873120?auto=format&fit=crop&q=80",
        alt: "Moscow City Skyline Night"
    },
    {
        src: "https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&q=80",
        alt: "Moscow Kremlin Red Square"
    },
    {
        src: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&q=80",
        alt: "Saint Basil's Cathedral"
    }
];

export const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <section id="hero" className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
            {/* Background Image Slider */}
            <div className="absolute inset-0 z-0 select-none">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={heroImages[currentImageIndex].src}
                            alt={heroImages[currentImageIndex].alt}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark via-luxury-dark/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-black/30 z-10" />
            </div>

            <div className="container mx-auto px-6 relative z-20 text-center">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="inline-block text-luxury-gold text-lg md:text-xl font-medium tracking-[0.3em] uppercase mb-6"
                >
                    Exklusive Russland-Reisen
                </motion.span>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight mb-8"
                >
                    Geschäfts- & Kulturreisen <br />
                    <span className="italic text-gray-200">für anspruchsvolle Professionals</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    Verbinden Sie Ihre geschäftlichen Ziele auf Moskauer Messen mit
                    unvergesslichen, luxuriösen Kulturerlebnissen.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link href="#contact">
                        <Button size="lg" className="min-w-[200px]">
                            Individuelle Anfrage
                        </Button>
                    </Link>
                    <Link href="#packages">
                        <Button variant="outline" size="lg" className="min-w-[200px]">
                            Pakete entdecken
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};
