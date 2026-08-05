import React from 'react';
import { motion } from 'motion/react';

export const OurStorySection: React.FC = () => {
  const cards = [
    {
      id: 'audits',
      number: '10+',
      title: 'Security Audits',
      description: 'Fully audited smart contract protocols & multi-sig vault security.',
      bgClass: 'bg-[#f4f4f6] text-gray-900',
      titleClass: 'text-gray-900',
      descClass: 'text-gray-600',
    },
    {
      id: 'investors',
      number: '15k+',
      title: 'Active Investors',
      description: 'Thousands of crypto investors earning daily automated returns.',
      bgClass: 'bg-[#61dafb] text-slate-950',
      titleClass: 'text-slate-950 font-bold',
      descClass: 'text-slate-900 font-medium',
    },
    {
      id: 'roi',
      number: '100%',
      title: 'ROI Guarantee',
      description: 'Guaranteed Return on Investment payouts on any deposit size.',
      bgClass: 'bg-[#f4f4f6] text-gray-900',
      titleClass: 'text-gray-900',
      descClass: 'text-gray-600',
    },
    {
      id: 'yield',
      number: '35%+',
      title: 'Max APY Yield',
      description: 'High-performance crypto compounding for institutional tier deposits.',
      bgClass: 'bg-[#61dafb] text-slate-950',
      titleClass: 'text-slate-950 font-bold',
      descClass: 'text-slate-900 font-medium',
    },
  ];

  return (
    <section id="our-story" className="bg-white text-gray-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-12 font-['Poppins'] border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header Layout: // Our Story tag on Left, Statement on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 sm:mb-14">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#0284c7] font-semibold text-xs sm:text-sm flex items-center gap-1.5"
            >
              <span className="text-[#0284c7] font-bold">//</span> Our Vision
            </motion.div>
          </div>

          <div className="lg:col-span-9">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-base sm:text-lg lg:text-xl font-semibold sm:font-bold text-gray-900 leading-[1.5] sm:leading-[1.4] font-['Poppins'] tracking-tight"
            >
              Paycoin Was Created With A Vision To Transform The Cryptocurrency Investment Experience Through Trust, Transparency, And High-Yield Innovation. We Are Dedicated To Helping Global Investors Grow Their Crypto Capital With Guaranteed ROI, Guided By Automated Precision And Uncompromising Asset Security.
            </motion.h2>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className={`p-5 sm:p-6 rounded-2xl flex flex-col justify-between min-h-[220px] sm:min-h-[240px] transition-all duration-300 hover:-translate-y-1 ${card.bgClass}`}
            >
              {/* Giant Number top right */}
              <div className="flex justify-end">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold font-['Poppins'] tracking-tight">
                  {card.number}
                </span>
              </div>

              {/* Title & Description at bottom */}
              <div className="mt-6 space-y-1.5">
                <h3 className={`text-base sm:text-lg font-bold font-['Poppins'] ${card.titleClass}`}>
                  {card.title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${card.descClass}`}>
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};