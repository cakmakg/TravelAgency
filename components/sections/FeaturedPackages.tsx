"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { packages } from "@/lib/data";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

export const FeaturedPackages = () => {
    return (
        <section id="packages" className="py-24 section-dark">
            <div className="container mx-auto px-6">
                <SectionHeading
                    title="Unsere Exklusiven Pakete"
                    subtitle="Maßgeschneiderte Erlebnisse"
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
                    {packages.map((pkg, index) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-luxury-dark border border-white/5 overflow-hidden hover:border-luxury-gold/30 transition-all duration-500 h-full flex flex-col"
                        >
                            <Link href={`/packages/${pkg.id}`} className="block h-full flex flex-col">
                                <div className="relative h-64 overflow-hidden">
                                    <Image
                                        src={pkg.image}
                                        alt={pkg.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark via-transparent to-transparent opacity-80" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <span className="text-luxury-gold text-sm font-medium uppercase tracking-wider">{pkg.duration}</span>
                                        <h3 className="text-xl font-serif text-white mt-1 group-hover:text-luxury-gold transition-colors">{pkg.title}</h3>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <ul className="space-y-3 mb-8 flex-grow">
                                        {pkg.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm text-gray-400">
                                                <Check className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                                        <div className="text-white font-serif text-lg">
                                            {pkg.price}
                                            <span className="text-xs text-gray-500 font-sans block">pro Person</span>
                                        </div>
                                        <div className="border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 h-9 px-4 text-sm inline-flex items-center justify-center rounded-sm font-medium transition-all duration-300">
                                            Details
                                        </div>
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
