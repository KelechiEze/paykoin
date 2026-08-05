import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Users,
  BarChart3,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react';

interface ServicesGridSectionProps {
  onOpenConsultation: () => void;
}

const SERVICE_ITEMS = [
  {
    id: 'process',
    title: 'Process Optimization',
    icon: ShieldCheck,
    description:
      'We believe investing powers each fund and aim to increase diversity of ideas and reduce volatility of investors funds!',
  },
  {
    id: 'workforce',
    title: 'Workforce Planning',
    icon: Users,
    description:
      'Keeping close contact with our management and spending time on location, drive a deep operational understanding.',
  },
  {
    id: 'lead',
    title: 'Lead Generation',
    icon: BarChart3,
    description:
      'Our research is more than just numbers. Year over year, we get to know the people who make the company work.',
  },
  {
    id: 'profitability',
    title: 'Profitability Analysis',
    icon: TrendingUp,
    description:
      'Financial success depends on relying on a team of experts with in depth knowledge and massive experience in business.',
  },
  {
    id: 'expert',
    title: 'Expert Strategies',
    icon: BrainCircuit,
    description:
      'As artificial intelligence and the internet of things move from concept to reality, all business executives worry about change forces.',
  },
];

export const ServicesGridSection: React.FC<ServicesGridSectionProps> = ({
  onOpenConsultation,
}) => {
  return (
    <section id="services" className="bg-zinc-50 text-zinc-900 py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 select-none">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Sticky / Headline Area */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-zinc-500 font-medium text-xs tracking-wide">
              Build huge wealth with clear plans and expert guidance
            </span>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-zinc-900 leading-[1.25]">
              Tax efficient solutions and ongoing tailored support
            </h2>

            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
              Our consultants will make sure that you saved enough money to live
              your lifestyle, unlocking potential for growth profitability that
              proof investment in our mission as advisors!
            </p>

            <button
              onClick={onOpenConsultation}
              className="mt-2 bg-zinc-900 hover:bg-black active:bg-zinc-800 text-white px-5 py-2.5 rounded-md font-semibold text-sm sm:text-base flex items-center gap-2 transition-all shadow-md cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Login Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {SERVICE_ITEMS.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#61dafb]/20 border border-[#61dafb]/30 text-[#0284c7] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <IconComp className="w-5 h-5 stroke-[2]" />
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-2 tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};