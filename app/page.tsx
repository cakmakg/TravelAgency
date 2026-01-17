import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { FeaturedPackages } from "@/components/sections/FeaturedPackages";
import { TradeFairs } from "@/components/sections/TradeFairs";
import { Gallery } from "@/components/sections/Gallery";
import { Testimonials } from "@/components/sections/Testimonials";
import { ContactForm } from "@/components/sections/ContactForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-luxury-dark selection:bg-luxury-gold selection:text-black">
      <Navbar />
      <Hero />
      <WhyChooseUs />
      <FeaturedPackages />
      <TradeFairs />
      <Gallery />
      <Testimonials />
      <ContactForm />
      <Footer />
    </main>
  );
}
