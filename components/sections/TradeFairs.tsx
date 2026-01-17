"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { fairs } from "@/lib/data";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const TradeFairs = () => {
    return (
        <section id="fairs" className="py-24 section-dark relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-luxury-gold/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <SectionHeading
                    title="Messekalender Moskau 2026"
                    subtitle="Ihre Nächsten Erfolgschancen"
                />

                <div className="max-w-4xl mx-auto mt-16 space-y-8">
                    {fairs.map((fair, index) => (
                        <motion.div
                            key={fair.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group" // Moved group class here
                        >
                            <Link
                                href={`/fairs/${fair.id}`}
                                className="bg-white/[0.02] border border-white/5 p-6 md:p-8 hover:border-luxury-gold/30 transition-colors flex flex-col md:flex-row gap-6 md:items-center block"
                            >
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-luxury-gold/10 rounded-sm border border-luxury-gold/20 text-luxury-gold">
                                    <span className="text-2xl font-serif font-bold">{fair.date.split(" ")[0]}</span>
                                    <span className="text-xs uppercase tracking-wider">{fair.date.split(" ")[1]}</span>
                                </div>

                                <div className="flex-grow">
                                    <span className="text-xs text-luxury-gold uppercase tracking-widest font-medium mb-1 block">{fair.category}</span>
                                    <h3 className="text-2xl font-serif text-white mb-2 group-hover:text-luxury-gold transition-colors">{fair.name}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-4 md:mb-0">
                                        {fair.description}
                                    </p>
                                </div>

                                <div className="flex-shrink-0 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        <span>Moskau, Expocentre</span>
                                    </div>
                                    <div className="w-full border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 h-9 px-4 text-sm inline-flex items-center justify-center rounded-sm font-medium transition-all duration-300">
                                        Paket anfragen
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
