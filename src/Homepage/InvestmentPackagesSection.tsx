import React, { useState } from 'react';
import { ArrowRight, Check, TrendingUp } from 'lucide-react';

interface InvestmentPackagesSectionProps {
  onOpenConsultation: () => void;
}

const INVESTMENT_PACKAGES = [
  {
    id: 'beginner',
    name: 'Starter Plan',
    subtext: 'Ideal for startups and small investors that need essential financial support to get organized, make informed decisions, and build a solid foundation for growth.',
    monthlyPrice: '$500',
    yearlyPrice: '$425',
    unit: '/Min Capital',
    roi: '10% Weekly ROI',
    popular: false,
    features: [
      '10% Weekly Return on Investment (ROI)',
      'Automated Blue-Chip DCA (BTC, ETH, SOL)',
      'Basic Portfolio Tracking & Analytics',
      'Monthly Staking Yield Payouts',
      'Standard Security & Cold Custody',
      '24/7 Self-Service Investor Portal',
    ],
  },
  {
    id: 'growth',
    name: 'Professional Plan',
    subtext: 'Built for growing investors that need deeper financial insights, priority support, and clearer visibility to make smarter, faster decisions.',
    monthlyPrice: '$5,000',
    yearlyPrice: '$4,250',
    unit: '/Min Capital',
    roi: '10% Weekly ROI',
    popular: true, // Featured Dark Card
    features: [
      '10% Weekly Return on Investment (ROI)',
      'Algorithmic Proof-of-Stake Yield Farming',
      'Higher Return on Investment Analytics',
      'Layer-1 & Layer-2 Validator Access',
      'Tax Planning Assistance & Reports',
      'Pricing Profitability Analysis',
      'Priority Email & Chat Support',
    ],
  },
  {
    id: 'institutional',
    name: 'Enterprise Plan',
    subtext: 'Designed for scaling institutions that require full-service financial management, strategic oversight, and dedicated support at every stage of growth.',
    monthlyPrice: '$25,000',
    yearlyPrice: '$21,250',
    unit: '/Min Capital',
    roi: '10% Weekly ROI',
    popular: false,
    features: [
      '10% Weekly Return on Investment (ROI)',
      'End-to-End Financial Management',
      'Advanced Financial Reporting & Arbitrage',
      'Strategic Financial Planning Sessions',
      'Dedicated Crypto Wealth Advisor',
      'Priority Email & Chat Support',
      'Customized Risk Mitigation Hedging',
    ],
  },
];

export const InvestmentPackagesSection: React.FC<InvestmentPackagesSectionProps> = ({
  onOpenConsultation,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="packages" className="bg-[#fcfdfc] text-zinc-900 py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Top Header matching prompt */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-zinc-500 font-medium text-[10px] sm:text-xs tracking-wide block mb-2">
            Committed to clients, focused on results
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight leading-[1.2] font-sans">
            Delivering the highest
            <br />
            quality outcomes
          </h2>

          {/* Monthly / Yearly Toggle Pill */}
          <div className="mt-6 inline-flex items-center bg-zinc-900 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Yearly</span>
              <span className="bg-[#61dafb] text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                Save up to 25%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          {INVESTMENT_PACKAGES.map((pkg) => {
            const isDark = pkg.popular;
            const price =
              billingCycle === 'monthly' ? pkg.monthlyPrice : pkg.yearlyPrice;

            return (
              <div
                key={pkg.id}
                className={`rounded-[24px] sm:rounded-[28px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  isDark
                    ? 'bg-zinc-950 text-white shadow-2xl border border-zinc-800'
                    : 'bg-white text-zinc-900 border border-zinc-200/90 shadow-sm hover:shadow-xl'
                }`}
              >
                <div>
                  {/* ROI Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider mb-2.5 ${
                    isDark
                      ? 'bg-[#61dafb]/20 border-[#61dafb]/40 text-[#61dafb]'
                      : 'bg-[#61dafb]/20 border-[#61dafb]/40 text-[#0284c7]'
                  }`}>
                    <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                    <span>{pkg.roi}</span>
                  </div>

                  {/* Card Header Title */}
                  <h3
                    className={`text-xl font-extrabold tracking-tight mb-2 ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    {pkg.name}
                  </h3>

                  <p
                    className={`text-xs leading-relaxed mb-4 font-normal ${
                      isDark ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {pkg.subtext}
                  </p>

                  {/* Price Tag */}
                  <div className="flex items-baseline gap-1.5 mb-6">
                    <span
                      className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-sans ${
                        isDark ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {price}
                    </span>
                    <span
                      className={`text-[10px] sm:text-xs font-medium ${
                        isDark ? 'text-zinc-400' : 'text-zinc-500'
                      }`}
                    >
                      {pkg.unit}
                    </span>
                  </div>

                  {/* Primary Action Button directly under price */}
                  <button
                    onClick={onOpenConsultation}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md transform hover:-translate-y-0.5 mb-6 ${
                      isDark
                        ? 'bg-[#61dafb] hover:bg-[#4faee3] text-slate-950 shadow-lg shadow-[#61dafb]/25'
                        : 'bg-zinc-900 hover:bg-black text-white'
                    }`}
                  >
                    <span>Login Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Divider */}
                  <div
                    className={`w-full h-px mb-6 ${
                      isDark ? 'bg-zinc-800' : 'bg-zinc-100'
                    }`}
                  />

                  {/* Features List with Filled Blue Checkmark Circles */}
                  <ul className="space-y-3">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-xs">
                        <div className="w-4 h-4 rounded-full bg-[#61dafb] text-slate-950 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span
                          className={`font-medium ${
                            isDark ? 'text-zinc-200' : 'text-zinc-700'
                          }`}
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};