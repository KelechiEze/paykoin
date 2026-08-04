import React from 'react';
import { ArrowUpRight, Coins, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ServicesSectionProps {
  onOpenQuote: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenQuote }) => {
  // Use public folder paths - just the filename with / prefix
  const stakingImg = '/pcoin_service_staking_1785872860159.jpg';
  const tradingImg = '/pcoin_service_trading_1785872872354.jpg';
  const vaultImg = '/pcoin_service_vault_1785872911570.jpg';

  const services = [
    {
      id: 'staking',
      title: 'Automated Staking Pools',
      description: 'Deposit any amount of crypto to earn guaranteed daily ROI percentage payouts with instant withdrawal support.',
      image: stakingImg,
      titleClass: 'text-gray-900',
      iconBg: 'bg-[#61dafb] text-slate-950',
      Icon: Coins,
    },
    {
      id: 'trading',
      title: 'High-Yield ROI Trading',
      description: 'The more capital you allocate into Paycoin investment pools, the higher your cumulative return rate multiplier grows.',
      image: tradingImg,
      titleClass: 'text-[#0284c7] font-bold', // Signature Paycoin blue title accent!
      iconBg: 'bg-[#0f172a] text-[#61dafb]',
      Icon: TrendingUp,
    },
    {
      id: 'vault',
      title: 'Multi-Asset Security Vaults',
      description: 'Institutional cold-storage vaults protecting your crypto assets with 24/7 automated yield monitoring and audits.',
      image: vaultImg,
      titleClass: 'text-gray-900',
      iconBg: 'bg-[#61dafb] text-slate-950',
      Icon: ShieldCheck,
    },
  ];

  return (
    <section id="services" className="bg-white text-gray-900 py-20 sm:py-28 px-4 sm:px-6 lg:px-12 font-['Poppins']">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#0284c7] font-semibold text-sm sm:text-base mb-3 flex items-center gap-1.5"
            >
              <span className="text-[#0284c7] font-bold">//</span> Investment Solutions
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 font-['Poppins']"
            >
              Complete Crypto Solutions
            </motion.h2>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={onOpenQuote}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#61dafb] hover:bg-[#4faee3] text-slate-950 font-bold text-sm sm:text-base transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer w-fit"
          >
            <span>Login Now</span>
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        </div>

        {/* 3 Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, idx) => {
            const IconComponent = service.Icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="group flex flex-col"
              >
                {/* Image Container with Rounded Corners and Floating Icon Badge */}
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gray-100 mb-6 shadow-sm border border-gray-100">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {/* Floating Action Badge at Bottom Right of Image */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${service.iconBg}`}>
                      <IconComponent className="w-6 h-6 stroke-[2]" />
                    </div>
                  </div>
                </div>

                {/* Card Title */}
                <h3 className={`text-2xl font-bold mb-3 font-['Poppins'] tracking-tight ${service.titleClass}`}>
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light font-['Poppins']">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};