
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-crypto-light p-4">
      <div className="text-center max-w-md mx-auto dashboard-card">
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto">
            <span className="text-6xl font-bold">!</span>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mb-8">Oops! Page not found</p>
        
        <button 
          onClick={() => navigate('/')}
          className="flex items-center justify-center mx-auto py-3 px-6 rounded-xl bg-crypto-blue text-white font-medium hover:bg-crypto-blue/90 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
