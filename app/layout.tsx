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
  title: "RussoLux Tours | Exklusive Russland-Reisen",
  description: "Exklusive Geschäfts- und Kulturreisen nach Russland für anspruchsvolle Professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
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
