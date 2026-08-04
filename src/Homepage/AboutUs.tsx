import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutUsProps {
  onOpenQuote?: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ onOpenQuote }) => {
  // Use public folder path - remove '/src/assets/images/' prefix
  const consultationImg = '/pcoin_about_consulting_1785872845989.jpg';

  const stats = [
    { label: 'Guaranteed ROI Yield Rate', value: '15% - 45%' },
    { label: 'Active Crypto Investors', value: '12k+' },
    { label: 'Total ROI Payouts Processed', value: '$45M+' },
  ];

  return (
    <section id="about" className="bg-white text-gray-900 py-20 sm:py-28 px-4 sm:px-6 lg:px-12 font-['Poppins']">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Text Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16 max-w-5xl"
        >
          <div className="text-[#0284c7] font-semibold text-sm sm:text-base mb-3 flex items-center gap-1.5">
            <span className="text-[#0284c7] font-bold">//</span> About Paycoin Platform
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-5xl font-semibold sm:font-bold tracking-tight text-gray-900 leading-[1.25] sm:leading-[1.2] mb-8 font-['Poppins']">
            Paycoin is a next-generation company that enables cryptocurrency investments through our automated platform. The more you invest, the more you earn — with guaranteed Return on Investment (ROI) paid out across all deposit levels.
          </h2>

          <button
            onClick={onOpenQuote}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#61dafb] hover:bg-[#4faee3] text-slate-950 font-bold text-sm sm:text-base transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>Login Now</span>
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </motion.div>

        {/* 2-Column Section: Image on Left, Stats List on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Image of Crypto Trading & Consultation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-gray-50 aspect-[4/3] sm:aspect-[14/10]">
              <img
                src={consultationImg}
                alt="P-Coin Crypto Platform Trader Consultation"
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Right Column: Stats List with dividers */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 flex flex-col justify-center divide-y divide-gray-200 border-t border-b border-gray-200"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="py-6 sm:py-8 flex items-center justify-between gap-4 group"
              >
                <span className="text-base sm:text-xl font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  {stat.label}
                </span>
                <span className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#0284c7] font-['Poppins'] tracking-tight">
                  {stat.value}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};