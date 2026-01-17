"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

interface SectionHeadingProps {
    title: string;
    subtitle?: string;
    centered?: boolean;
    className?: string;
}

export const SectionHeading = ({ title, subtitle, centered = true, className }: SectionHeadingProps) => {
    return (
        <div className={clsx("mb-12", centered && "text-center", className)}>
            {subtitle && (
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="block text-luxury-gold text-sm font-medium tracking-[0.2em] uppercase mb-3"
                >
                    {subtitle}
                </motion.span>
            )}
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl lg:text-5xl font-serif text-white leading-tight"
            >
                {title}
            </motion.h2>
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "60px" }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className={clsx(
                    "h-1 bg-luxury-gold mt-6",
                    centered ? "mx-auto" : ""
                )}
            />
        </div>
    );
};
