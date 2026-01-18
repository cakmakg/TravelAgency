import { Plane, Star, Shield, Briefcase, Calendar, MapPin } from "lucide-react";

export const siteConfig = {
    name: "RussoLux Tours",
    description: "Exklusive Geschäfts- und Kulturreisen nach Russland",
    email: "contact@russoluxtours.com",
    phone: "+49 123 456 789",
};

export const navLinks = [
    { name: "Home", href: "/" },
    { name: "Pakete", href: "/packages" },
    { name: "Messen 2026", href: "/fairs" },
    { name: "Galerie", href: "/gallery" },
    { name: "Kontakt", href: "/contact" },
];

export const features = [
    {
        icon: Star,
        title: "Exklusiver Zugang",
        description: "VIP-Tickets für Moskauer Messen und private Führungen (z.B. Kreml, Bolschoi).",
    },
    {
        icon: Plane,
        title: "Premium Logistik",
        description: "Business-Class Flüge via Istanbul/Belgrad und erstklassige Transfers vom Flughafen.",
    },
    {
        icon: Shield,
        title: "Diskretion & Sicherheit",
        description: "Wir garantieren höchste Vertraulichkeit und Sicherheit während Ihrer gesamten Reise.",
    },
    {
        icon: Briefcase,
        title: "Messe-Support",
        description: "Dolmetscher, Meeting-Organisation und lokale Assistenz für Ihren Geschäftserfolg.",
    },
];

export const packages = [
    {
        id: 1,
        title: "Business & Kultur Elite",
        duration: "5 Tage / 4 Nächte",
        price: "ab 4.500 €",
        image: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&q=80",
        features: ["5* Ritz-Carlton Hotel", "Privater Chauffeur", "VIP-Messezugang", "Michelin-Dinner"],
        description: "Erleben Sie Moskau von seiner exklusivsten Seite. Dieses Paket ist speziell für Führungskräfte konzipiert, die effizientes Business-Networking mit erstklassigem kulturellen Genuss verbinden möchten. Sie residieren im legendären Ritz-Carlton mit Blick auf den Roten Platz und genießen rund um die Uhr unseren VIP-Concierge-Service.",
        inclusions: [
            "Business Class Flug (Turkish Airlines o.ä.)",
            "4 Übernachtungen im Ritz-Carlton Moskau (Club Room)",
            "Privater Chauffeur (Mercedes S-Klasse) für die gesamte Dauer",
            "VIP-Akkreditierung für Ihre Wunsch-Messe",
            "Exklusives Dinner im Restaurant 'White Rabbit'",
            "Private Führung durch den Kreml (außerhalb der Öffnungszeiten)"
        ],
        itinerary: [
            { day: "Tag 1", title: "Ankunft & VIP-Empfang", desc: "Private Abholung am Flughafen Wnukowo (VKO-3). Check-in im Ritz-Carlton. Welcome-Drink mit Blick auf den Kreml." },
            { day: "Tag 2", title: "Messe-Business", desc: "Transfer zur Messe. Begleitung durch Dolmetscherin. Vorab vereinbarte B2B-Meetings." },
            { day: "Tag 3", title: "Kultur & Genuss", desc: "Vormittags Business. Nachmittags private Führung in der Tretjakow-Galerie. Abends Ballett im Bolschoi-Theater (Logenplätze)." },
            { day: "Tag 4", title: "Moskau Modern & Historisch", desc: "Besuch von Moskau City (Federation Tower). Mittagessen im Ruski. Private Kreml-Führung am Abend." },
            { day: "Tag 5", title: "Abreise", desc: "Frühstück, Transfer zum Flughafen und Rückflug." }
        ]
    },
    {
        id: 2,
        title: "Grand Tour St. Petersburg",
        duration: "6 Tage / 5 Nächte",
        price: "ab 5.200 €",
        image: "https://images.unsplash.com/photo-1556610961-2fecc5927173?auto=format&fit=crop&q=80",
        features: ["Four Seasons Lion Palace", "Private Eremitage-Führung", "Kanalfahrt privat", "Ballett-Abend"],
        description: "Tauchen Sie ein in die imperiale Pracht von St. Petersburg. Diese Reise ist eine Hommage an die Zarenzeit, kombiniert mit modernstem Luxus. Ideal als Incentive-Reise oder exklusive Auszeit nach geschäftlichen Terminen.",
        inclusions: [
            "Business Class Flug",
            "5 Übernachtungen im Four Seasons Lion Palace",
            "Private Yacht-Tour durch die Kanäle",
            "Exklusiver Zugang zur Eremitage (Gold Rooms)",
            "Mariinsky Theater Premium Tickets"
        ],
        itinerary: [
            { day: "Tag 1", title: "Willkommen in Venedig des Nordens", desc: "VIP-Transfer zum Hotel. Abendessen im Palkin." },
            { day: "Tag 2", title: "Die Eremitage Exklusiv", desc: "Private Führung durch die Eremitage vor den offiziellen Öffnungszeiten." },
            { day: "Tag 3", title: "Peterhof & Katharinenpalast", desc: "Hydrofoil-Fahrt zum Peterhof. Private Führung im Bernsteinzimmer." },
            { day: "Tag 4", title: "Business & Leisure", desc: "Vormittag zur freien Verfügung oder Business-Meetings. Nachmittags private Bootstour." },
            { day: "Tag 5", title: "Mariinsky Theater", desc: "Backstage-Führung und Opern-/Ballettabend." },
            { day: "Tag 6", title: "Abreise", desc: "Transfer zum Flughafen Pulkovo." }
        ]
    },
    {
        id: 3,
        title: "Moskau Messe Express",
        duration: "4 Tage / 3 Nächte",
        price: "ab 3.800 €",
        image: "https://images.unsplash.com/photo-1547443609-f089a6873120?auto=format&fit=crop&q=80",
        features: ["Messe-Hotel 5*", "Dolmetscher-Service", "Business-Visum Support", "Flughafen-Transfer"],
        description: "Maximale Effizienz für Ihren Messebesuch. Wir kümmern uns um die gesamte Logistik, damit Sie sich zu 100% auf Ihre Geschäfte konzentrieren können. Perfekt für Aussteller und Fachbesucher.",
        inclusions: [
            "Flug & Visum-Support (Express)",
            "3 Übernachtungen im Radisson Collection (direkt am Fluss)",
            "Täglicher Shuttle zur Messe (Expocentre/Crocus Expo)",
            "Persönlicher Dolmetscher (DE/RU) für 2 Messetage"
        ],
        itinerary: [
            { day: "Tag 1", title: "Anreise", desc: "Transfer und Briefing für die Messetage." },
            { day: "Tag 2", title: "Messe Tag 1", desc: "Voller Messetag mit Dolmetscher. Networking-Dinner am Abend." },
            { day: "Tag 3", title: "Messe Tag 2", desc: "Messebesuch. Optional: Kurze Stadtrundfahrt am Abend." },
            { day: "Tag 4", title: "Rückreise", desc: "Check-out und Transfer." }
        ]
    },
    {
        id: 4,
        title: "Imperial Russia Experience",
        duration: "8 Tage / 7 Nächte",
        price: "ab 7.500 €",
        image: "https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&q=80",
        features: ["Kombi Moskau & St. Petersburg", "Sapsan Business Class", "Helikopter-Rundflug", "Exklusive Opernloge"],
        description: "Das ultimative Russland-Erlebnis. Verbinden Sie die Dynamik Moskaus mit der Eleganz St. Petersburgs. Reisen Sie stilvoll mit dem Hochgeschwindigkeitszug Sapsan zwischen den Metropolen.",
        inclusions: [
            "Alle Flüge & Sapsan Business Class Tickets",
            "4 Nächte Moskau (Four Seasons), 3 Nächte St. Petersburg (Astoria)",
            "Helikopter-Rundflug über Moskau",
            "Fabergé Museum Privatführung",
            "Full-Service Concierge 24/7"
        ],
        itinerary: [
            { day: "Tag 1-4", title: "Moskau", desc: "Kreml, Roter Platz, Bolschoi Theater und Business-Meetings." },
            { day: "Tag 4", title: "Reise nach St. Petersburg", desc: "Fahrt mit dem Sapsan (Business Class). Check-in im Hotel Astoria." },
            { day: "Tag 5-8", title: "St. Petersburg", desc: "Eremitage, Peterhof, Newski Prospekt. Gala-Dinner zum Abschluss." }
        ]
    },
];

