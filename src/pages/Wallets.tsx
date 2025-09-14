import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Copy, Check, ExternalLink, DollarSign, ArrowDown, Clock, 
  Hash, ArrowUpRight, ArrowDownLeft, Send 
} from 'lucide-react';

const getTransactionTypeIcon = (transaction) => {
  switch (transaction.type) {
    case 'deposit':
    case 'received':
      return <ArrowDownLeft className="text-green-500" size={24} />; // ✅ replaced Receive
    case 'withdrawal':
    case 'sent':
      return <Send className="text-red-500" size={24} />;
    default:
      return <Hash className="text-gray-500" size={24} />;
  }
};

import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  doc,
  collection,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

// Notification utility functions
const sendEmailNotification = (message: string) => {
  console.log(`[EMAIL] ${message}`);
  // In real app: API call to email service
};

const sendPushNotification = (title: string, body: string) => {
  console.log(`[PUSH] ${title}: ${body}`);
  // In real app: Use Firebase Cloud Messaging
};

const sendSMSNotification = (message: string) => {
  console.log(`[SMS] ${message}`);
  // In real app: API call to SMS service
};

const triggerNotifications = (
  settings: any,
  notificationData: {
    type: 'transaction' | 'security' | 'price';
    title: string;
    message: string;
  },
  toast: any // Added toast as parameter
) => {
  const { type, title, message } = notificationData;

  try {
    // Transaction notifications
    if (type === 'transaction') {
      if (settings.emailNotifs) sendEmailNotification(message);
      if (settings.pushNotifs) sendPushNotification(title, message);
    }
    
    // Security alerts
    if (type === 'security' && settings.securityAlerts) {
      sendEmailNotification(`SECURITY ALERT: ${message}`);
      sendSMSNotification(`Security Alert: ${message}`);
    }
    
    // Price alerts
    if (type === 'price' && settings.priceAlerts) {
      sendPushNotification('Price Alert', message);
    }

  } catch (error) {
    console.error('Error sending notifications:', error);
    // Fallback toast if notifications fail
    toast({
      variant: 'destructive',
      title: 'Notification Failed',
      description: 'Failed to send notifications',
    });
  }
};

interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  usdValue: number;
  address: string;
  color: string;
  change: number;
  isUp: boolean;
  transactions: Transaction[];
  cgId?: string;
  imageUrl?: string; // Added for CoinGecko image URL
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'sent' | 'received';
  amount: number;
  date: Date;
  status: 'pending' | 'completed';
  to?: string;
  from?: string;
  fee?: number;
  note?: string;
  fiatAmount?: number;
  fiatCurrency?: string;
  symbol?: string;
  total?: number;
}

interface CGCoin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string; // Added for CoinGecko image URL
}

interface User {
  uid: string;
  email: string;
  displayName: string;
}

// Default wallet addresses for popular cryptocurrencies
const getDefaultWalletAddress = (symbol: string) => {
  const defaultWallets = {
    'btc': 'bc1qd2wec90rdvv7jgssl9uz859vrflqaprnvppetg',
    'eth': '0x55db224bC13918664b57aC1B4d46fDA48E03818f',
    'solana':'Fgo1begjZvZSVVSwcPPAG47b8YqLCSZKTf8jcSprqjub',
    'polygon': '0x55db224bC13918664b57aC1B4d46fDA48E03818f',
    'doge': 'D8d1YzJ5HyVMjRjqP1V8suyY6JqvbWPP9o',
    'usdt': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    'xrp': 'rP4t9Q4cMT6ECa68d3NVTW77q6gb4xY6f3',
    'shib': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    'usdc': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  };
  
  return defaultWallets[symbol.toLowerCase()] || `0x${Math.random().toString(36).substring(2, 22)}${Math.random().toString(36).substring(2, 22)}`;
};

