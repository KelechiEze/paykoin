import React from 'react';
import { ChevronRight } from 'lucide-react';
import { SettingSection } from './SettingRow';
import { PreferencesSettings } from './sections/PreferencesSettings';
import { NotificationSettings } from './sections/NotificationSettings';
import { SecuritySettings } from './sections/SecuritySettings';
import { PaymentSettings } from './sections/PaymentSettings';

interface SettingDetailProps {
  section: SettingSection;
  onBack: () => void;
}

export const SettingDetail: React.FC<SettingDetailProps> = ({ section, onBack }) => {
  // Render content based on the section
  const renderContent = () => {
    switch (section.id) {
      case 'preferences':
        return <PreferencesSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'payment':
        return <PaymentSettings />;
      default:
        return (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-600">
              {section.title} Settings
            </h3>
            <p className="text-gray-500 mt-2">
              These settings are under development.
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="animate-fade-in">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronRight size={18} className="mr-2 transform rotate-180" />
        <span>Back to Settings</span>
      </button>
      
      <div className="dashboard-card mb-6">
        <div className="flex items-center mb-6">
          <div 
            className="p-3 rounded-full mr-4"
            style={{ backgroundColor: `${section.color}10`, color: section.color }}
          >
            <section.icon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="text-gray-500">{section.description}</p>
          </div>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};
