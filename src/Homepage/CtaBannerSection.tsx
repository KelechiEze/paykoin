import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface CtaBannerSectionProps {
  onOpenQuote: () => void;
}

export const CtaBannerSection: React.FC<CtaBannerSectionProps> = ({ onOpenQuote }) => {
  const ctaBg = 'https://kelechieze.wordpress.com/wp-content/uploads/2026/08/1f5cc8eb532fa6f54cb67ec25f11afd2.jpg';

  return (
    <section className="relative w-full py-28 sm:py-36 px-4 sm:px-6 lg:px-12 overflow-hidden bg-slate-950 font-['Poppins']">
      {/* Background Image with Dark Tint Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={ctaBg}
          alt="PayCoin Cryptocurrency Platform"
          className="w-full h-full object-cover object-center brightness-75 scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/75 backdrop-brightness-90" />
      </div>

      {/* Centered Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center justify-center">
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.15] font-['Poppins'] mb-8 max-w-4xl text-shadow"
        >
          Start Investing In <span className="text-[#61dafb]">Paycoin</span> Today And Maximize Your ROI
        </motion.h2>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onClick={onOpenQuote}
          className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-[#61dafb] hover:bg-[#4faee3] text-slate-950 font-extrabold text-base sm:text-lg transition-all duration-300 shadow-2xl shadow-[#61dafb]/30 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Login Now</span>
          <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
        </motion.button>
      </div>
    </section>
  );
};