const TransferModal = ({ crypto, onClose }: { crypto: Cryptocurrency, onClose: () => void }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(crypto.address)
      .then(() => {
        setIsCopied(true);
        toast({
          description: "Wallet address copied to clipboard",
        });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          variant: "destructive",
          description: "Failed to copy address",
        });
      });
  };

  // Notify when address is copied if security alerts are enabled
  useEffect(() => {
    const notifyDepositAddressAccess = async () => {
      if (!currentUser || !isCopied) return;
      
      try {
        const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'notifications');
        const docSnap = await getDoc(settingsRef);
        
        if (docSnap.exists()) {
          const settings = docSnap.data();
          
          if (settings.securityAlerts) {
            triggerNotifications(settings, {
              type: 'security',
              title: 'Security Notice',
              message: `You copied your ${crypto.name} deposit address`
            }, toast); // Added toast parameter
          }
        }
      } catch (error) {
        console.error('Error sending security notification:', error);
      }
    };

    notifyDepositAddressAccess();
  }, [isCopied, currentUser, crypto.name, toast]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Deposit {crypto.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Your {crypto.name} Wallet</p>
          <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <p className="font-mono text-sm break-all mr-2">{crypto.address}</p>
            <button 
              onClick={copyToClipboard} 
              className="ml-2 p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Copy wallet address"
            >
              {isCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
            </button>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm mb-6">
          Copy your wallet address above to receive {crypto.symbol} deposits.
        </p>
        
        <button 
          onClick={onClose}
          className="w-full py-3 bg-crypto-blue text-white rounded-lg hover:bg-crypto-blue/90 transition-colors"
        >
          Okay
        </button>
      </div>
    </div>
  );
};

