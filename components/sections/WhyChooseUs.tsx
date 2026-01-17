"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { features } from "@/lib/data";
import { motion } from "framer-motion";

export const WhyChooseUs = () => {
    return (
        <section id="why-us" className="py-24 section-light relative">
            <div className="container mx-auto px-6">
                <SectionHeading
                    title="Warum RussoLux Tours?"
                    subtitle="Exzellenz & Diskretion"
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                            >
                                <div className="w-12 h-12 bg-luxury-gold/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Icon className="w-6 h-6 text-luxury-gold" />
                                </div>
                                <h3 className="text-xl font-serif text-white mb-4">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
