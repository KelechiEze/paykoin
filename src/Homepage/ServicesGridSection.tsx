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
    <section id="services" className="bg-zinc-50 text-zinc-900 py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 select-none">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Sticky / Headline Area */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-zinc-500 font-medium text-sm tracking-wide">
              Build huge wealth with clear plans and expert guidance
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 leading-[1.15]">
              Tax efficient solutions and ongoing tailored support
            </h2>

            <p className="text-zinc-600 text-base sm:text-lg leading-relaxed">
              Our consultants will make sure that you saved enough money to live
              your lifestyle, unlocking potential for growth profitability that
              proof investment in our mission as advisors!
            </p>

            <button
              onClick={onOpenConsultation}
              className="mt-4 bg-zinc-900 hover:bg-black active:bg-zinc-800 text-white px-6 py-3.5 rounded-md font-bold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-md cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Login Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {SERVICE_ITEMS.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white p-7 sm:p-8 rounded-xl border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-[#61dafb]/20 border border-[#61dafb]/30 text-[#0284c7] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                      <IconComp className="w-6 h-6 stroke-[2]" />
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-zinc-600 text-sm leading-relaxed">
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
