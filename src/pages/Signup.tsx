import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Lock, User, Eye, EyeOff, CheckCircle, 
  Loader2, Check, Server, Sparkles, Shield,
  Cpu, Zap, Coins, Globe
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/layout/AuthLayout';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, updateDoc, collection, getDocs } from 'firebase/firestore';

interface PasswordRequirementProps {
  text: string;
  satisfied: boolean;
}

interface WalletCreationModalProps {
  isOpen: boolean;
  currentStep: number;
  progress: number;
  onComplete: () => void;
}

// Interface for IP data
interface IPData {
  ip: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
  isp: string;
  latitude: number;
  longitude: number;
}

const WalletCreationModal: React.FC<WalletCreationModalProps> = ({ 
  isOpen, 
  currentStep, 
  progress,
  onComplete 
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      title: "Creating Your Crypto Wallets",
      description: "Generating secure wallets for your digital assets...",
      icon: <div className="relative">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <Coins className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" />
      </div>,
      showProgress: true
    },
    {
      title: "Wallets Created Successfully!",
      description: "Your secure crypto wallets are ready to use.",
      icon: <div className="relative">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
      </div>,
      showProgress: false
    },
    {
      title: "Connect to AI Trading Assistant?",
      description: "Maximize your crypto potential with our advanced AI trading bot that analyzes market trends 24/7",
      icon: <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <Cpu className="h-6 w-6 text-white" />
        </div>
      </div>,
      showProgress: false
    },
    {
      title: "Connecting to AI Server",
      description: "Securely linking your wallets to our AI trading infrastructure...",
      icon: <div className="relative">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <Server className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600" />
      </div>,
      showProgress: true
    },
    {
      title: "AI Connection Established!",
      description: "Your assets are now connected to our AI trading engine for optimized performance",
      icon: <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Zap className="h-6 w-6 text-white" />
        </div>
      </div>,
      showProgress: false
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {currentStepData.icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">{currentStepData.title}</h3>
          <p className="text-gray-600 mb-6">{currentStepData.description}</p>
          
          {currentStepData.showProgress && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {currentStep === 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  <strong>Please don't close this page</strong> while we're securing your wallets. This may take a while.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 mb-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
                  AI Trading Benefits
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    24/7 Market Monitoring
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    Smart Trade Recommendations
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    Risk Management Alerts
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-300"
                  onClick={() => onComplete()}
                >
                  Skip for Now
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                  onClick={() => onComplete()}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Connect AI Assistant
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Server className="h-5 w-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-purple-700">
                  Securely connecting to our AI trading servers. This will take just a bit of time.
                </p>
              </div>
            </div>
          )}

          {(currentStep === 1 || currentStep === 4) && (
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
              onClick={onComplete}
            >
              Continue to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const Signup = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to get user's IP and location data
  const getUserIPData = async (): Promise<IPData | null> => {
    try {
      // First try ipapi.co (free tier available)
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        return {
          ip: data.ip,
          country: data.country_name,
          region: data.region,
          city: data.city,
          timezone: data.timezone,
          isp: data.org,
          latitude: data.latitude,
          longitude: data.longitude
        };
      }
    } catch (error) {
      console.log('ipapi.co failed, trying backup service...');
    }

    try {
      // Backup service: ipify + ipapi (free)
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ip = ipData.ip;

      const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      if (locationResponse.ok) {
        const locationData = await locationResponse.json();
        return {
          ip: ip,
          country: locationData.country_name,
          region: locationData.region,
          city: locationData.city,
          timezone: locationData.timezone,
          isp: locationData.org,
          latitude: locationData.latitude,
          longitude: locationData.longitude
        };
      }
    } catch (error) {
      console.log('Backup IP service failed');
    }

    return null;
  };

  // Enhanced email validation that accepts various domain extensions
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email.length < 3 || !email.includes('@') || !email.includes('.')) {
      return false;
    }
    
    return emailRegex.test(email);
  };

  const getPasswordStrength = (
    password: string
  ): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: 'No password', color: 'bg-gray-200' };

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

    return {
      strength,
      label: labels[strength - 1] || 'Weak',
      color: colors[strength - 1] || 'bg-red-500',
    };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleWalletCreationProcess = () => {
    setShowWalletModal(true);
    setModalStep(0);
    setProgress(0);

    // First step: Creating wallets
    const walletCreationTime = 3000;
    const intervalTime = 50;
    const increments = walletCreationTime / intervalTime;
    const progressIncrement = 100 / increments;

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += progressIncrement;
      setProgress(Math.min(100, Math.round(currentProgress)));

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setModalStep(1);

        // Auto-advance to AI connection step after 2 seconds
        setTimeout(() => {
          setModalStep(2);
        }, 2000);
      }
    }, intervalTime);
  };

  const handleAIConnectionProcess = () => {
    setModalStep(3);
    setProgress(0);

    const aiConnectionTime = 3000;
    const intervalTime = 50;
    const increments = aiConnectionTime / intervalTime;
    const progressIncrement = 100 / increments;

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += progressIncrement;
      setProgress(Math.min(100, Math.round(currentProgress)));

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setModalStep(4);

        // Auto-redirect to dashboard after 2 seconds
        setTimeout(() => {
          setShowWalletModal(false);
          navigate('/dashboard');
        }, 2000);
      }
    }, intervalTime);
  };

  const handleModalComplete = () => {
    if (modalStep === 2) {
      // User chose to connect AI assistant
      handleAIConnectionProcess();
    } else if (modalStep === 1 || modalStep === 4) {
      // Skip AI or completion - go to dashboard
      setShowWalletModal(false);
      navigate('/dashboard');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password should be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (passwordStrength.strength < 2) {
      toast({
        title: 'Weak Password',
        description: 'Please choose a stronger password with uppercase letters and numbers',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get user's IP and location data (don't await - run in background)
      const ipDataPromise = getUserIPData();

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Wait for IP data (with timeout)
      let ipData = null;
      try {
        ipData = await Promise.race([
          ipDataPromise,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
        ]);
      } catch (ipError) {
        console.log('IP data fetch failed or timed out');
      }

      // Prepare user data
      const userData = {
        fullName: name.trim(),
        email: email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        hasSeenWalletCreation: true, // Set to true since we're showing the modal
        emailDomain: email.split('@')[1],
        signupLocation: ipData ? {
          country: ipData.country,
          region: ipData.region,
          city: ipData.city
        } : null,
        ipData: ipData ? {
          ...ipData,
          signupTimestamp: serverTimestamp(),
          userAgent: navigator.userAgent
        } : null,
        lastLogin: serverTimestamp(),
        accountStatus: 'active'
      };

      // Create user document
      await setDoc(doc(db, 'users', user.uid), userData);

      // Create dashboard stats
      await setDoc(doc(db, 'users', user.uid, 'dashboard', 'stats'), {
        totalBalance: 0,
        portfolioGrowth: 0,
        activeWallets: 0,
        totalTransactions: 0,
        lastUpdated: serverTimestamp()
      });

      // Create wallets collection
      await setDoc(doc(db, 'users', user.uid, 'wallets', 'main'), {
        walletType: 'main',
        balance: 0,
        currency: 'USD',
        createdAt: serverTimestamp(),
        isActive: true
      });

      // Log signup analytics
      try {
        await setDoc(doc(db, 'analytics', 'signups'), {
          totalSignups: serverTimestamp(),
          recentSignup: {
            userId: user.uid,
            email: email,
            location: ipData ? `${ipData.city}, ${ipData.country}` : 'unknown',
            timestamp: serverTimestamp()
          }
        }, { merge: true });
      } catch (analyticsError) {
        console.log('Analytics logging failed, continuing...');
      }

      // Show success message
      toast({
        title: 'Account Created Successfully!',
        description: ipData 
          ? `Welcome ${name}! Your account has been created from ${ipData.city}, ${ipData.country}.` 
          : `Welcome ${name}! Your account has been successfully created.`,
      });

      // Start the wallet creation modal process
      handleWalletCreationProcess();

    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = 'An unexpected error occurred during signup. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid. Please check and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }

      toast({
        title: 'Signup Failed',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ text, satisfied }) => {
    return (
      <li className="flex items-center space-x-2 text-xs">
        <CheckCircle size={14} className={satisfied ? 'text-green-500' : 'text-gray-300'} />
        <span className={satisfied ? 'text-gray-700' : 'text-gray-400'}>{text}</span>
      </li>
    );
  };

  return (
    <>
      <AuthLayout 
        title="Create an account" 
        subtitle="Sign up with your email address or custom domain"
      >
        <Card>
          <form onSubmit={handleSignup}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="flex items-center border rounded-md px-3 py-2 shadow-sm">
                    <User className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center border rounded-md px-3 py-2 shadow-sm">
                    <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    Supports all email providers and custom domains
                  </p>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="flex items-center border rounded-md px-3 py-2 shadow-sm">
                    <Lock className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength.strength === 0 ? 'text-red-500' :
                          passwordStrength.strength === 1 ? 'text-orange-500' :
                          passwordStrength.strength === 2 ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-2 rounded-full w-full bg-gray-200">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordStrength.strength === 0 ? 'bg-red-500 w-1/4' :
                            passwordStrength.strength === 1 ? 'bg-orange-500 w-1/2' :
                            passwordStrength.strength === 2 ? 'bg-yellow-500 w-3/4' :
                            'bg-green-500 w-full'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Password requirements */}
                  <ul className="mt-3 space-y-1">
                    <PasswordRequirement text="At least 8 characters" satisfied={password.length >= 8} />
                    <PasswordRequirement text="Contains uppercase letter" satisfied={/[A-Z]/.test(password)} />
                    <PasswordRequirement text="Contains number" satisfied={/[0-9]/.test(password)} />
                    <PasswordRequirement text="Contains special character" satisfied={/[^A-Za-z0-9]/.test(password)} />
                  </ul>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                    Creating your account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <p className="text-sm text-center text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:underline font-medium"
                  onClick={(e) => isLoading && e.preventDefault()}
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </AuthLayout>

      {/* Wallet creation modal */}
      <WalletCreationModal 
        isOpen={showWalletModal}
        currentStep={modalStep}
        progress={progress}
        onComplete={handleModalComplete}
      />
    </>
  );
};

export default Signup;