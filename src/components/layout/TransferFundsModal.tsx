import React, { useState } from 'react';
import { X, ArrowLeftRight, AlertTriangle, Check, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/firebase';
import { doc, updateDoc, getDoc, runTransaction } from 'firebase/firestore';

interface TransferFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  depositBalance: number;
  tradingBalance: number;
}

export const TransferFundsModal: React.FC<TransferFundsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  depositBalance,
  tradingBalance,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [transferDirection, setTransferDirection] = useState<'depositToTrading' | 'tradingToDeposit'>('depositToTrading');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const handleSetMaxAmount = () => {
    if (transferDirection === 'depositToTrading') {
      setAmount(depositBalance.toString());
    } else {
      setAmount(tradingBalance.toString());
    }
    setError('');
  };

  const handleTransfer = async () => {
    const transferAmount = parseFloat(amount);
    
    // Validate amount
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Check if user has enough balance
    if (transferDirection === 'depositToTrading') {
      if (transferAmount > depositBalance) {
        setError(`Insufficient deposit balance. You have $${depositBalance.toFixed(2)} available.`);
        return;
      }
    } else {
      if (transferAmount > tradingBalance) {
        setError(`Insufficient trading balance. You have $${tradingBalance.toFixed(2)} available.`);
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const dashboardRef = doc(db, 'users', userId, 'dashboard', 'stats');
      
      // Use transaction to ensure atomic operation
      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(dashboardRef);
        
        if (!docSnap.exists()) {
          throw new Error('Dashboard data not found');
        }

        const data = docSnap.data();
        let newDepositBalance = data.depositBalance || 0;
        let newTradingBalance = data.tradingBalance || 0;

        if (transferDirection === 'depositToTrading') {
          newDepositBalance -= transferAmount;
          newTradingBalance += transferAmount;
        } else {
          newTradingBalance -= transferAmount;
          newDepositBalance += transferAmount;
        }

        // Update the document
        transaction.update(dashboardRef, {
          depositBalance: newDepositBalance,
          tradingBalance: newTradingBalance,
          totalBalance: newDepositBalance + newTradingBalance + (data.tradingProfit || 0),
        });
      });

      toast({
        title: 'Transfer Successful',
        description: `$${transferAmount.toFixed(2)} transferred successfully!`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error transferring funds:', err);
      setError(err.message || 'Failed to transfer funds. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Transfer Failed',
        description: err.message || 'Failed to transfer funds. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowLeftRight className="text-green-600" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Transfer Funds</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 font-medium">Deposit Balance</p>
            <p className="text-xl font-bold text-blue-700">{formatCurrency(depositBalance)}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 font-medium">Trading Balance</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(tradingBalance)}</p>
          </div>
        </div>

        {/* Transfer Direction Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Direction</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setTransferDirection('depositToTrading');
                setAmount('');
                setError('');
              }}
              className={cn(
                "p-3 rounded-lg border-2 text-center transition-all",
                transferDirection === 'depositToTrading'
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              )}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm font-medium">Deposit → Trading</span>
              </div>
            </button>
            <button
              onClick={() => {
                setTransferDirection('tradingToDeposit');
                setAmount('');
                setError('');
              }}
              className={cn(
                "p-3 rounded-lg border-2 text-center transition-all",
                transferDirection === 'tradingToDeposit'
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              )}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm font-medium">Trading → Deposit</span>
              </div>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <button
              onClick={handleSetMaxAmount}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              disabled={isLoading}
            >
              Max Available
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input
              type="text"
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Info Message */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-2">
            <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">
                {transferDirection === 'depositToTrading' 
                  ? `You are transferring funds from your Deposit Balance to your Trading Balance. These funds will be used for active trading.`
                  : `You are transferring funds from your Trading Balance back to your Deposit Balance. These funds will no longer be used for trading.`
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Available to transfer: {transferDirection === 'depositToTrading' 
                  ? formatCurrency(depositBalance) 
                  : formatCurrency(tradingBalance)
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-green-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin" size={18} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Transfer Funds</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferFundsModal;