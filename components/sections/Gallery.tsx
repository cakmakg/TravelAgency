"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { motion } from "framer-motion";
import Image from "next/image";

const images = [
    "https://images.unsplash.com/photo-1547443609-f089a6873120?auto=format&fit=crop&q=80", // Moscow City
    "https://images.unsplash.com/photo-1556610961-2fecc5927173?auto=format&fit=crop&q=80", // St Petersburg
    "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&q=80", // Architecture
    "https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&q=80", // Kremlin
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80", // Car
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80", // Hotel Interior
];

export const Gallery = () => {
    return (
        <section id="gallery" className="py-24 section-light">
            <div className="container mx-auto px-6">
                <SectionHeading
                    title="Impressionen"
                    subtitle="Einblicke in eine andere Welt"
                />

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-16">
                    {images.map((src, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative h-64 md:h-80 overflow-hidden rounded-sm group"
                        >
                            <Image
                                src={src}
                                alt={`Impression ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
