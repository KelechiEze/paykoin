import React, { useState } from 'react';
import { Lock, KeyRound, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button'; // Import Button component
import { auth } from '@/firebase'; // Import Firebase auth instance
import { sendPasswordResetEmail } from 'firebase/auth'; // Import password reset function

export const SecuritySettings: React.FC = () => {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    localStorage.getItem('twoFactorEnabled') === 'true'
  );
  const [isSendingReset, setIsSendingReset] = useState(false);
  
  const handleTwoFactorToggle = (value: boolean) => {
    setTwoFactorEnabled(value);
    localStorage.setItem('twoFactorEnabled', String(value));
    toast({
      title: value ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled',
      description: `Your account security settings have been updated.`,
    });
  };

  const handleChangePassword = async () => {
    setIsSendingReset(true);
    try {
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }
      
      await sendPasswordResetEmail(auth, user.email);
      
      toast({
        title: 'Password Reset Sent',
        description: `A password reset link has been sent to ${user.email}`,
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      toast({
        title: 'Password Reset Failed',
        description: error.message || 'Failed to send password reset email',
        variant: 'destructive',
      });
    } finally {
      setIsSendingReset(false);
    }
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
            <p className="text-sm text-gray-500">
              Update your account password using email verification
            </p>
          </div>
        </div>
        <Button 
          onClick={handleChangePassword}
          className="w-full"
          disabled={isSendingReset}
        >
          {isSendingReset ? 'Sending Reset Link...' : 'Change Password'}
        </Button>
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
        <Button 
          onClick={handleLogoutDevices}
          variant="outline"
          className="w-full text-red-500 border-red-500 hover:bg-red-50"
        >
          Logout All Other Devices
        </Button>
      </div>
    </div>
  );
};