import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/layout/AuthLayout';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';

interface PasswordRequirementProps {
  text: string;
  satisfied: boolean;
}

const Signup = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateWalletAddress = (symbol: string): string => {
    const prefixes: Record<string, string> = {
      BTC: '1',
      ETH: '0x',
      SOL: '',
      ADA: 'addr1'
    };
    
    const chars = '0123456789ABCDEF';
    let address = prefixes[symbol] || '';
    
    for (let i = 0; i < 34 - address.length; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return address;
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
    const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];

    return {
      strength,
      label: labels[strength - 1] || 'Weak',
      color: colors[strength - 1] || 'bg-red-400',
    };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (passwordStrength.strength < 3) {
      toast({
        title: 'Weak Password',
        description: 'Please choose a stronger password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile
      await setDoc(doc(db, 'users', user.uid), {
        fullName: name,
        email: email,
        createdAt: serverTimestamp(),
      });

      // Initialize dashboard
      await setDoc(doc(db, 'users', user.uid, 'dashboard', 'stats'), {
        totalBalance: 0,
        portfolioGrowth: 0,
        activeWallets: 0,
        topPerformer: null,
      });

      // Initialize wallets with BTC and ETH
      const walletsRef = collection(db, 'users', user.uid, 'wallets');
      
     const defaultWallets = [
  {
    id: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
    color: '#F7931A',
    cgId: 'bitcoin'
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    color: '#627EEA',
    cgId: 'ethereum'
  },
  {
    id: 'SOL',
    name: 'Solana',
    symbol: 'SOL',
    color: '#9945FF',
    cgId: 'solana'
  },
  {
    id: 'USDT',
    name: 'Tether',
    symbol: 'USDT',
    color: '#26A17B',
    cgId: 'tether'
  },
  {
    id: 'DOGE',
    name: 'Dogecoin',
    symbol: 'DOGE',
    color: '#C2A633',
    cgId: 'dogecoin'
  }
];


      await Promise.all(
        defaultWallets.map(async (wallet) => {
          const walletRef = doc(walletsRef, wallet.id);
          await setDoc(walletRef, {
            name: wallet.name,
            symbol: wallet.symbol,
            cryptoBalance: 0,
            dollarBalance: 0,
            walletAddress: generateWalletAddress(wallet.symbol),
            color: wallet.color,
            change: 0,
            isUp: true,
            createdAt: serverTimestamp(),
            cgId: wallet.cgId
          });
          await setDoc(doc(walletRef, 'transactions', 'initial'), {});
        })
      );

      toast({
        title: 'Account Created',
        description: 'Your account has been successfully created with default wallets!',
      });

      navigate('/dashboard');
    } catch (error: any) {
      let errorMessage = 'An error occurred during signup';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }

      toast({
        title: 'Signup Failed',
        description: errorMessage,
        variant: 'destructive',
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
    <AuthLayout title="Create an account" subtitle="Sign up to get started with CryptoHub">
      <Card>
        <form onSubmit={handleSignup}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="flex items-center border rounded px-3 py-2">
                  <User className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 border-0 outline-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center border rounded px-3 py-2">
                  <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 border-0 outline-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center border rounded px-3 py-2">
                  <Lock className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 border-0 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="ml-2 text-gray-500 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="mt-1 h-2 rounded-full w-full">
                  <div
                    className={`h-full rounded-full ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.strength * 25}%` }}
                  />
                </div>
                <p className="text-xs mt-1 text-gray-500">{passwordStrength.label} password</p>

                <ul className="mt-2 space-y-1">
                  <PasswordRequirement
                    text="At least 8 characters"
                    satisfied={password.length >= 8}
                  />
                  <PasswordRequirement
                    text="Includes uppercase letter"
                    satisfied={/[A-Z]/.test(password)}
                  />
                  <PasswordRequirement
                    text="Includes a number"
                    satisfied={/[0-9]/.test(password)}
                  />
                  <PasswordRequirement
                    text="Includes a special character"
                    satisfied={/[^A-Za-z0-9]/.test(password)}
                  />
                </ul>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || passwordStrength.strength < 3}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </div>
          </CardContent>
        </form>

        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-crypto-blue font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

export default Signup;