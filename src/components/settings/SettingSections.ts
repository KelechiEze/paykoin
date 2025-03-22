import { 
    Globe, Bell, Shield, CreditCard
  } from 'lucide-react';
  import { SettingSection } from './SettingRow';
  
  export const settingSections: SettingSection[] = [
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
  