"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
    {
        text: "Die Organisation für unseren Messeauftritt auf der Prodexpo war makellos. Das kulturelle Rahmenprogramm hat unsere Geschäftspartner zutiefst beeindruckt.",
        author: "Dr. Thomas Müller",
        role: "CEO, TechExport GmbH",
    },
    {
        text: "Ein unvergessliches Erlebnis. Die Kombination aus Business-Networking und VIP-Zugang zur Eremitage war einzigartig.",
        author: "Sarah Weber",
        role: "Marketing Director",
    },
    {
        text: "RussoLux hat uns Türen geöffnet, die sonst verschlossen geblieben wären. Diskretion und Service auf höchstem Niveau.",
        author: "Markus Schneider",
        role: "Unternehmer",
    },
];

export const Testimonials = () => {
    return (
        <section className="py-24 section-dark relative overflow-hidden">
            <div className="container mx-auto px-6">
                <SectionHeading
                    title="Stimmen unserer Klienten"
                    subtitle="Vertrauen & Zufriedenheit"
                />

                <div className="grid md:grid-cols-3 gap-8 mt-16">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/[0.02] border border-white/5 p-8 relative"
                        >
                            <Quote className="w-8 h-8 text-luxury-gold/20 mb-6" />
                            <p className="text-gray-300 italic mb-6 leading-relaxed">
                                "{item.text}"
                            </p>
                            <div>
                                <strong className="block text-white font-serif">{item.author}</strong>
                                <span className="text-sm text-luxury-gold">{item.role}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
