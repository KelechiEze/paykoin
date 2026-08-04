import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, UserCheck, Laptop, Smartphone, Tablet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { auth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getDeviceType, getLocationFromIP } from '@/lib/device-utils';

type DeviceSession = {
  id: string;
  deviceName: string;
  deviceType: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
};

export const SecuritySettings: React.FC = () => {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    localStorage.getItem('twoFactorEnabled') === 'true'
  );
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [activeSessions, setActiveSessions] = useState<DeviceSession[]>([]);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const savedSessions = localStorage.getItem('deviceSessions');
        const sessions: DeviceSession[] = savedSessions 
          ? JSON.parse(savedSessions) 
          : [];
        
        if (!sessions.some(session => session.isCurrent)) {
          const location = await getLocationFromIP();
          const newSession: DeviceSession = {
            id: `session-${Date.now()}`,
            deviceName: navigator.userAgent,
            deviceType: getDeviceType(),
            location: location || 'Unknown location',
            lastActive: new Date().toISOString(),
            isCurrent: true
          };
          
          const updatedSessions = [...sessions, newSession];
          localStorage.setItem('deviceSessions', JSON.stringify(updatedSessions));
          setActiveSessions(updatedSessions);
        } else {
          setActiveSessions(sessions);
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    };

    loadSessions();
  }, []);

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

  const handleOpenSessionModal = () => {
    setIsSessionModalOpen(true);
    setSelectedSessions([]);
  };

  const handleSessionSelection = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleLogoutSessions = () => {
    const sessionsToKeep = activeSessions.filter(
      session => !selectedSessions.includes(session.id) || session.isCurrent
    );
    
    localStorage.setItem('deviceSessions', JSON.stringify(sessionsToKeep));
    setActiveSessions(sessionsToKeep);
    
    toast({
      title: 'Sessions Logged Out',
      description: selectedSessions.length > 0 
        ? `${selectedSessions.length} devices have been logged out` 
        : 'No devices were selected',
    });
    
    setIsSessionModalOpen(false);
  };

  const handleLogoutAll = () => {
    const currentSession = activeSessions.find(session => session.isCurrent);
    const updatedSessions = currentSession ? [currentSession] : [];
    
    localStorage.setItem('deviceSessions', JSON.stringify(updatedSessions));
    setActiveSessions(updatedSessions);
    
    toast({
      title: 'All Devices Logged Out',
      description: 'All other devices have been logged out successfully',
    });
    
    setIsSessionModalOpen(false);
  };

  const getDeviceIcon = (deviceType: string) => {
    switch(deviceType.toLowerCase()) {
      case 'mobile': return <Smartphone size={16} className="text-gray-500" />;
      case 'tablet': return <Tablet size={16} className="text-gray-500" />;
      default: return <Laptop size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Two-Factor Authentication Section */}
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

      {/* Password Change Section */}
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

      {/* Active Sessions Section */}
      <div className="p-4 rounded-xl border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
            <UserCheck size={18} />
          </div>
          <div>
            <h3 className="font-medium">Active Sessions</h3>
            <p className="text-sm text-gray-500">
              {activeSessions.length} device{activeSessions.length !== 1 ? 's' : ''} logged in
            </p>
          </div>
        </div>
        <Button 
          onClick={handleOpenSessionModal}
          variant="outline"
          className="w-full text-red-500 border-red-500 hover:bg-red-50"
        >
          Manage Devices
        </Button>
      </div>

      {/* Session Management Modal */}
      <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
        <DialogContent className="max-w-md sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Active Sessions</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto space-y-4 py-2">
            {activeSessions.map((session) => (
              <div 
                key={session.id} 
                className={`flex items-center p-3 rounded-lg border ${
                  session.isCurrent 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center mr-3">
                  {getDeviceIcon(session.deviceType)}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium">
                    {session.deviceType} {session.isCurrent && '(This device)'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {session.location} · Last active: {
                      new Date(session.lastActive).toLocaleDateString()
                    }
                  </div>
                </div>
                
                {!session.isCurrent ? (
                  <Checkbox 
                    checked={selectedSessions.includes(session.id)}
                    onCheckedChange={() => handleSessionSelection(session.id)}
                    className="ml-2"
                  />
                ) : (
                  <div className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    Current
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            <div>
              {selectedSessions.length > 0 && (
                <span className="text-sm text-gray-500 mr-3">
                  {selectedSessions.length} selected
                </span>
              )}
              <Button
                variant="destructive"
                onClick={handleLogoutAll}
                disabled={activeSessions.length <= 1}
              >
                Logout All Others
              </Button>
            </div>
            <div className="flex space-x-2 mt-2 sm:mt-0">
              <Button 
                variant="outline" 
                onClick={() => setIsSessionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleLogoutSessions}
                disabled={selectedSessions.length === 0}
                variant="destructive"
              >
                Logout Selected
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
