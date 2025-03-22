import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-crypto-light p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-crypto-blue text-white flex items-center justify-center text-xl font-bold">
                P
              </div>
            </div>
          </Link>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-500 mt-2">{subtitle}</p>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
