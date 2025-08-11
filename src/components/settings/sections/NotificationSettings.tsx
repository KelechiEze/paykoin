import React, { useState } from 'react';
import { Mail, Bell, BellOff, DollarSign, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

export const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const [emailNotifs, setEmailNotifs] = useState(localStorage.getItem('emailNotifs') !== 'false');
  const [pushNotifs, setPushNotifs] = useState(localStorage.getItem('pushNotifs') !== 'false');
  const [priceAlerts, setPriceAlerts] = useState(localStorage.getItem('priceAlerts') !== 'false');
  const [securityAlerts, setSecurityAlerts] = useState(localStorage.getItem('securityAlerts') !== 'false');

  const handleToggle = (setting: string, value: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(value);
    localStorage.setItem(setting, String(value));
    toast({
      title: `${value ? 'Enabled' : 'Disabled'} ${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`,
      description: `Your notification settings have been updated.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
          </div>
          
          <Switch 
            checked={emailNotifs}
            onCheckedChange={(val) => handleToggle('emailNotifs', val, setEmailNotifs)}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
              {pushNotifs ? <Bell size={18} /> : <BellOff size={18} />}
            </div>
            <div>
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications on your device</p>
            </div>
          </div>
          
          <Switch 
            checked={pushNotifs}
            onCheckedChange={(val) => handleToggle('pushNotifs', val, setPushNotifs)}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
              <DollarSign size={18} />
            </div>
            <div>
              <h3 className="font-medium">Price Alerts</h3>
              <p className="text-sm text-gray-500">Receive notifications for price changes</p>
            </div>
          </div>
          
          <Switch 
            checked={priceAlerts}
            onCheckedChange={(val) => handleToggle('priceAlerts', val, setPriceAlerts)}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-medium">Security Alerts</h3>
              <p className="text-sm text-gray-500">Receive notifications for security-related events</p>
            </div>
          </div>
          
          <Switch 
            checked={securityAlerts}
            onCheckedChange={(val) => handleToggle('securityAlerts', val, setSecurityAlerts)}
          />
        </div>
      </div>
    </div>
  );
};
