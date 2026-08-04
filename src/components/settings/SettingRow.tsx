import React from 'react';
import { ChevronRight } from 'lucide-react';

export type SettingSection = {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
};

interface SettingRowProps {
  section: SettingSection;
  onClick: () => void;
}

export const SettingRow: React.FC<SettingRowProps> = ({ section, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200"
    >
      <div className="flex items-center">
        <div 
          className="p-3 rounded-full mr-4"
          style={{ backgroundColor: `${section.color}10`, color: section.color }}
        >
          <section.icon size={20} />
        </div>
        <div className="text-left">
          <h3 className="font-medium">{section.title}</h3>
          <p className="text-sm text-gray-500">{section.description}</p>
        </div>
      </div>
      
      <ChevronRight size={18} className="text-gray-400" />
    </button>
  );
};
