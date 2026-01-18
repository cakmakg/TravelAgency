import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/data";

export const metadata = {
    title: "Allgemeine Geschäftsbedingungen | RussoLux Tours",
    description: "AGB von RussoLux Tours - Unsere allgemeinen Geschäftsbedingungen für Reisebuchungen",
};

export default function AGBPage() {
    return (
        <main className="min-h-screen bg-luxury-dark">
            <Navbar />

            <div className="pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-12">Allgemeine Geschäftsbedingungen</h1>

                    <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">§ 1 Geltungsbereich</h2>
                            <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen {siteConfig.name} (nachfolgend „Veranstalter") und dem Kunden über die Buchung und Durchführung von Reiseleistungen.</p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">§ 2 Vertragsabschluss</h2>
                            <ol className="list-decimal pl-6 space-y-3">
                                <li>Mit der Buchung bietet der Kunde dem Veranstalter den Abschluss eines Reisevertrages verbindlich an.</li>
                                <li>Der Vertrag kommt mit der Buchungsbestätigung des Veranstalters zustande.</li>
                                <li>Die Buchung kann schriftlich, telefonisch oder elektronisch erfolgen.</li>
                            </ol>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">§ 3 Zahlung</h2>
                            <ol className="list-decimal pl-6 space-y-3">
                                <li>Nach Vertragsabschluss ist eine Anzahlung in Höhe von 20% des Reisepreises fällig.</li>
                                <li>Die Restzahlung ist 30 Tage vor Reisebeginn zu leisten.</li>
                                <li>Bei Buchungen innerhalb von 30 Tagen vor Reisebeginn ist der gesamte Reisepreis sofort fällig.</li>
                            </ol>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">§ 4 Leistungen</h2>
                            <p>Der Umfang der vertraglichen Leistungen ergibt sich aus der Leistungsbeschreibung des Veranstalters sowie den ergänzenden Angaben in der Buchungsbestätigung.</p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">§ 5 Rücktritt durch den Kunden</h2>
                            <p>Der Kunde kann jederzeit vor Reisebeginn vom Vertrag zurücktreten. Es gelten folgende Stornogebühren:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Bis 60 Tage vor Reisebeginn: 20% des Reisepreises</li>
                                <li>59-30 Tage vor Reisebeginn: 40% des Reisepreises</li>
                                <li>29-15 Tage vor Reisebeginn: 60% des Reisepreises</li>
                                <li>14-7 Tage vor Reisebeginn: 80% des Reisepreises</li>
                                <li>Ab 6 Tage vor Reisebeginn: 95% des Reisepreises</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">§ 6 Haftung</h2>
                            <p>Die vertragliche Haftung des Veranstalters für Schäden, die nicht aus der Verletzung des Lebens, des Körpers oder der Gesundheit resultieren, ist auf den dreifachen Reisepreis beschränkt.</p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">§ 7 Reiseversicherung</h2>
                            <p>Der Veranstalter empfiehlt den Abschluss einer Reiserücktrittskostenversicherung sowie einer Auslandskrankenversicherung. Diese sind nicht im Reisepreis enthalten.</p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">§ 8 Schlussbestimmungen</h2>
                            <ol className="list-decimal pl-6 space-y-3">
                                <li>Es gilt das Recht der Bundesrepublik Deutschland.</li>
                                <li>Gerichtsstand ist Berlin.</li>
                                <li>Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</li>
                            </ol>
                        </section>

                        <section className="mb-12">
                            <p className="text-gray-400 text-sm">Stand: Januar 2026</p>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
