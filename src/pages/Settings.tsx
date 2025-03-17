
import React, { useState } from 'react';
import { 
  Globe, Bell, Shield, CreditCard, ChevronRight, 
  Moon, Sun, Languages, DollarSign, HelpCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingSection = {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
};

const settingSections: SettingSection[] = [
  {
    id: 'preferences',
    icon: Globe,
    title: 'Preferences',
    description: 'Language, theme and display options',
    color: '#0EA5E9',
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Configure how and when you receive alerts',
    color: '#8B5CF6',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security',
    description: 'Password, two-factor authentication and login history',
    color: '#10B981',
  },
  {
    id: 'payment',
    icon: CreditCard,
    title: 'Payment Methods',
    description: 'Manage your linked payment methods',
    color: '#F97316',
  },
];

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

interface SettingRowProps {
  section: SettingSection;
  onClick: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ section, onClick }) => {
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

interface SettingDetailProps {
  section: SettingSection;
  onBack: () => void;
}

// Dummy component for settings details based on section
const SettingDetail: React.FC<SettingDetailProps> = ({ section, onBack }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('english');
  const [currency, setCurrency] = useState('usd');
  
  // Rendering preferences section (as an example)
  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
              {darkMode ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div>
              <h3 className="font-medium">Dark Mode</h3>
              <p className="text-sm text-gray-500">Switch between light and dark theme</p>
            </div>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              darkMode ? "bg-crypto-blue" : "bg-gray-200"
            )}
          >
            <span 
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                darkMode ? "translate-x-6" : "translate-x-1"
              )} 
            />
          </button>
        </div>
      </div>
      
      <div className="p-4 rounded-xl border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
            <Languages size={18} />
          </div>
          <div>
            <h3 className="font-medium">Language</h3>
            <p className="text-sm text-gray-500">Select your preferred language</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {['english', 'spanish', 'french', 'german', 'japanese'].map((lang) => (
            <button 
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                "w-full py-2 px-3 rounded-lg text-left transition-colors",
                language === lang ? "bg-crypto-blue/10 text-crypto-blue" : "hover:bg-gray-50"
              )}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
              {language === lang && (
                <span className="ml-auto float-right">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 rounded-xl border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
            <DollarSign size={18} />
          </div>
          <div>
            <h3 className="font-medium">Currency</h3>
            <p className="text-sm text-gray-500">Select your preferred display currency</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {[
            { id: 'usd', name: 'US Dollar (USD)' },
            { id: 'eur', name: 'Euro (EUR)' },
            { id: 'gbp', name: 'British Pound (GBP)' },
            { id: 'jpy', name: 'Japanese Yen (JPY)' }
          ].map((curr) => (
            <button 
              key={curr.id}
              onClick={() => setCurrency(curr.id)}
              className={cn(
                "w-full py-2 px-3 rounded-lg text-left transition-colors",
                currency === curr.id ? "bg-crypto-blue/10 text-crypto-blue" : "hover:bg-gray-50"
              )}
            >
              {curr.name}
              {currency === curr.id && (
                <span className="ml-auto float-right">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Render placeholder content for other sections
  const renderPlaceholder = () => (
    <div className="text-center py-8">
      <h3 className="text-lg font-medium text-gray-600">
        {section.title} Settings
      </h3>
      <p className="text-gray-500 mt-2">
        These settings are under development.
      </p>
    </div>
  );
  
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
        
        {section.id === 'preferences' ? renderPreferences() : renderPlaceholder()}
      </div>
    </div>
  );
};

export default Settings;
