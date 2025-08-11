import React, { useState, useEffect } from 'react';
import { Mail, Bell, BellOff, DollarSign, Shield, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '../../../context/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface NotificationSettings {
  emailNotifs: boolean;
  pushNotifs: boolean;
  priceAlerts: boolean;
  securityAlerts: boolean;
}

export const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifs: true,
    pushNotifs: true,
    priceAlerts: true,
    securityAlerts: true,
  });

  // Load settings from Firestore on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'notifications');
        const docSnap = await getDoc(settingsRef);
        
        if (docSnap.exists()) {
          setSettings(docSnap.data() as NotificationSettings);
        } else {
          // Create default settings if they don't exist
          await setDoc(settingsRef, settings);
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load notification settings',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [currentUser]);

  const handleToggle = async (setting: keyof NotificationSettings, value: boolean) => {
    if (!currentUser) return;
    
    // Optimistic UI update
    setSettings(prev => ({ ...prev, [setting]: value }));
    
    try {
      // Update Firestore
      const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'notifications');
      await updateDoc(settingsRef, { [setting]: value });
      
      // Show success toast
      toast({
        title: `${value ? 'Enabled' : 'Disabled'} ${settingName(setting)}`,
        description: `Your notification settings have been updated.`,
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      
      // Revert on error
      setSettings(prev => ({ ...prev, [setting]: !value }));
      
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update notification settings. Please try again.',
      });
    }
  };

  const settingName = (key: keyof NotificationSettings): string => {
    const names = {
      emailNotifs: 'Email Notifications',
      pushNotifs: 'Push Notifications',
      priceAlerts: 'Price Alerts',
      securityAlerts: 'Security Alerts',
    };
    return names[key];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-crypto-blue" size={32} />
        <span className="ml-3 text-gray-600">Loading notification settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
          </div>
          
          <Switch 
            checked={settings.emailNotifs}
            onCheckedChange={(val) => handleToggle('emailNotifs', val)}
            disabled={!currentUser}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-3 ${
              settings.pushNotifs 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {settings.pushNotifs ? <Bell size={18} /> : <BellOff size={18} />}
            </div>
            <div>
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications on your device</p>
            </div>
          </div>
          
          <Switch 
            checked={settings.pushNotifs}
            onCheckedChange={(val) => handleToggle('pushNotifs', val)}
            disabled={!currentUser}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
              <DollarSign size={18} />
            </div>
            <div>
              <h3 className="font-medium">Price Alerts</h3>
              <p className="text-sm text-gray-500">Get notified when prices change significantly</p>
              {settings.priceAlerts && (
                <p className="text-xs text-blue-500 mt-1">
                  You'll receive alerts for coins in your watchlist
                </p>
              )}
            </div>
          </div>
          
          <Switch 
            checked={settings.priceAlerts}
            onCheckedChange={(val) => handleToggle('priceAlerts', val)}
            disabled={!currentUser}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-medium">Security Alerts</h3>
              <p className="text-sm text-gray-500">Get notified about security events</p>
              {settings.securityAlerts && (
                <p className="text-xs text-red-500 mt-1">
                  Includes login attempts and account changes
                </p>
              )}
            </div>
          </div>
          
          <Switch 
            checked={settings.securityAlerts}
            onCheckedChange={(val) => handleToggle('securityAlerts', val)}
            disabled={!currentUser}
          />
        </div>
      </div>

      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mt-6">
        <h3 className="font-medium text-blue-800 flex items-center">
          <Bell className="mr-2" size={18} />
          Notification Delivery
        </h3>
        <p className="text-sm text-blue-700 mt-2">
          When enabled, notifications will be delivered to all your verified devices and email addresses.
          You can manage delivery methods in your account settings.
        </p>
      </div>
    </div>
  );
};