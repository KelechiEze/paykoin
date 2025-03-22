import React, { useState } from 'react';
import { Lock, KeyRound, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

export const SecuritySettings: React.FC = () => {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(localStorage.getItem('twoFactorEnabled') === 'true');
  
  const handleTwoFactorToggle = (value: boolean) => {
    setTwoFactorEnabled(value);
    localStorage.setItem('twoFactorEnabled', String(value));
    toast({
      title: value ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled',
      description: `Your account security settings have been updated.`,
    });
  };

  const handleChangePassword = () => {
    toast({
      title: 'Password Change Requested',
      description: 'A password reset link has been sent to your email address.',
    });
  };

  const handleLogoutDevices = () => {
    toast({
      title: 'Devices Logged Out',
      description: 'All other devices have been logged out successfully.',
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
          </div>
          
          <Switch 
            checked={twoFactorEnabled}
            onCheckedChange={handleTwoFactorToggle}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
            <KeyRound size={18} />
          </div>
          <div>
            <h3 className="font-medium">Change Password</h3>
            <p className="text-sm text-gray-500">Update your account password</p>
          </div>
        </div>
        <button 
          onClick={handleChangePassword}
          className="w-full py-2 px-4 bg-crypto-blue text-white rounded-lg hover:bg-crypto-blue/90 transition-colors"
        >
          Change Password
        </button>
      </div>

      <div className="p-4 rounded-xl border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
            <UserCheck size={18} />
          </div>
          <div>
            <h3 className="font-medium">Active Sessions</h3>
            <p className="text-sm text-gray-500">Manage your active login sessions</p>
          </div>
        </div>
        <button 
          onClick={handleLogoutDevices}
          className="w-full py-2 px-4 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
        >
          Logout All Other Devices
        </button>
      </div>
    </div>
  );
};
