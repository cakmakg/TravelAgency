import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RussoLux Tours | Exklusive Geschäfts- und Kulturreisen nach Russland",
  description: "Ihr Partner für exklusive Business- und Kulturreisen nach Moskau und St. Petersburg. VIP-Messepakete, 5-Sterne-Hotels, diskrete Betreuung für anspruchsvolle deutsche Professionals.",
  keywords: ["Russland Reisen", "Moskau Messe", "Geschäftsreisen Russland", "Luxusreisen Moskau", "St. Petersburg Reisen", "VIP Reisen Russland"],
  authors: [{ name: "RussoLux Tours" }],
  creator: "RussoLux Tours",
  publisher: "RussoLux Tours",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://www.russoluxtours.de',
    siteName: 'RussoLux Tours',
    title: 'RussoLux Tours | Exklusive Russland-Reisen für Professionals',
    description: 'Exklusive Geschäfts- und Kulturreisen nach Moskau und St. Petersburg. VIP-Messepakete, 5-Sterne-Hotels, diskrete Betreuung.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1547443609-f089a6873120?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Moskau Skyline bei Nacht - RussoLux Tours',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RussoLux Tours | Exklusive Russland-Reisen',
    description: 'VIP-Messepakete & Luxus-Kulturreisen nach Moskau und St. Petersburg',
    images: ['https://images.unsplash.com/photo-1547443609-f089a6873120?auto=format&fit=crop&w=1200&h=630&q=80'],
  },
  alternates: {
    canonical: 'https://www.russoluxtours.de',
  },
  verification: {
    // Add when available:
    // google: 'your-google-verification-code',
  },
};

// JSON-LD Schema for Organization
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'RussoLux Tours',
  description: 'Exklusive Geschäfts- und Kulturreisen nach Russland für anspruchsvolle Professionals',
  url: 'https://www.russoluxtours.de',
  logo: 'https://www.russoluxtours.de/logo.png',
  image: 'https://images.unsplash.com/photo-1547443609-f089a6873120?auto=format&fit=crop&w=1200&q=80',
  telephone: '+49 123 456 789',
  email: 'contact@russoluxtours.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Berlin',
    addressCountry: 'DE',
  },
  priceRange: '€€€€',
  areaServed: {
    '@type': 'Country',
    name: 'Russia',
  },
  sameAs: [
    // Add social media links when available
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={clsx(
          playfair.variable,
          inter.variable,
          "antialiased bg-luxury-dark text-gray-100 font-sans"
        )}
      >
        {children}
      </body>
    </html>
  );
}
