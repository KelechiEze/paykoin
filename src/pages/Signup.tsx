import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/layout/AuthLayout';

const Signup = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate signup process
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account created",
        description: "You have successfully created an account!",
      });
      navigate('/');
    }, 1500);
  };

  // Password strength check
  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: "No password", color: "bg-gray-200" };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const labels = ["Weak", "Fair", "Good", "Strong"];
    const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400"];
    
    return {
      strength,
      label: labels[strength - 1] || "Weak",
      color: colors[strength - 1] || "bg-red-400",
    };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Sign up to get started with CryptoHub"
    >
      <Card>
        <form onSubmit={handleSignup}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Password strength: {passwordStrength.label}</span>
                      <span className="text-xs text-gray-500">{password.length}/8+ chars</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.color}`} 
                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                      ></div>
                    </div>
                    
                    <ul className="space-y-1 mt-2">
                      <PasswordRequirement 
                        text="At least 8 characters" 
                        satisfied={password.length >= 8}
                      />
                      <PasswordRequirement 
                        text="At least one uppercase letter" 
                        satisfied={/[A-Z]/.test(password)}
                      />
                      <PasswordRequirement 
                        text="At least one number" 
                        satisfied={/[0-9]/.test(password)}
                      />
                      <PasswordRequirement 
                        text="At least one special character" 
                        satisfied={/[^A-Za-z0-9]/.test(password)}
                      />
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || passwordStrength.strength < 3}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
        
        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-crypto-blue font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

interface PasswordRequirementProps {
  text: string;
  satisfied: boolean;
}

const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ text, satisfied }) => {
  return (
    <li className="flex items-center space-x-2 text-xs">
      <CheckCircle size={14} className={satisfied ? "text-green-500" : "text-gray-300"} />
      <span className={satisfied ? "text-gray-700" : "text-gray-400"}>{text}</span>
    </li>
  );
};

export default Signup;
