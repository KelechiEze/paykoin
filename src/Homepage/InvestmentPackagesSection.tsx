import React from 'react';
import { ArrowRight, Check, TrendingUp } from 'lucide-react';

interface InvestmentPackagesSectionProps {
  onOpenConsultation: () => void;
}

const INVESTMENT_PACKAGES = [
  {
    id: 'tier1',
    name: 'Starter Tier',
    range: '$500 – $5,000',
    subtext: 'Ideal for entry-level investors looking to establish a secure crypto portfolio with reliable weekly returns.',
    priceDisplay: '$500 – $5,000',
    unit: 'Deposit Range',
    roi: '5% Profit / Week',
    profitRate: '5%',
    popular: false,
    features: [
      '5% Weekly Profit Yield',
      '$500 Minimum Investment',
      'Automated Blue-Chip DCA (BTC, ETH, SOL)',
      'Weekly Automated Profit Payouts',
      'Cold Custody Security Protection',
      '24/7 Investor Portal Access',
    ],
  },
  {
    id: 'tier2',
    name: 'Growth Tier',
    range: '$5,000 – $8,000',
    subtext: 'Built for growing investors seeking accelerated weekly returns and enhanced staking yield performance.',
    priceDisplay: '$5,000 – $8,000',
    unit: 'Deposit Range',
    roi: '8% Profit / Week',
    profitRate: '8%',
    popular: false,
    features: [
      '8% Weekly Profit Yield',
      '$5,000 Minimum Investment',
      'Proof-of-Stake Yield & Staking Pool',
      'Enhanced Analytics & Reporting',
      'Weekly Automated Profit Payouts',
      'Priority Email & Chat Support',
    ],
  },
  {
    id: 'tier3',
    name: 'Professional Tier',
    range: '$8,000 – $25,000',
    subtext: 'Designed for serious investors seeking high-tier weekly algorithmic trading yields and dedicated strategy.',
    priceDisplay: '$8,000 – $10,000',
    unit: 'Deposit Range',
    roi: '10% Profit / Week',
    profitRate: '10%',
    popular: true,
    features: [
      '10% Weekly Profit Yield',
      '$8,000 Minimum Investment',
      'Algorithmic Trading & Yield Strategy',
      'Layer-1 & Layer-2 Validator Access',
      'Dedicated Wealth Advisor Consultations',
      'Priority VIP Direct Support',
    ],
  },
  {
    id: 'tier4',
    name: 'Enterprise Tier',
    range: '$50,000 & Above',
    subtext: 'Designed for institutional & high-net-worth investors requiring maximum yield brackets and bespoke management.',
    priceDisplay: '$50,000+',
    unit: 'Deposit Range',
    roi: '10% – 15% Profit / Week',
    profitRate: '10% – 15%',
    popular: false,
    features: [
      '10% – 15% Weekly Profit Yield',
      '$50,000 Minimum Investment',
      'End-to-End Institutional Asset Management',
      'Arbitrage & Custom Risk Mitigation',
      'Dedicated Private Portfolio Manager',
      '24/7 Executive Direct VIP Line',
    ],
  },
];

export const InvestmentPackagesSection: React.FC<InvestmentPackagesSectionProps> = ({
  onOpenConsultation,
}) => {
  return (
    <section id="packages" className="bg-[#fcfdfc] text-zinc-900 py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-zinc-500 font-medium text-[10px] sm:text-xs tracking-wide block mb-2">
            Structured Tiered Investment Yields
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight leading-[1.2] font-sans">
            Guaranteed Weekly Profit
            <br />
            Investment Tiers
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-zinc-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Minimum deposit starts at <span className="font-bold text-zinc-900">$500</span>. Each tier unlocks higher weekly profit percentages up to <span className="font-bold text-zinc-900">15% per week</span>.
          </p>
        </div>

        {/* 4 Tier Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
          {INVESTMENT_PACKAGES.map((pkg) => {
            const isDark = pkg.popular;

            return (
              <div
                key={pkg.id}
                className={`rounded-[24px] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 ${
                  isDark
                    ? 'bg-zinc-950 text-white shadow-2xl border border-zinc-800 scale-[1.02] sm:scale-100 lg:scale-[1.02]'
                    : 'bg-white text-zinc-900 border border-zinc-200/90 shadow-sm hover:shadow-xl'
                }`}
              >
                <div>
                  {/* ROI Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold uppercase tracking-wider mb-2.5 ${
                    isDark
                      ? 'bg-[#61dafb]/20 border-[#61dafb]/40 text-[#61dafb]'
                      : 'bg-[#61dafb]/20 border-[#61dafb]/40 text-[#0284c7]'
                  }`}>
                    <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                    <span>{pkg.roi}</span>
                  </div>

                  {/* Card Header Title */}
                  <h3
                    className={`text-base sm:text-lg font-extrabold tracking-tight mb-0.5 ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    {pkg.name}
                  </h3>

                  <div className="text-[10px] font-bold text-[#0284c7] mb-2.5">
                    Range: {pkg.range}
                  </div>

                  <p
                    className={`text-[10px] sm:text-[11px] leading-relaxed mb-4 font-normal ${
                      isDark ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {pkg.subtext}
                  </p>

                  {/* Price/Range Display */}
                  <div className="flex flex-col mb-4">
                    <span
                      className={`text-xl sm:text-2xl font-extrabold tracking-tight font-sans ${
                        isDark ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {pkg.priceDisplay}
                    </span>
                    <span
                      className={`text-[9px] font-medium mt-0.5 ${
                        isDark ? 'text-zinc-400' : 'text-zinc-500'
                      }`}
                    >
                      {pkg.unit}
                    </span>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    onClick={onOpenConsultation}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-[10px] sm:text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md transform hover:-translate-y-0.5 mb-4 ${
                      isDark
                        ? 'bg-[#61dafb] hover:bg-[#4faee3] text-slate-950 shadow-lg shadow-[#61dafb]/25'
                        : 'bg-zinc-900 hover:bg-black text-white'
                    }`}
                  >
                    <span>Login & Invest</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Divider */}
                  <div
                    className={`w-full h-px mb-4 ${
                      isDark ? 'bg-zinc-800' : 'bg-zinc-100'
                    }`}
                  />

                  {/* Features List */}
                  <ul className="space-y-2.5">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[10px] sm:text-[11px]">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#61dafb] text-slate-950 flex items-center justify-center shrink-0">
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