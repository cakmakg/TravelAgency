import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/data";

export const metadata = {
    title: "Datenschutzerklärung | RussoLux Tours",
    description: "Datenschutzerklärung von RussoLux Tours - Informationen zum Schutz Ihrer personenbezogenen Daten",
};

export default function DatenschutzPage() {
    return (
        <main className="min-h-screen bg-luxury-dark">
            <Navbar />

            <div className="pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-12">Datenschutzerklärung</h1>

                    <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">1. Datenschutz auf einen Blick</h2>
                            <h3 className="text-xl text-white mt-6 mb-3">Allgemeine Hinweise</h3>
                            <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>

                            <h3 className="text-xl text-white mt-6 mb-3">Datenerfassung auf dieser Website</h3>
                            <p><strong className="text-white">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong></p>
                            <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.</p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">2. Hosting</h2>
                            <p>Wir hosten die Inhalte unserer Website bei folgendem Anbieter:</p>
                            <h3 className="text-xl text-white mt-6 mb-3">Externes Hosting</h3>
                            <p>Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v.a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln.</p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
                            <h3 className="text-xl text-white mt-6 mb-3">Datenschutz</h3>
                            <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>

                            <h3 className="text-xl text-white mt-6 mb-3">Hinweis zur verantwortlichen Stelle</h3>
                            <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
                            <div className="bg-white/5 p-4 rounded-lg my-4">
                                <p>{siteConfig.name}</p>
                                <p>Musterstraße 123</p>
                                <p>10115 Berlin</p>
                                <p className="mt-2">Telefon: {siteConfig.phone}</p>
                                <p>E-Mail: {siteConfig.email}</p>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">4. Datenerfassung auf dieser Website</h2>
                            <h3 className="text-xl text-white mt-6 mb-3">Kontaktformular</h3>
                            <p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>

                            <h3 className="text-xl text-white mt-6 mb-3">Cookies</h3>
                            <p>Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.</p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">5. Ihre Rechte</h2>
                            <p>Sie haben jederzeit das Recht:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Auskunft über Ihre bei uns gespeicherten Daten zu verlangen</li>
                                <li>Die Berichtigung unrichtiger Daten zu verlangen</li>
                                <li>Die Löschung Ihrer Daten zu verlangen</li>
                                <li>Die Einschränkung der Verarbeitung zu verlangen</li>
                                <li>Der Verarbeitung zu widersprechen</li>
                                <li>Ihre Daten in einem übertragbaren Format zu erhalten (Datenportabilität)</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">6. SSL- bzw. TLS-Verschlüsselung</h2>
                            <p>Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://" auf „https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.</p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-serif text-luxury-gold mb-4">7. Änderung dieser Datenschutzerklärung</h2>
                            <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.</p>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