export const fairs = [
    {
        id: 1,
        name: "Prodexpo 2026",
        date: "Februar 2026",
        category: "Lebensmittel & Getränke",
        description: "Die größte internationale Messe für Lebensmittel und Getränke in Russland und Osteuropa.",
        fullDescription: "Die Prodexpo ist der wichtigste Treffpunkt für die Lebensmittelindustrie in Osteuropa. Über 2.000 Aussteller aus 50 Ländern präsentieren hier ihre neuesten Produkte. Für deutsche Unternehmen bietet sich hier die einmalige Chance, Vertriebswege in den russischen und zentralasiatischen Markt zu erschließen.",
        venue: "Expocentre Fairgrounds, Moskau",
        highlights: ["Premium Food & Drinks", "Organic Zone", "Wine & Spirits Pavillon"]
    },
    {
        id: 2,
        name: "TransRussia 2026",
        date: "März 2026",
        category: "Logistik",
        description: "Internationale Messe für Transport- und Logistikdienstleistungen, Lagertechnik und Technologien.",
        fullDescription: "Die TransRussia ist die Leitmesse für Transport und Logistik in Russland. Hier treffen sich Spediteure, Hafenbetreiber und IT-Dienstleister, um die Lieferketten der Zukunft zu gestalten.",
        venue: "Crocus Expo, Moskau",
        highlights: ["IT-Lösungen für Logistik", "Lagertechnik", "E-Commerce Logistik"]
    },
    {
        id: 3,
        name: "Neftegaz 2026",
        date: "April 2026",
        category: "Energie & Öl",
        description: "Leitmesse für Ausrüstung und Technologien in der Öl- und Gasindustrie.",
        fullDescription: "Als eine der zehn größten Ölmessen der Welt ist die Neftegaz ein Muss für Entscheidungsträger der Energiebranche. Parallel findet das Nationale Öl- und Gasforum statt.",
        venue: "Expocentre Fairgrounds, Moskau",
        highlights: ["Offshore-Technologien", "LNG-Transport", "Petrochemie"]
    },
    {
        id: 4,
        name: "CTT Expo 2026",
        date: "Mai 2026",
        category: "Bauwesen",
        description: "Internationale Fachmesse für Baumaschinen und Technologien.",
        fullDescription: "Die CTT Expo ist die größte Baumaschinenmesse in Russland und der GUS. Sie deckt alle Bereiche ab, vom Straßenbau bis zur Bergbauausrüstung.",
        venue: "Crocus Expo, Moskau",
        highlights: ["Baumaschinen", "Bergbau-Equipment", "Baumaterial-Produktion"]
    },
];
