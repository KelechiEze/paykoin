// Homepage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Homepage/Header';
import { Hero } from '../Homepage/Hero';
import { CryptoMarquee } from '../Homepage/CryptoMarquee';
import { AboutUs } from '../Homepage/AboutUs';
import { InteractiveStrategySection } from '../Homepage/InteractiveStrategySection';
import { ServicesGridSection } from '../Homepage/ServicesGridSection';
import { InvestmentPackagesSection } from '../Homepage/InvestmentPackagesSection';
import { ServicesSection } from '../Homepage/ServicesSection';
import { OurStorySection } from '../Homepage/OurStorySection';
import { CtaBannerSection } from '../Homepage/CtaBannerSection';
import { Footer } from '../Homepage/Footer';
import { QuoteModal } from '../Homepage/QuoteModal';
import Preloader from '../pages/Preloader'; // Import from pages folder
import './homepage.css'

export default function Homepage() {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const navigate = useNavigate();

  const handleOpenLogin = () => {
    // Show preloader
    setShowPreloader(true);
    
    // Navigate after a short delay to show preloader
    setTimeout(() => {
      navigate('/login');
      setShowPreloader(false);
    }, 1500); // 1.5 second delay for smooth transition
  };

  // If you still want to keep modal functionality for some buttons
  const handleOpenModal = () => {
    setQuoteModalOpen(true);
  };

  return (
    <>
      {/* Preloader - shown when showPreloader is true */}
      {showPreloader && <Preloader />}
      
      <div className="homepage min-h-screen bg-[#0b0f17] text-white font-['Poppins'] antialiased selection:bg-[#61dafb] selection:text-black">
        {/* Navbar Header */}
        <Header onOpenQuote={handleOpenLogin} />

        {/* Main Content Sections */}
        <main>
          {/* Hero Section */}
          <Hero onOpenQuote={handleOpenLogin} />

          {/* Live Crypto Marquee Section (underneath Hero) */}
          <CryptoMarquee />

          {/* About Us Section */}
          <AboutUs onOpenQuote={handleOpenLogin} />

          {/* Turn savings into wealth with expert guidance (Interactive Strategy Accordion) */}
          <InteractiveStrategySection onOpenConsultation={handleOpenLogin} />

          {/* Tax Efficient Solutions & Tailored Support (Services Grid) */}
          <ServicesGridSection onOpenConsultation={handleOpenLogin} />

          {/* Delivering the Highest Quality Outcomes (3 Investment Packages Pricing) */}
          <InvestmentPackagesSection onOpenConsultation={handleOpenLogin} />

          {/* Complete Crypto Solutions Services Section */}
          <ServicesSection onOpenQuote={handleOpenLogin} />

          {/* Our Vision & Stats Grid Section */}
          <OurStorySection />

          {/* Start Investing In Paycoin CTA Banner Section */}
          <CtaBannerSection onOpenQuote={handleOpenLogin} />
        </main>

        {/* Footer */}
        <Footer onOpenQuote={handleOpenLogin} />

        {/* Login Portal Modal - Keep this if you still want to use it for other purposes */}
        <QuoteModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
        />
      </div>
    </>
  );
}