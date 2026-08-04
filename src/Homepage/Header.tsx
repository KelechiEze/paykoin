import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onOpenQuote?: () => void; // Make it optional
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuote }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0b0f17]/90 backdrop-blur-md py-3.5 border-b border-white/10 shadow-2xl'
          : 'bg-gradient-to-b from-black/70 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#61dafb]/15 border border-[#61dafb]/40 flex items-center justify-center text-[#61dafb] font-extrabold text-xl group-hover:bg-[#61dafb] group-hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(97,218,251,0.25)]">
            P
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-black tracking-tight text-white font-['Poppins']">
              Pay<span className="text-[#61dafb]">Coin</span>
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#hero"
            className="text-sm font-medium text-gray-200 hover:text-[#61dafb] transition-colors"
          >
            Home
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-gray-200 hover:text-[#61dafb] transition-colors"
          >
            About Us
          </a>
          <a
            href="#services"
            className="text-sm font-medium text-gray-200 hover:text-[#61dafb] transition-colors"
          >
            Investment Plans
          </a>
          <a
            href="#our-story"
            className="text-sm font-medium text-gray-200 hover:text-[#61dafb] transition-colors"
          >
            ROI Track
          </a>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center">
          <button
            onClick={handleLogin}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#61dafb] text-slate-950 font-bold text-sm hover:bg-[#4faee3] transition-all duration-300 shadow-lg shadow-[#61dafb]/25 hover:scale-[1.03] active:scale-95 cursor-pointer"
          >
            <span>Login Now</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Mobile Hamburger Button (<800px) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/10 border border-white/15 text-gray-100 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (< 800px Breakpoint Responsive) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-[#0e1420]/98 backdrop-blur-2xl border-b border-white/15 px-4 pt-3 pb-6 space-y-4"
          >
            <div className="flex flex-col gap-3">
              <a
                href="#hero"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-gray-200 hover:text-[#61dafb] hover:bg-white/5 rounded-lg transition-colors"
              >
                Home Overview
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-gray-200 hover:text-[#61dafb] hover:bg-white/5 rounded-lg transition-colors"
              >
                About Paycoin
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-gray-200 hover:text-[#61dafb] hover:bg-white/5 rounded-lg transition-colors"
              >
                Investment Plans
              </a>
            </div>

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogin();
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#61dafb] text-slate-950 font-bold text-sm hover:bg-[#4faee3] transition-all shadow-lg shadow-[#61dafb]/25"
              >
                <span>Login Now</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};