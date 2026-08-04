import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  FileText,
  Users,
  ArrowRight,
  ChevronsRight,
} from 'lucide-react';

interface StrategyItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  image: string;
  badgeQuote: string;
}

const STRATEGY_ITEMS: StrategyItem[] = [
  {
    id: 'landscape',
    title: 'Competitive Landscape Analysis',
    icon: BarChart2,
    description:
      'With a deep understanding of the business dynamics process, we will make sure to transform any challenges into growth strategies tailored to your goals',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    badgeQuote: 'We craft a plan that fits business kinds timeline & values',
  },
  {
    id: 'revenue',
    title: 'Revenue Optimization Strategies',
    icon: TrendingUp,
    description:
      'Our team of seasoned strategists will make sure to bring decades of combined experience across all business industries and markets to help your growth',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    badgeQuote: 'Smart plans, expert advice, growth with momentum.',
  },
  {
    id: 'pricing',
    title: 'Pricing & Profitability Analysis',
    icon: FileText,
    description:
      "We don't just advise, we partner with our clients to uncover all business opportunities, navigate complexity and drive true and meaningful results for you",
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    badgeQuote: 'Lean financial tactics designed for maximum ROI.',
  },
  {
    id: 'retention',
    title: 'Customer Retention Strategy',
    icon: Users,
    description:
      'We co-create tailored business solutions that are grounded in your market reality and designed to be both actionable and sustainable now and in the future',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    badgeQuote: 'Scale wealth with disciplined plans & advisor expertise.',
  },
];

interface InteractiveStrategySectionProps {
  onOpenConsultation: () => void;
}

export const InteractiveStrategySection: React.FC<InteractiveStrategySectionProps> = ({
  onOpenConsultation,
}) => {
  const [activeId, setActiveId] = useState<string>('landscape');

  const activeItem =
    STRATEGY_ITEMS.find((item) => item.id === activeId) || STRATEGY_ITEMS[0];

  return (
    <section className="bg-white text-zinc-900 py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Top Header & Intro text */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-zinc-900 tracking-tight leading-[1.12] mb-6 font-sans">
            Turn savings into wealth
            <br />
            with expert guidance
          </h2>
          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-normal">
            Modern finance built around your goals. We combine proven strategies,
            personalized advice, and transparent fees to help you grow, protect, and
            enjoy your wealth. We use data-backed investing, and transparent fees to
            simplify your wealth. Ready to take control?
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenConsultation}
              className="bg-[#61dafb] hover:bg-[#4faee3] text-slate-950 px-6 py-3.5 rounded-md font-bold text-sm sm:text-base flex items-center gap-2 transition-all shadow-md shadow-[#61dafb]/20 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Explore All Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenConsultation}
              className="bg-white border border-zinc-800 hover:bg-zinc-50 text-zinc-900 px-7 py-3.5 rounded-md font-bold text-sm sm:text-base transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Login Now</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Accordion Column */}
          <div className="lg:col-span-6 space-y-2 pt-2">
            {STRATEGY_ITEMS.map((item) => {
              const isActive = item.id === activeId;
              const IconComp = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  className={`border-b border-zinc-200/90 py-5 transition-all duration-300 cursor-pointer group ${
                    isActive ? 'border-zinc-400' : 'hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <IconComp
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-700'
                      }`}
                    />
                    <h3
                      className={`text-xl sm:text-2xl font-bold tracking-tight transition-colors ${
                        isActive
                          ? 'text-zinc-900'
                          : 'text-zinc-400 group-hover:text-zinc-600'
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Expanded Content with smooth transition */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isActive
                        ? 'max-h-40 opacity-100 mt-3 pl-8'
                        : 'max-h-0 opacity-0 pl-8 pointer-events-none'
                    }`}
                  >
                    <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-xl">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Image Container Column */}
          <div className="lg:col-span-6 sticky top-28">
            <div className="relative rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl h-[420px] sm:h-[480px] lg:h-[540px] border border-zinc-100 bg-zinc-900">
              {/* Stacked Images for Smooth Crossfade */}
              {STRATEGY_ITEMS.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <img
                    key={item.id}
                    src={item.image}
                    alt={item.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                      isActive
                        ? 'opacity-100 scale-100 filter contrast-105'
                        : 'opacity-0 scale-105 pointer-events-none'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                );
              })}

              {/* Gradient dark vignette at bottom for overlay text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              {/* Floating Dark Card with Blue Chevrons */}
              <div className="absolute bottom-6 right-6 left-6 sm:left-auto sm:max-w-sm bg-zinc-950/90 text-white p-4 sm:p-4.5 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md flex items-center gap-3.5 transition-all duration-500 transform">
                <div className="w-10 h-10 rounded-xl bg-[#61dafb] flex items-center justify-center text-slate-950 shrink-0 shadow-md shadow-[#61dafb]/20">
                  <ChevronsRight className="w-6 h-6 stroke-[3]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white/95 leading-snug">
                  {activeItem.badgeQuote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
