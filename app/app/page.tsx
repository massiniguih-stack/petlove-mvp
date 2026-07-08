'use client';

import Navbar from '@/components/sales/Navbar';
import Hero from '@/components/sales/Hero';
import Features from '@/components/sales/Features';
import Stats from '@/components/sales/Stats';
import Pricing from '@/components/sales/Pricing';
import Testimonials from '@/components/sales/Testimonials';
import FAQ from '@/components/sales/FAQ';
import CTAFinal from '@/components/sales/CTAFinal';
import Footer from '@/components/sales/Footer';

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTAFinal />
      <Footer />
    </div>
  );
}
