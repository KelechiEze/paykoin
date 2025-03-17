
import React from 'react';
import { User, Mail, Phone, ShieldCheck, Bell, Key, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const Profile: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Profile</h1>
      
      {/* Profile Header */}
      <div className="dashboard-card flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
          <User size={32} className="text-gray-400" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold">Alex Johnson</h2>
          <p className="text-gray-500">alex.johnson@example.com</p>
          <p className="text-sm text-gray-500 mt-1">Member since September 2023</p>
          
          <div className="mt-4">
            <button className="py-2 px-4 bg-crypto-blue text-white rounded-lg text-sm font-medium hover:bg-crypto-blue/90 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      
      {/* Profile Information */}
      <div className="dashboard-card">
        <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
        
        <div className="space-y-4">
          <InfoItem icon={Mail} label="Email Address" value="alex.johnson@example.com" />
          <InfoItem icon={Phone} label="Phone Number" value="+1 (555) 123-4567" />
          <InfoItem icon={ShieldCheck} label="Two-Factor Authentication" value="Enabled" highlight />
        </div>
        
        <div className="mt-6">
          <button className="py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Update Information
          </button>
        </div>
      </div>
      
      {/* Security Settings */}
      <div className="dashboard-card">
        <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
        
        <div className="space-y-6">
          <SecurityItem 
            icon={Lock} 
            title="Change Password" 
            description="Update your password regularly to maintain account security"
          />
          
          <SecurityItem 
            icon={Key} 
            title="API Keys" 
            description="Manage your API keys for external applications"
            badge="2 Active"
          />
          
          <SecurityItem 
            icon={Bell} 
            title="Notifications" 
            description="Configure how you receive security alerts and updates"
          />
        </div>
      </div>
      
      {/* Account Verification Section */}
      <div className="dashboard-card">
        <div className="flex items-start">
          <div className="p-3 rounded-full bg-orange-50 text-orange-500 mr-4">
            <ShieldCheck size={20} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium">Complete Account Verification</h3>
            <p className="text-gray-600 mt-1">Verify your identity to unlock higher transaction limits and enhanced account features.</p>
            
            <button className="mt-4 py-2 px-4 bg-crypto-blue text-white rounded-lg text-sm font-medium hover:bg-crypto-blue/90 transition-colors">
              Start Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface InfoItemProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  highlight?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value, highlight }) => {
  return (
    <div className="flex items-center">
      <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-4">
        <Icon size={18} />
      </div>
      
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={cn(
          "font-medium",
          highlight ? "text-green-600" : "text-gray-800"
        )}>{value}</p>
      </div>
    </div>
  );
};

interface SecurityItemProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  badge?: string;
}

const SecurityItem: React.FC<SecurityItemProps> = ({ icon: Icon, title, description, badge }) => {
  return (
    <div className="flex py-4 border-b last:border-b-0">
      <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-4 h-fit">
        <Icon size={18} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          {badge && (
            <span className="text-xs bg-crypto-blue/10 text-crypto-blue px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      
      <button className="ml-4 text-crypto-blue hover:underline">
        Manage
      </button>
    </div>
  );
};

export default Profile;
