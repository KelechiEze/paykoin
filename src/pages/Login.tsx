import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/layout/AuthLayout';
import { auth } from '@/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState<boolean>(false);
  const [showResetSentModal, setShowResetSentModal] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      toast({
        title: "Login Successful",
        description: `Welcome back!`,
      });

      navigate('/dashboard');

    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email format.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many attempts. Account temporarily locked.";
          break;
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    setIsForgotPasswordLoading(true);

    try {
      // Show spinner for 4 seconds regardless of how fast Firebase responds
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Send password reset email
      await sendPasswordResetEmail(auth, email);
      
      // Show success modal
      setShowResetSentModal(true);
    } catch (error: any) {
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      }

      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to access your account"
    >
      <Card>
        <form onSubmit={handleLogin}>
          <CardContent className="pt-6">
            <div className="space-y-4">
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
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    onClick={handleForgotPassword}
                    disabled={isForgotPasswordLoading}
                    className="text-sm text-crypto-blue hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {isForgotPasswordLoading ? (
                      <span className="flex items-center">
                        <Loader className="h-4 w-4 mr-1 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Forgot password?"
                    )}
                  </button>
                </div>
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
                    disabled={isLoading || isForgotPasswordLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isForgotPasswordLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isForgotPasswordLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </span>
                ) : "Sign in"}
              </Button>
            </div>
          </CardContent>
        </form>
        
        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-crypto-blue font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Password Reset Confirmation Modal */}
      <Dialog open={showResetSentModal} onOpenChange={setShowResetSentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Email Sent</DialogTitle>
            <DialogDescription>
              A password reset link has been sent to:
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <div className="p-3 rounded-lg bg-gray-100 text-center">
                <span className="font-medium">{email}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              type="button" 
              onClick={() => setShowResetSentModal(false)}
              className="mt-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
};

export default Login;