import React from 'react';
import { CreditCard, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PaymentSettings: React.FC = () => {
  const { toast } = useToast();
  
  const handleAddPaymentMethod = () => {
    toast({
      title: 'Add Payment Method',
      description: 'This feature will be available soon.',
    });
  };

  const paymentMethods = [
    { 
      id: 'visa1234', 
      type: 'visa', 
      last4: '4242',
      expiry: '05/25'
    }
  ];

  const handleRemoveCard = (id: string) => {
    toast({
      title: 'Payment Method Removed',
      description: `Your card ending in ${id.slice(-4)} has been removed.`,
    });
  };

  return (
    <div className="space-y-6">
      {paymentMethods.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Your Payment Methods</h3>
          
          {paymentMethods.map(method => (
            <div key={method.id} className="p-4 rounded-xl border border-gray-100 flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h4 className="font-medium">{method.type.toUpperCase()} •••• {method.last4}</h4>
                  <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleRemoveCard(method.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <CreditCard size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="font-medium text-gray-700">No Payment Methods</h3>
          <p className="text-sm text-gray-500 mb-4">You haven't added any payment methods yet</p>
        </div>
      )}
      
      <button 
        onClick={handleAddPaymentMethod}
        className="w-full py-3 px-4 bg-crypto-blue text-white rounded-lg hover:bg-crypto-blue/90 transition-colors"
      >
        Add Payment Method
      </button>
      
      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
        <h3 className="font-medium text-gray-700 mb-2">Payment Security</h3>
        <p className="text-sm text-gray-600">
          Your payment information is securely stored and processed. We use industry-standard encryption to protect your sensitive data.
        </p>
      </div>
    </div>
  );
};
