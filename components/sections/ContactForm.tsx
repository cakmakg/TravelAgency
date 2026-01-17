"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "Name ist erforderlich"),
    company: z.string().optional(),
    email: z.string().email("Ungültige E-Mail-Adresse"),
    phone: z.string().min(6, "Telefonnummer ist erforderlich"),
    interest: z.string().min(1, "Bitte wählen Sie ein Interesse"),
    message: z.string().min(10, "Nachricht muss mindestens 10 Zeichen lang sein"),
});

type FormData = z.infer<typeof formSchema>;

export const ContactForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setSubmitStatus("idle");

        try {
            const response = await fetch("/api/inquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Fehler beim Senden");

            setSubmitStatus("success");
            reset();
        } catch (error) {
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-24 section-light relative">
            <div className="container mx-auto px-6 max-w-4xl">
                <SectionHeading
                    title="Ihre Reise beginnt hier"
                    subtitle="Kontaktieren Sie uns"
                />

                <div className="mt-12 bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-sm shadow-2xl">
                    {submitStatus === "success" ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                            <h3 className="text-2xl font-serif text-white mb-4">Anfrage versendet</h3>
                            <p className="text-gray-400">Vielen Dank! Wir werden uns in Kürze bei Ihnen melden.</p>
                            <Button
                                variant="outline"
                                className="mt-8"
                                onClick={() => setSubmitStatus("idle")}
                            >
                                Neue Anfrage
                            </Button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Name *</label>
                                    <input
                                        {...register("name")}
                                        className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-luxury-gold focus:outline-none transition-colors"
                                    />
                                    {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                                </div>
                                <div>
                                    <label htmlFor="company" className="block text-sm font-medium text-gray-400 mb-2">Firma</label>
                                    <input
                                        {...register("company")}
                                        className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-luxury-gold focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">E-Mail *</label>
                                    <input
                                        {...register("email")}
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-luxury-gold focus:outline-none transition-colors"
                                    />
                                    {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">Telefon *</label>
                                    <input
                                        {...register("phone")}
                                        className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-luxury-gold focus:outline-none transition-colors"
                                    />
                                    {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone.message}</span>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="interest" className="block text-sm font-medium text-gray-400 mb-2">Interesse *</label>
                                <select
                                    {...register("interest")}
                                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-luxury-gold focus:outline-none transition-colors [&>option]:bg-luxury-dark"
                                >
                                    <option value="">Bitte wählen...</option>
                                    <option value="package">Pauschalreise</option>
                                    <option value="fair">Messe-Support</option>
                                    <option value="custom">Individuelle Planung</option>
                                </select>
                                {errors.interest && <span className="text-red-500 text-xs mt-1">{errors.interest.message}</span>}
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Nachricht *</label>
                                <textarea
                                    {...register("message")}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-luxury-gold focus:outline-none transition-colors"
                                />
                                {errors.message && <span className="text-red-500 text-xs mt-1">{errors.message.message}</span>}
                            </div>

                            {submitStatus === "error" && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Es gab einen Fehler beim Senden. Bitte versuchen Sie es später erneut.</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Wird gesendet..." : "Anfrage absenden"}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};
