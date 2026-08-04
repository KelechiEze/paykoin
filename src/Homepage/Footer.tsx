import React from 'react';
import { Building2, ArrowUp, ArrowUpRight, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onOpenQuote: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenQuote }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-[#070a10] text-white pt-20 pb-12 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-5 space-y-6">
            <a href="#" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#61dafb]/15 border border-[#61dafb]/40 flex items-center justify-center text-[#61dafb] font-extrabold text-xl shadow-[0_0_15px_rgba(97,218,251,0.25)]">
                P
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-['Poppins']">
                Pay<span className="text-[#61dafb]">Coin</span>
              </span>
            </a>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-sm">
              Paycoin is a premier cryptocurrency investment platform. The more you invest, the higher your ROI — backed by audited multi-sig vaults and daily payout automation.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenQuote}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#61dafb] text-slate-950 font-bold text-xs hover:bg-[#4faee3] transition-all shadow-md shadow-[#61dafb]/20"
              >
                <span>Login Now</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-semibold text-white font-['Poppins'] tracking-wider uppercase">
              Platform Links
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400 font-light">
              <li>
                <a href="#hero" className="hover:text-[#61dafb] transition-colors">
                  Home Overview
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#61dafb] transition-colors">
                  About Paycoin
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#61dafb] transition-colors">
                  Investment Pools
                </a>
              </li>
              <li>
                <a href="#our-story" className="hover:text-[#61dafb] transition-colors">
                  ROI Guarantee
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-semibold text-white font-['Poppins'] tracking-wider uppercase">
              24/7 Platform Support
            </h4>
            <ul className="space-y-3 text-sm text-gray-400 font-light">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#61dafb] shrink-0" />
                <span>Financial District, Suite 400, New York, NY 10005</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#61dafb] shrink-0" />
                <span>+1 (800) PCOIN-ROI</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#61dafb] shrink-0" />
                <span>support@paycoin-roi.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © {new Date().getFullYear()} PayCoin Cryptocurrency Investment Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Investment</a>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-slate-950 hover:bg-[#61dafb] transition-all"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
