import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { settingSections } from '@/components/settings/SettingSections';
import { SettingRow } from '@/components/settings/SettingRow';
import { SettingDetail } from '@/components/settings/SettingDetail';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // If a section is selected, show its details
  if (activeSection) {
    const section = settingSections.find(s => s.id === activeSection);
    if (!section) return null;
    
    return <SettingDetail section={section} onBack={() => setActiveSection(null)} />;
  }
  
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Settings</h1>
      
      <div className="dashboard-card">
        <p className="text-gray-600 mb-6">Configure your account settings and preferences.</p>
        
        <div className="space-y-3">
          {settingSections.map((section) => (
            <SettingRow 
              key={section.id} 
              section={section} 
              onClick={() => setActiveSection(section.id)} 
            />
          ))}
        </div>
      </div>
      
      {/* Support Card */}
      <div className="dashboard-card">
        <div className="flex items-start">
          <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
            <HelpCircle size={20} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium">Need Help?</h3>
            <p className="text-gray-600 mt-1">Our support team is ready to assist you with any questions or issues.</p>
            
            <button className="mt-4 py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
