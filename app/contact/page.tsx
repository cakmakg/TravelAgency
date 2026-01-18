import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/sections/ContactForm";

export const metadata = {
    title: "Kontakt | RussoLux Tours",
    description: "Kontaktieren Sie uns für Ihre exklusive Russland-Reise",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-luxury-dark">
            <Navbar />

            <div className="pt-32 pb-20">
                <div className="container mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="text-luxury-gold text-sm uppercase tracking-widest">Wir freuen uns auf Sie</span>
                        <h1 className="text-4xl md:text-5xl font-serif text-white mt-4 mb-6">Kontakt</h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Haben Sie Fragen oder möchten Sie eine Reise planen? Wir beraten Sie gerne persönlich.
                        </p>
                    </div>

                    {/* Contact Info + Form */}
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                                <h3 className="text-lg font-serif text-white mb-4">Unsere Kontaktdaten</h3>
                                <div className="space-y-4 text-gray-300">
                                    <div>
                                        <p className="text-luxury-gold text-sm mb-1">Telefon</p>
                                        <p>+49 123 456 789</p>
                                    </div>
                                    <div>
                                        <p className="text-luxury-gold text-sm mb-1">E-Mail</p>
                                        <p>contact@russoluxtours.com</p>
                                    </div>
                                    <div>
                                        <p className="text-luxury-gold text-sm mb-1">Adresse</p>
                                        <p>Musterstraße 123<br />10115 Berlin<br />Deutschland</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                                <h3 className="text-lg font-serif text-white mb-4">Öffnungszeiten</h3>
                                <div className="space-y-2 text-gray-300 text-sm">
                                    <div className="flex justify-between">
                                        <span>Montag - Freitag</span>
                                        <span>09:00 - 18:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Samstag</span>
                                        <span>10:00 - 14:00</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Sonntag</span>
                                        <span>Geschlossen</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