const WithdrawModal = ({ 
  crypto, 
  onClose,
  onWithdrawSuccess
}: { 
  crypto: Cryptocurrency; 
  onClose: () => void;
  onWithdrawSuccess: () => void;
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [fiatAmount, setFiatAmount] = useState('');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [notificationSettings, setNotificationSettings] = useState<any>(null);

  // Fetch notification settings when modal opens
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (!currentUser) return;
      
      try {
        const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'notifications');
        const docSnap = await getDoc(settingsRef);
        
        if (docSnap.exists()) {
          setNotificationSettings(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
      }
    };

    fetchNotificationSettings();
  }, [currentUser]);

  // Simulated exchange rate
  const exchangeRate = 1;

  const handleWithdraw = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        description: "You must be logged in to transfer crypto",
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount)) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawAmount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (recipientEmail === currentUser.email) {
      setError('You cannot send to your own email');
      return;
    }

    const fee = Math.max(0.0001, withdrawAmount * 0.005);
    const totalDeduction = withdrawAmount + fee;

    if (totalDeduction > crypto.balance) {
      setError(`Insufficient balance. You need at least ${totalDeduction.toFixed(8)} ${crypto.symbol}`);
      return;
    }

    setIsWithdrawing(true);
    setError('');

    try {
      // Find recipient by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', recipientEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('No user found with this email');
        setIsWithdrawing(false); // Reset loading state
        return;
      }
      
      const recipientDoc = querySnapshot.docs[0];
      const recipientId = recipientDoc.id;
      const recipientData = recipientDoc.data();
      
      // Find recipient's wallet
      const walletsRef = collection(db, 'users', recipientId, 'wallets');
      const walletQuery = query(walletsRef, where('symbol', '==', crypto.symbol));
      const walletSnapshot = await getDocs(walletQuery);
      
      if (walletSnapshot.empty) {
        setError('Recipient does not have a wallet for this cryptocurrency');
        setIsWithdrawing(false); // Reset loading state
        return;
      }
      
      const recipientWallet = walletSnapshot.docs[0];
      const recipientWalletData = recipientWallet.data();
      
      const batch = writeBatch(db);
      
      // Update sender's wallet
      const senderWalletRef = doc(db, 'users', currentUser.uid, 'wallets', crypto.id);
      const senderNewBalance = crypto.balance - totalDeduction;
      
      batch.update(senderWalletRef, {
        cryptoBalance: senderNewBalance
      });
      
      // Add withdrawal transaction to sender
      const senderTxRef = doc(collection(senderWalletRef, 'transactions'));
      batch.set(senderTxRef, {
        type: 'withdrawal',
        amount: withdrawAmount,
        fee: fee,
        total: totalDeduction,
        date: serverTimestamp(),
        status: 'completed',
        to: recipientEmail,
        note: `Sent to ${recipientEmail}`,
        symbol: crypto.symbol,
        fiatAmount: fiatAmount ? parseFloat(fiatAmount) : null,
        fiatCurrency: fiatCurrency
      });
      
      // Update recipient's wallet
      const recipientWalletRef = doc(db, 'users', recipientId, 'wallets', recipientWallet.id);
      const recipientNewBalance = (recipientWalletData.cryptoBalance || 0) + withdrawAmount;
      
      batch.update(recipientWalletRef, {
        cryptoBalance: recipientNewBalance
      });
      
      // Add deposit transaction to recipient
      const recipientTxRef = doc(collection(recipientWalletRef, 'transactions'));
      batch.set(recipientTxRef, {
        type: 'deposit',
        amount: withdrawAmount,
        date: serverTimestamp(),
        status: 'completed',
        from: currentUser.email,
        note: `Received from ${currentUser.email}`,
        symbol: crypto.symbol,
        fiatAmount: fiatAmount ? parseFloat(fiatAmount) : null,
        fiatCurrency: fiatCurrency
      });
      
      await batch.commit();

      // Trigger notifications after successful withdrawal
      if (notificationSettings) {
        // Transaction notification
        triggerNotifications(notificationSettings, {
          type: 'transaction',
          title: 'Transaction Completed',
          message: `Sent ${withdrawAmount.toFixed(6)} ${crypto.symbol} to ${recipientEmail}`
        }, toast); // Added toast parameter

        // Security alert
        triggerNotifications(notificationSettings, {
          type: 'security',
          title: 'Security Alert',
          message: `Withdrawal of ${withdrawAmount.toFixed(6)} ${crypto.symbol} initiated from your account`
        }, toast); // Added toast parameter
      }

      toast({
        title: 'Transfer successful!',
        description: `${withdrawAmount.toFixed(6)} ${crypto.symbol} sent to ${recipientEmail}`,
      });

      onWithdrawSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error transferring crypto:', err);
      setError('Failed to transfer. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'Transfer failed',
        description: err.message || 'There was an error processing your transfer',
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleMaxAmount = () => {
    const maxAmount = Math.max(0, crypto.balance - 0.0001);
    setAmount(maxAmount.toFixed(8));
    if (exchangeRate) {
      setFiatAmount((maxAmount * exchangeRate).toFixed(2));
    }
  };

  // Update fiat amount when crypto amount changes
  useEffect(() => {
    if (amount && exchangeRate) {
      const cryptoValue = parseFloat(amount);
      if (!isNaN(cryptoValue)) {
        setFiatAmount((cryptoValue * exchangeRate).toFixed(2));
      }
    }
  }, [amount]);

  // Update crypto amount when fiat amount changes
  useEffect(() => {
    if (fiatAmount && exchangeRate) {
      const fiatValue = parseFloat(fiatAmount);
      if (!isNaN(fiatValue)) {
        setAmount((fiatValue / exchangeRate).toFixed(8));
      }
    }
  }, [fiatAmount]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Transfer {crypto.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Recipient Email Address</label>
            <input
              type="email"
              placeholder="Enter recipient's email"
              className="w-full p-3 border rounded-lg"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              The recipient must have a registered account and a {crypto.symbol} wallet
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700">Amount ({crypto.symbol})</label>
                <button
                  onClick={handleMaxAmount}
                  className="text-xs text-crypto-blue hover:underline"
                >
                  Max: {crypto.balance.toFixed(8)}
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-3 border rounded-lg pl-10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="absolute left-3 top-3.5 text-gray-500">{crypto.symbol}</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Local Currency</label>
              <div className="relative">
                <select
                  className="w-full p-3 border rounded-lg pr-10 appearance-none"
                  value={fiatCurrency}
                  onChange={(e) => setFiatCurrency(e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ArrowDown size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Network Fee</span>
              <span>0.5% (min 0.0001 {crypto.symbol})</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total to transfer</span>
              <span>
                {amount
                  ? `${(parseFloat(amount) + Math.max(0.0001, parseFloat(amount) * 0.005)).toFixed(8)} ${crypto.symbol}`
                  : `0.00 ${crypto.symbol}`}
              </span>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="w-full py-3 bg-crypto-blue text-white rounded-lg hover:bg-crypto-blue/90 transition-colors disabled:opacity-50"
          >
            {isWithdrawing ? 'Processing Transfer...' : 'Transfer Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AddCryptoModal = ({ 
  onClose, 
  onAdd,
  existingCryptos
}: { 
  onClose: () => void, 
  onAdd: (crypto: Cryptocurrency) => void,
  existingCryptos: Cryptocurrency[]
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CGCoin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from CoinGecko');
      }
      
      const data = await response.json();
      const filtered = data.filter((crypto: CGCoin) => 
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        description: "Failed to fetch cryptocurrencies. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCrypto = (crypto: CGCoin) => {
    // Use default wallet address for supported cryptocurrencies
    const walletAddress = getDefaultWalletAddress(crypto.symbol);
    
    const newCrypto: Cryptocurrency = {
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      balance: 0,
      usdValue: 0,
      address: walletAddress,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      change: crypto.price_change_percentage_24h || 0,
      isUp: (crypto.price_change_percentage_24h || 0) >= 0,
      transactions: [],
      cgId: crypto.id,
      imageUrl: crypto.image // Store CoinGecko image URL
    };
    
    onAdd(newCrypto);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Add New Cryptocurrency</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              className="flex-1 p-3 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              className="px-4 bg-crypto-blue text-white rounded-lg hover:bg-crypto-blue/90 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-blue"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <h4 className="text-gray-600 mb-2">Search Results</h4>
            <div className="space-y-2">
              {searchResults.map((crypto) => {
                const alreadyAdded = existingCryptos.some(c => c.symbol === crypto.symbol);
                return (
                  <div 
                    key={crypto.id} 
                    className={`p-3 rounded-lg border flex justify-between items-center ${alreadyAdded ? 'bg-gray-100' : 'hover:bg-gray-50 cursor-pointer'}`}
                    onClick={() => !alreadyAdded && handleAddCrypto(crypto)}
                  >
                    <div className="flex items-center">
                      <img 
                        src={crypto.image} 
                        alt={crypto.name} 
                        className="w-8 h-8 mr-3"
                      />
                      <div>
                        <p className="font-medium">{crypto.name}</p>
                        <p className="text-sm text-gray-500">{crypto.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${crypto.current_price.toFixed(2)}</p>
                      <p className={`text-sm ${(crypto.price_change_percentage_24h || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {(crypto.price_change_percentage_24h || 0) >= 0 ? '+' : ''}{(crypto.price_change_percentage_24h || 0).toFixed(2)}%
                      </p>
                    </div>
                    {alreadyAdded && (
                      <span className="text-xs text-gray-500 ml-2">Added</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            {searchTerm ? 'No results found' : 'Search for a cryptocurrency to add'}
          </p>
        )}
      </div>
    </div>
  );
};

// Transaction Detail Modal Component
const TransactionDetailModal = ({ 
  transaction, 
  crypto, 
  onClose 
}: { 
  transaction: Transaction; 
  crypto: Cryptocurrency; 
  onClose: () => void 
}) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true);
        toast({
          description: "Copied to clipboard",
        });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          variant: "destructive",
          description: "Failed to copy",
        });
      });
  };
  
  const getTransactionTypeLabel = () => {
    switch (transaction.type) {
      case 'deposit':
        return 'Deposit';
      case 'received':
        return 'Received';
      case 'withdrawal':
        return 'Withdrawal';
      case 'sent':
        return 'Sent';
      default:
        return 'Transaction';
    }
  };
  
  const getDirectionLabel = () => {
    if (transaction.type === 'deposit' || transaction.type === 'received') {
      return 'From';
    }
    return 'To';
  };
  
  const getDirectionValue = () => {
    if (transaction.type === 'deposit' || transaction.type === 'received') {
      return transaction.from || 'Unknown';
    }
    return transaction.to || 'Unknown';
  };
  
  const getAmountColor = () => {
    return transaction.type === 'deposit' || transaction.type === 'received' 
      ? 'text-green-600' 
      : 'text-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Transaction Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            {getTransactionTypeIcon(transaction)}
          </div>
          <h4 className="text-lg font-semibold">{getTransactionTypeLabel()}</h4>
          <p className={cn("text-2xl font-bold mt-2", getAmountColor())}>
            {transaction.type === 'withdrawal' || transaction.type === 'sent' ? '-' : '+'}
            {transaction.amount} {crypto.symbol.toUpperCase()}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between mb-3">
              <span className="text-gray-500">Status</span>
              <span className={cn(
                "font-medium",
                transaction.status === 'completed' ? 'text-green-600' : 'text-amber-600'
              )}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
            </div>
            
            <div className="flex justify-between mb-3">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">
                {transaction.date.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction ID</span>
              <button 
                onClick={() => copyToClipboard(transaction.id)}
                className="text-gray-700 hover:text-crypto-blue flex items-center"
              >
                <span className="truncate max-w-[120px]">{transaction.id.slice(0, 8)}...</span>
                <Copy className="ml-1" size={16} />
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between mb-3">
              <span className="text-gray-500">{getDirectionLabel()}</span>
              <span className="font-medium truncate max-w-[200px]">
                {getDirectionValue()}
              </span>
            </div>
            
            <div className="flex justify-between mb-3">
              <span className="text-gray-500">Network Fee</span>
              <span className="font-medium">
                {transaction.fee ? `${transaction.fee} ${crypto.symbol}` : 'Free'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Fiat Value</span>
              <span className="font-medium">
                {transaction.fiatAmount && transaction.fiatCurrency 
                  ? `${transaction.fiatAmount} ${transaction.fiatCurrency}`
                  : 'N/A'}
              </span>
            </div>
          </div>
          
          {transaction.note && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-gray-500 mb-2">Note</h4>
              <p className="font-medium">{transaction.note}</p>
            </div>
          )}
        </div>
        
        <button 
          onClick={onClose}
          className="w-full py-3 mt-6 bg-crypto-blue text-white rounded-xl hover:bg-crypto-blue/90 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Wallets: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
      return;
    }
    
    if (currentUser) {
      setAuthChecked(true);
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (!authChecked || !currentUser) return;

    const unsubscribe = onSnapshot(
      collection(db, 'users', currentUser.uid, 'wallets'),
      async (walletsSnapshot) => {
        try {
          setLoadingWallets(true);
          
          const updatedCryptos: Cryptocurrency[] = await Promise.all(
            walletsSnapshot.docs.map(async (walletDoc) => {
              const walletData = walletDoc.data();
              
              // Get transactions
              let transactions: Transaction[] = [];
              try {
                const transactionsSnapshot = await getDocs(
                  collection(walletDoc.ref, 'transactions')
                );
                transactions = transactionsSnapshot.docs
                  .filter(doc => doc.id !== 'initial')
                  .map(doc => {
                    const data = doc.data();
                    return {
                      id: doc.id,
                      ...data,
                      // Convert Firestore Timestamp to Date
                      date: data.date?.toDate() || new Date()
                    } as Transaction;
                  });
              } catch (error) {
                console.error("Error fetching transactions:", error);
              }
              
              // Get price data with fallback
              let currentPrice = walletData.dollarBalance / (walletData.cryptoBalance || 1);
              let priceChange = walletData.change || 0;
              
              if (walletData.cgId) {
                try {
                  const response = await fetch(
                    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${walletData.cgId}&order=market_cap_desc&per_page=1&page=1&sparkline=false`
                  );
                  
                  if (response.ok) {
                    const [coinData] = await response.json();
                    currentPrice = coinData?.current_price || currentPrice;
                    priceChange = coinData?.price_change_percentage_24h || priceChange;
                  }
                } catch (error) {
                  console.error("Error fetching price data:", error);
                  toast({
                    variant: "destructive",
                    description: "CoinGecko API limit reached - using cached prices",
                  });
                }
              }

              return {
                id: walletDoc.id,
                name: walletData.name || '',
                symbol: walletData.symbol || '',
                balance: walletData.cryptoBalance || 0,
                usdValue: (walletData.cryptoBalance || 0) * currentPrice,
                address: walletData.walletAddress || '',
                color: walletData.color || '#000000',
                change: priceChange,
                isUp: priceChange >= 0,
                transactions,
                cgId: walletData.cgId,
                imageUrl: walletData.imageUrl // Added for CoinGecko image
              };
            })
          );

          setCryptos(updatedCryptos);
        } catch (error) {
          console.error("Error in wallets snapshot:", error);
          toast({
            variant: "destructive",
            description: "Failed to load wallet data",
          });
        } finally {
          setLoadingWallets(false);
        }
      },
      (error) => {
        console.error("Firestore snapshot error:", error);
        toast({
          variant: "destructive",
          description: "Real-time connection error",
        });
        setLoadingWallets(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, authChecked, toast]);

  const handleAddCrypto = async (newCrypto: Cryptocurrency) => {
    if (!currentUser) return;

    try {
      const walletRef = doc(db, 'users', currentUser.uid, 'wallets', newCrypto.id);
      await setDoc(walletRef, {
        name: newCrypto.name,
        symbol: newCrypto.symbol,
        cryptoBalance: newCrypto.balance,
        dollarBalance: newCrypto.usdValue,
        walletAddress: newCrypto.address,
        color: newCrypto.color,
        change: newCrypto.change,
        isUp: newCrypto.isUp,
        cgId: newCrypto.cgId,
        imageUrl: newCrypto.imageUrl, // Store CoinGecko image URL
        createdAt: serverTimestamp()
      });

      await setDoc(doc(walletRef, 'transactions', 'initial'), {});

      toast({
        description: `${newCrypto.name} wallet added successfully!`,
      });
    } catch (error) {
      console.error('Error adding wallet:', error);
      toast({
        variant: "destructive",
        description: "Failed to add wallet",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crypto-blue"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <div className="flex justify-center items-center h-screen">Redirecting to login...</div>;
  }

  if (selectedCrypto) {
    const crypto = cryptos.find(c => c.id === selectedCrypto);
    if (!crypto) return null;
    
    return <CryptoDetail crypto={crypto} onBack={() => setSelectedCrypto(null)} />;
  }
  
  const totalBalance = cryptos.reduce((sum, crypto) => sum + crypto.usdValue, 0);
  
  return (
    <div className="space-y-8 animate-fade-in">
      {showAddModal && (
        <AddCryptoModal 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCrypto}
          existingCryptos={cryptos}
        />
      )}
      
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Wallets</h1>
      
      <div className="dashboard-card">
        <h2 className="text-gray-600 font-medium">Total Balance</h2>
        <p className="text-3xl font-bold mt-2">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className="text-sm text-gray-500 mt-1">{cryptos.length} {cryptos.length === 1 ? 'wallet' : 'wallets'}</p>
      </div>
      
      <div className="dashboard-card">
        <h2 className="text-xl font-semibold mb-6">Your Crypto Assets</h2>
        
        {loadingWallets ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-blue"></div>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {cryptos.map((crypto) => (
                <CryptoRow 
                  key={crypto.id} 
                  crypto={crypto} 
                  onClick={() => setSelectedCrypto(crypto.id)} 
                />
              ))}
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full mt-6 py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            >
              + Add New Wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const CryptoRow: React.FC<{ crypto: Cryptocurrency; onClick: () => void }> = ({ crypto, onClick }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <button onClick={onClick} className="w-full crypto-row">
      <div className="flex items-center">
        <div 
          className="w-10 h-10 rounded-full mr-3 flex items-center justify-center"
          style={{ backgroundColor: `${crypto.color}20` }}
        >
          {crypto.imageUrl && !imgError ? (
            <img
              src={crypto.imageUrl}
              alt={`${crypto.name} logo`}
              onError={() => setImgError(true)}
              className="w-6 h-6"
            />
          ) : (
            <span style={{ color: crypto.color }}>{crypto.symbol.slice(0, 4).toUpperCase()}</span>
          )}
        </div>
        <div className="text-left">
          <h3 className="font-medium">{crypto.name}</h3>
          <p className="text-sm text-gray-500">{crypto.balance.toFixed(8)} {crypto.symbol.toUpperCase()}</p>
        </div>
      </div>
    </button>
  );
};

const CryptoDetail: React.FC<{ crypto: Cryptocurrency; onBack: () => void }> = ({ crypto, onBack }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const { toast } = useToast();
  const [localCrypto, setLocalCrypto] = useState(crypto);
  const { currentUser } = useAuth();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Update local state when prop changes
  useEffect(() => {
    setLocalCrypto(crypto);
  }, [crypto]);
  
  const handleWithdrawSuccess = () => {
    const latestTransaction = localCrypto.transactions?.[0];
    const totalStr = latestTransaction?.total ?? "0";
    const total = parseFloat(totalStr);

    setLocalCrypto((prev) => ({
      ...prev,
      balance: prev.balance - (isNaN(total) ? 0 : total),
    }));
  };
  
  // Setup price alerts
  useEffect(() => {
    const setupPriceAlerts = async () => {
      if (!currentUser) return;
      
      try {
        const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'notifications');
        const docSnap = await getDoc(settingsRef);
        
        if (docSnap.exists()) {
          const settings = docSnap.data();
          
          if (settings.priceAlerts) {
            // Simulated price alert system
            const simulatePriceAlert = () => {
              if (Math.random() > 0.5) {
                triggerNotifications(settings, {
                  type: 'price',
                  title: 'Price Alert',
                  message: `${localCrypto.symbol} price ${Math.random() > 0.5 ? 'increased' : 'decreased'} by 5%`
                }, toast); // Added toast parameter
              }
            };
            
            const interval = setInterval(simulatePriceAlert, 30000);
            return () => clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Error setting up price alerts:', error);
      }
    };

    setupPriceAlerts();
  }, [currentUser, localCrypto.symbol, toast]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(localCrypto.address)
      .then(() => {
        setIsCopied(true);
        toast({
          description: "Wallet address copied to clipboard",
        });
        
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          variant: "destructive",
          description: "Failed to copy address",
        });
      });
  };
  
  const handleViewOnExplorer = () => {
    let explorerUrl = '';
    
    switch (localCrypto.symbol.toLowerCase()) {
      case 'btc':
        explorerUrl = `https://www.blockchain.com/explorer/addresses/btc/${localCrypto.address}`;
        break;
      case 'eth':
        explorerUrl = `https://etherscan.io/address/${localCrypto.address}`;
        break;
      case 'sol':
        explorerUrl = `https://solscan.io/account/${localCrypto.address}`;
        break;
      case 'ada':
        explorerUrl = `https://cardanoscan.io/address/${localCrypto.address}`;
        break;
      default:
        explorerUrl = `https://www.google.com/search?q=${localCrypto.name}+blockchain+explorer`;
    }
    
    window.open(explorerUrl, '_blank');
  };
  
  return (
    <div className="animate-fade-in">
      {showTransferModal && (
        <TransferModal crypto={localCrypto} onClose={() => setShowTransferModal(false)} />
      )}
      
      {showWithdrawModal && (
        <WithdrawModal 
          crypto={localCrypto} 
          onClose={() => setShowWithdrawModal(false)}
          onWithdrawSuccess={handleWithdrawSuccess}
        />
      )}
      
      {selectedTransaction && (
        <TransactionDetailModal 
          transaction={selectedTransaction} 
          crypto={localCrypto} 
          onClose={() => setSelectedTransaction(null)} 
        />
      )}
      
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" />
        <span>Back to Wallets</span>
      </button>
      
      <div className="dashboard-card mb-8">
        <div className="flex items-center mb-6">
          <div 
            className="w-12 h-12 rounded-full mr-4 flex items-center justify-center"
            style={{ backgroundColor: `${localCrypto.color}20` }}
          >
            {localCrypto.imageUrl ? (
              <img 
                src={localCrypto.imageUrl} 
                alt={localCrypto.name} 
                className="w-8 h-8"
              />
            ) : (
              <span style={{ color: localCrypto.color }} className="text-sm font-bold">
                {localCrypto.symbol.slice(0, 4).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{localCrypto.name}</h2>
            <p className="text-gray-500">{localCrypto.symbol.toUpperCase()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-gray-500 mb-1">Balance</p>
            <h3 className="text-3xl font-bold">{localCrypto.balance.toFixed(8)} {localCrypto.symbol.toUpperCase()}</h3>
            <p className="mt-1 text-xl">${localCrypto.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className={cn(
              "py-2 px-4 rounded-lg text-center",
              localCrypto.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            )}>
              <p className="font-medium">
                {localCrypto.isUp ? "+" : ""}{localCrypto.change.toFixed(2)}% 
                <span className="text-sm font-normal ml-1">last 24h</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-gray-600 font-medium mb-2">Wallet Address</h3>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 font-mono truncate">
                  {localCrypto.address}
                </p>
                <button 
                  onClick={copyToClipboard} 
                  className="ml-2 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {isCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowTransferModal(true)}
              className="flex items-center py-2.5 px-4 rounded-lg bg-crypto-blue text-white font-medium hover:bg-crypto-blue/90 transition-colors"
            >
              <DollarSign size={16} className="mr-2" />
              <span>Deposit</span>
            </button>
           
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center py-2.5 px-4 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors"
            >
              <ArrowDown size={16} className="mr-2" />
              <span>Send</span>
            </button>

            <button 
              onClick={handleViewOnExplorer}
              className="flex items-center py-2.5 px-4 rounded-lg border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              <span>View on Explorer</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="dashboard-card">
        <h3 className="text-xl font-semibold mb-6">Transaction History</h3>
        {localCrypto.transactions.length > 0 ? (
          <div className="space-y-4">
            {localCrypto.transactions
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="w-full flex justify-between items-center p-4 border rounded-xl bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      {tx.type === 'deposit' || tx.type === 'received' ? (
                        <ArrowDownLeft className="text-green-500" size={20} />
                      ) : (
                        <ArrowUpRight className="text-red-500" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{tx.type}</p>
                      <p className="text-sm text-gray-500">
                        {tx.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === 'deposit' || tx.type === 'received' ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.type === 'deposit' || tx.type === 'received' ? '+' : '-'}
                      {tx.amount} {localCrypto.symbol.toUpperCase()}
                    </p>
                    <p className={`text-xs ${tx.status === "completed" ? "text-green-500" : "text-orange-500"}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No transactions found for this wallet</p>
            <button 
              onClick={() => setShowTransferModal(true)}
              className="mt-4 text-crypto-blue font-medium hover:underline"
            >
              Make your first transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallets;