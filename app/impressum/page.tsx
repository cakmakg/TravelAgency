import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/data";

export const metadata = {
    title: "Impressum | RussoLux Tours",
    description: "Impressum und rechtliche Informationen von RussoLux Tours",
};

export default function ImpressumPage() {
    return (
        <main className="min-h-screen bg-luxury-dark">
            <Navbar />

            <div className="pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-12">Impressum</h1>

                    <div className="prose prose-invert prose-lg max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">Angaben gemäß § 5 TMG</h2>
                            <div className="text-gray-300 space-y-2">
                                <p className="font-semibold text-white">{siteConfig.name}</p>
                                <p>Musterstraße 123</p>
                                <p>10115 Berlin</p>
                                <p>Deutschland</p>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">Kontakt</h2>
                            <div className="text-gray-300 space-y-2">
                                <p>Telefon: {siteConfig.phone}</p>
                                <p>E-Mail: {siteConfig.email}</p>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">Vertreten durch</h2>
                            <div className="text-gray-300">
                                <p>Geschäftsführer: [Name des Geschäftsführers]</p>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">Registereintrag</h2>
                            <div className="text-gray-300 space-y-2">
                                <p>Eintragung im Handelsregister.</p>
                                <p>Registergericht: Amtsgericht Berlin-Charlottenburg</p>
                                <p>Registernummer: HRB XXXXXX</p>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">Umsatzsteuer-ID</h2>
                            <div className="text-gray-300">
                                <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:</p>
                                <p>DE XXX XXX XXX</p>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
                            <div className="text-gray-300 space-y-2">
                                <p>[Name des Verantwortlichen]</p>
                                <p>Musterstraße 123</p>
                                <p>10115 Berlin</p>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">EU-Streitschlichtung</h2>
                            <div className="text-gray-300">
                                <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                                    <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-luxury-gold hover:underline ml-1">
                                        https://ec.europa.eu/consumers/odr/
                                    </a>
                                </p>
                                <p className="mt-4">Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">Verbraucherstreitbeilegung</h2>
                            <div className="text-gray-300">
                                <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">Haftung für Inhalte</h2>
                            <div className="text-gray-300">
                                <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
