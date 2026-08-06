import React from 'react';
import { ArrowUpRight, Shield, Award, Users, TrendingUp } from 'lucide-react';
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

  const features = [
    {
      icon: <Shield className="w-5 h-5 text-[#0284c7]" />,
      title: 'Secure & Regulated',
      description: 'Enterprise-grade security with multi-layer encryption and compliance frameworks.'
    },
    {
      icon: <Award className="w-5 h-5 text-[#0284c7]" />,
      title: 'Industry Leading ROI',
      description: 'Consistently delivering 15-45% returns through our proven automated trading strategies.'
    },
    {
      icon: <Users className="w-5 h-5 text-[#0284c7]" />,
      title: 'Global Community',
      description: 'Join 12,000+ investors worldwide who trust Paycoin for their crypto investments.'
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-[#0284c7]" />,
      title: 'Automated Investing',
      description: 'Sophisticated AI-driven algorithms optimize your portfolio for maximum returns.'
    }
  ];

  return (
    <section id="about" className="bg-white text-gray-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-12 font-['Poppins']">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Text Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16 max-w-5xl"
        >
          <div className="text-[#0284c7] font-semibold text-xs sm:text-sm mb-4 flex items-center gap-2">
            <span className="text-[#0284c7] font-bold text-base sm:text-lg">//</span> 
            <span className="uppercase tracking-wider">About Paycoin</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-[1.2] sm:leading-[1.15] mb-6 font-['Poppins']">
            Empowering the Future of <br className="hidden sm:block" />
            <span className="text-[#0284c7]">Crypto Investing</span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mb-8">
            Paycoin is a pioneering force in the digital asset space, offering a comprehensive automated investment platform 
            that democratizes access to high-yield cryptocurrency opportunities. Our sophisticated infrastructure enables 
            investors to participate in the crypto economy with confidence, backed by industry-leading technology and 
            transparent, guaranteed returns across all deposit tiers.
          </p>

          <button
            onClick={onOpenQuote}
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>Get Started Now</span>
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-gray-50/80 hover:bg-gray-100/90 transition-all duration-300 border border-gray-100 hover:border-[#0284c7]/30 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:shadow-md transition-shadow">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </motion.div>

        {/* 2-Column Section: Image on Left, Stats List on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Column: Image of Crypto Trading & Consultation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-50 aspect-[4/3] sm:aspect-[14/10]">
              <img
                src={consultationImg}
                alt="Paycoin Crypto Investment Platform - Professional Trading Consultation"
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              {/* Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Right Column: Stats List with dividers */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <div className="bg-gradient-to-br from-gray-50/80 to-white rounded-3xl p-8 border border-gray-100 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Our Performance Metrics</h3>
              
              <div className="divide-y divide-gray-200">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="py-5 flex items-center justify-between gap-4 group"
                  >
                    <span className="text-sm sm:text-base md:text-lg font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                      {stat.label}
                    </span>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0284c7] font-['Poppins'] tracking-tight">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Trusted by investors worldwide • Verified performance
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};