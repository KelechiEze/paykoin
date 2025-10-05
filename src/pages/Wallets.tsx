import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Copy, Check, ExternalLink, DollarSign, ArrowDown, Clock, 
  Hash, ArrowUpRight, ArrowDownLeft, Send 
} from 'lucide-react';

const getTransactionTypeIcon = (transaction) => {
  switch (transaction.type) {
    case 'deposit':
    case 'received':
      return <ArrowDownLeft className="text-green-500" size={24} />;
    case 'withdrawal':
    case 'sent':
      return <Send className="text-black" size={24} />;
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
  writeBatch,
  Timestamp
} from 'firebase/firestore';

// Notification utility functions
const sendEmailNotification = (message: string) => {
  console.log(`[EMAIL] ${message}`);
};

const sendPushNotification = (title: string, body: string) => {
  console.log(`[PUSH] ${title}: ${body}`);
};

const sendSMSNotification = (message: string) => {
  console.log(`[SMS] ${message}`);
};

const triggerNotifications = (
  settings: any,
  notificationData: {
    type: 'transaction' | 'security' | 'price';
    title: string;
    message: string;
  },
  toast: any
) => {
  const { type, title, message } = notificationData;

  try {
    if (type === 'transaction') {
      if (settings.emailNotifs) sendEmailNotification(message);
      if (settings.pushNotifs) sendPushNotification(title, message);
    }
    
    if (type === 'security' && settings.securityAlerts) {
      sendEmailNotification(`SECURITY ALERT: ${message}`);
      sendSMSNotification(`Security Alert: ${message}`);
    }
    
    if (type === 'price' && settings.priceAlerts) {
      sendPushNotification('Price Alert', message);
    }

  } catch (error) {
    console.error('Error sending notifications:', error);
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
  imageUrl?: string;
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
  pendingUntil?: Date;
  recipientAddress?: string;
  senderAddress?: string;
  isExternal?: boolean;
  recipientEmail?: string;
}

interface CGCoin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
}

// Popular cryptocurrencies with fallback data
const POPULAR_CRYPTOS = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    current_price: 113919,
    price_change_percentage_24h: 2.5,
    image: 'https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'eth',
    current_price: 4188.5,
    price_change_percentage_24h: 1.8,
    image: 'https://coin-images.coingecko.com/coins/images/279/small/ethereum.png'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'sol',
    current_price: 199,
    price_change_percentage_24h: 5.2,
    image: 'https://coin-images.coingecko.com/coins/images/4128/small/solana.png'
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ada',
    current_price: 0.78,
    price_change_percentage_24h: -0.5,
    image: 'https://coin-images.coingecko.com/coins/images/975/small/cardano.png'
  },
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    symbol: 'doge',
    current_price: 0.23,
    price_change_percentage_24h: 3.2,
    image: 'https://coin-images.coingecko.com/coins/images/5/small/dogecoin.png'
  },
  {
    id: 'ripple',
    name: 'XRP',
    symbol: 'xrp',
    current_price: 2.80,
    price_change_percentage_24h: 1.2,
    image: 'https://coin-images.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png'
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'dot',
    current_price: 3.86,
    price_change_percentage_24h: 2.1,
    image: 'https://coin-images.coingecko.com/coins/images/12171/small/polkadot.png'
  },
  {
    id: 'matic-network',
    name: 'Polygon',
    symbol: 'matic',
    current_price: 0.22,
    price_change_percentage_24h: 4.3,
    image: 'https://coin-images.coingecko.com/coins/images/4713/small/matic-token-icon.png'
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'usdt',
    current_price: 1.00,
    price_change_percentage_24h: 0.0,
    image: 'https://coin-images.coingecko.com/coins/images/325/small/tether.png'
  },
  {
    id: 'asdc',
    name: 'ASDC',
    symbol: 'asdc',
    current_price: 1.00,
    price_change_percentage_24h: 0.0,
    image: 'https://example.com/path/to/asdc-image.png'
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'bnb',
    current_price: 994.42,
    price_change_percentage_24h: -2.0,
    image: 'https://coin-images.coingecko.com/coins/images/825/small/bnb-icon2_2x.png'
  },
  // — New additions below —
  {
    id: 'shiba-inu',
    name: 'Shiba Inu',
    symbol: 'shib',
    current_price: 0.00001192,  
    price_change_percentage_24h: -2.8,  
    image: 'https://coin-images.coingecko.com/coins/images/11939/small/shiba.png'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'avax',
    current_price: 29.75,  
    price_change_percentage_24h: -14.2,  
    image: 'https://coin-images.coingecko.com/coins/images/12559/small/avalanche.png'
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'link',
    current_price: 20.48,  
    price_change_percentage_24h: -6.2,  
    image: 'https://coin-images.coingecko.com/coins/images/877/small/chainlink-new-logo.png'
  },
  {
    id: 'stellar',
    name: 'Stellar',
    symbol: 'xlm',
    current_price: 0.306,  
    price_change_percentage_24h: -5.7,  
    image: 'https://coin-images.coingecko.com/coins/images/100/small/stellar.png'
  },
  {
    id: 'trx',
    name: 'TRON',
    symbol: 'trx',
    current_price: 0.2872,  
    price_change_percentage_24h: -1.3,  
    image: 'https://coin-images.coingecko.com/coins/images/1094/small/tron.png'
  }
];


const getDefaultWalletAddress = (symbol: string) => {
  const defaultWallets = {
    'btc': 'bc1qd2wec90rdvv7jgssl9uz859vrflqaprnvppetg',
    'eth': '0x55db224bC13918664b57aC1B4d46fDA48E03818f',
    'sol': 'Fgo1begjZvZSVVSwcPPAG47b8YqLCSZKTf8jcSprqjub',
    'bnb':'0x27ce5c98F25EA3E7c8567bd1DD61F6B9036F10C1',
    'matic': '0x55db224bC13918664b57aC1B4d46fDA48E03818f',
    'doge': 'DCzMsvqxcuBhx53vLzoAc8jbCLscyizS9j',
    'usdt': '0x27ce5c98F25EA3E7c8567bd1DD61F6B9036F10C1',
    'xrp': 'rJXaxxyvbweBNBEaedDHQNwr2WGEn34oa7',
    'shib': '0x27ce5c98F25EA3E7c8567bd1DD61F6B9036F10C1',
    'usdc': '0x27ce5c98F25EA3E7c8567bd1DD61F6B9036F10C1',
    'ada': 'addr1q88atafqwg8xfawhcawjaqf937mgps2ttc868wl70q7r256ufmnwpr49sdlez0dxy2d25w6e2u8tuastdgnkcyy2vy9s45enzz',
    'dot': '14EDK8CWi4bqD4Rb93NYqVDq9XqjxmA8woTGa8eB5apewRzx',
    'trx':'TG6RLBh3Temx3GJKqhTgsr7qoBjXvF176k',
    'xlm':'GCYNVX3UCCYV4MOSCTJ7EDBH2ZD3VLIGU3WCODBXPNLWJPWKVUWXLHRT',
    'link': '0x27ce5c98F25EA3E7c8567bd1DD61F6B9036F10C1',
    'avax': '0x27ce5c98F25EA3E7c8567bd1DD61F6B9036F10C1'
  };
  
  return defaultWallets[symbol.toLowerCase()] || `0x${Math.random().toString(36).substring(2, 22)}${Math.random().toString(36).substring(2, 22)}`;
};

// Validate wallet address format
const validateWalletAddress = (address: string, symbol: string): boolean => {
  if (!address || address.trim() === '') return false;
  
  const addressFormats = {
    'btc': /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/,
    'eth': /^0x[a-fA-F0-9]{40}$/,
    'sol': /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    'bnb': /^(bnb1|[bn]1)[a-z0-9]{38,58}$/,
    'matic': /^0x[a-fA-F0-9]{40}$/,
    'doge': /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/,
    'usdt': /^0x[a-fA-F0-9]{40}$/,
    'xrp': /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/,
    'shib': /^0x[a-fA-F0-9]{40}$/,
    'usdc': /^0x[a-fA-F0-9]{40}$/,
    'ada': /^addr1[0-9a-z]{58}$/,
    'dot': /^1[1-9A-HJ-NP-Za-km-z]{47}$/,
    'trx': /^T[A-Za-z1-9]{33}$/,
    'xlm': /^G[ABCDEFGHIJKLMNOPQRSTUVWXYZ234567]{55}$/,
    'link': /^0x[a-fA-F0-9]{40}$/,
    'avax': /^0x[a-fA-F0-9]{40}$/
  };
  
  const format = addressFormats[symbol.toLowerCase()];
  if (!format) {
    // For unknown cryptocurrencies, do basic validation
    return address.length >= 20 && address.length <= 100;
  }
  
  return format.test(address);
};

// Find user by wallet address - returns null for external wallets
const findUserByWalletAddress = async (walletAddress: string, symbol: string) => {
  try {
    const walletsQuery = query(
      collection(db, 'users'),
      where('wallets', 'array-contains', {
        walletAddress: walletAddress,
        symbol: symbol.toLowerCase()
      })
    );
    
    const querySnapshot = await getDocs(walletsQuery);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    
    // Also check the subcollection structure
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    for (const userDoc of usersSnapshot.docs) {
      const walletsRef = collection(db, 'users', userDoc.id, 'wallets');
      const walletQuery = query(
        walletsRef, 
        where('walletAddress', '==', walletAddress),
        where('symbol', '==', symbol.toLowerCase())
      );
      const walletSnapshot = await getDocs(walletQuery);
      
      if (!walletSnapshot.empty) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        };
      }
    }
    
    return null; // External wallet
  } catch (error) {
    console.error('Error finding user by wallet address:', error);
    return null; // Treat as external wallet on error
  }
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
            }, toast);
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
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [fiatAmount, setFiatAmount] = useState('');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const [transferMethod, setTransferMethod] = useState<'email' | 'wallet'>('wallet');
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [notificationSettings, setNotificationSettings] = useState<any>(null);

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

  const exchangeRate = crypto.usdValue / crypto.balance || 1;

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

    if (!recipient.trim()) {
      setError('Please enter a recipient email or wallet address');
      return;
    }

    // Validate based on transfer method
    if (transferMethod === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
        setError('Please enter a valid email address');
        return;
      }
      if (recipient === currentUser.email) {
        setError('You cannot send to your own email');
        return;
      }
    } else {
      // Wallet address validation
      if (!validateWalletAddress(recipient, crypto.symbol)) {
        setError(`Please enter a valid ${crypto.name} wallet address`);
        return;
      }
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
      let recipientId: string | null = null;
      let recipientEmail: string | null = null;
      let recipientWalletAddress: string | null = null;
      let isExternalWallet = false;

      if (transferMethod === 'email') {
        // Find user by email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', recipient));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('No user found with this email');
          setIsWithdrawing(false);
          return;
        }
        
        const recipientDoc = querySnapshot.docs[0];
        recipientId = recipientDoc.id;
        recipientEmail = recipient;
      } else {
        // Wallet address transfer - find if it's an internal user or external
        const userData = await findUserByWalletAddress(recipient, crypto.symbol);
        
        if (userData) {
          // Internal user
          recipientId = userData.id;
          recipientEmail = userData.email;
          recipientWalletAddress = recipient;
        } else {
          // External wallet - allow the transfer
          isExternalWallet = true;
          recipientWalletAddress = recipient;
          recipientEmail = 'External Wallet';
        }
      }

      const batch = writeBatch(db);
      
      // Update sender's wallet balance immediately
      const senderWalletRef = doc(db, 'users', currentUser.uid, 'wallets', crypto.id);
      const senderNewBalance = crypto.balance - totalDeduction;
      
      batch.update(senderWalletRef, {
        cryptoBalance: senderNewBalance
      });
      
      // Create sender transaction (completed immediately)
      const senderTxRef = doc(collection(senderWalletRef, 'transactions'));
      batch.set(senderTxRef, {
        type: 'sent',
        amount: withdrawAmount,
        fee: fee,
        total: totalDeduction,
        date: serverTimestamp(),
        status: 'completed',
        to: transferMethod === 'email' ? recipient : recipientWalletAddress,
        toEmail: recipientEmail,
        note: `Sent to ${transferMethod === 'email' ? recipientEmail : recipientWalletAddress}`,
        symbol: crypto.symbol,
        fiatAmount: fiatAmount ? parseFloat(fiatAmount) : null,
        fiatCurrency: fiatCurrency,
        recipientAddress: recipientWalletAddress,
        transferMethod: transferMethod,
        isExternal: isExternalWallet
      });
      
      // If it's an internal user, update their wallet and create pending transaction
      if (recipientId && !isExternalWallet) {
        // Get recipient's wallet
        const walletsRef = collection(db, 'users', recipientId, 'wallets');
        const walletQuery = query(walletsRef, where('symbol', '==', crypto.symbol));
        const walletSnapshot = await getDocs(walletQuery);
        
        if (!walletSnapshot.empty) {
          const recipientWallet = walletSnapshot.docs[0];
          const recipientWalletRef = doc(db, 'users', recipientId, 'wallets', recipientWallet.id);
          
          // Create recipient transaction with 5-minute delay
          const recipientTxRef = doc(collection(recipientWalletRef, 'transactions'));
          const pendingUntil = new Date();
          pendingUntil.setMinutes(pendingUntil.getMinutes() + 5); // 5 minutes delay
          
          batch.set(recipientTxRef, {
            type: 'received',
            amount: withdrawAmount,
            date: serverTimestamp(),
            status: 'pending',
            pendingUntil: Timestamp.fromDate(pendingUntil),
            from: currentUser.email,
            fromAddress: crypto.address,
            note: `Receiving from ${currentUser.email}`,
            symbol: crypto.symbol,
            fiatAmount: fiatAmount ? parseFloat(fiatAmount) : null,
            fiatCurrency: fiatCurrency,
            senderAddress: crypto.address,
            transferMethod: transferMethod
          });
        }
      }
      
      await batch.commit();

      if (notificationSettings) {
        triggerNotifications(notificationSettings, {
          type: 'transaction',
          title: 'Transaction Initiated',
          message: `Sent ${withdrawAmount} ${crypto.symbol} to ${isExternalWallet ? 'external wallet' : (transferMethod === 'email' ? recipientEmail : 'wallet address')}`
        }, toast);

        triggerNotifications(notificationSettings, {
          type: 'security',
          title: 'Security Alert',
          message: `Transfer of ${withdrawAmount} ${crypto.symbol} initiated from your account`
        }, toast);
      }

      toast({
        title: 'Transfer successful!',
        description: `${withdrawAmount} ${crypto.symbol} sent ${isExternalWallet ? 'to external wallet' : 'successfully'}.`,
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
    setAmount(maxAmount.toString());
    if (exchangeRate) {
      setFiatAmount((maxAmount * exchangeRate).toString());
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (exchangeRate && value) {
      const cryptoValue = parseFloat(value);
      if (!isNaN(cryptoValue)) {
        setFiatAmount((cryptoValue * exchangeRate).toString());
      }
    }
  };

  const handleFiatAmountChange = (value: string) => {
    setFiatAmount(value);
    if (exchangeRate && value) {
      const fiatValue = parseFloat(value);
      if (!isNaN(fiatValue)) {
        setAmount((fiatValue / exchangeRate).toString());
      }
    }
  };

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
          {/* Transfer Method Selection */}
          <div>
            <label className="block text-gray-700 mb-2">Transfer Method</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTransferMethod('email')}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  transferMethod === 'email'
                    ? 'bg-crypto-blue text-white border-crypto-blue'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } transition-colors`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setTransferMethod('wallet')}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  transferMethod === 'wallet'
                    ? 'bg-crypto-blue text-white border-crypto-blue'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } transition-colors`}
              >
                Wallet Address
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              {transferMethod === 'email' ? 'Recipient Email Address' : 'Recipient Wallet Address'}
            </label>
            <input
              type={transferMethod === 'email' ? 'email' : 'text'}
              placeholder={
                transferMethod === 'email' 
                  ? "Enter recipient's email" 
                  : `Enter ${crypto.name} wallet address`
              }
              className="w-full p-3 border rounded-lg"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              {transferMethod === 'email' 
                ? 'The recipient must have a registered account and a wallet for this cryptocurrency'
                : 'Enter any valid wallet address. Transfers to external wallets are allowed.'
              }
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
                  Max: {crypto.balance}
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0.00"
                  className="w-full p-3 border rounded-lg pl-10"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
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
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Processing Time</span>
              <span className="text-amber-600">Instant</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total to transfer</span>
              <span>
                {amount
                  ? `${(parseFloat(amount) + Math.max(0.0001, parseFloat(amount) * 0.005))} ${crypto.symbol}`
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
  const [useFallback, setUseFallback] = useState(false);
  const { toast } = useToast();

  // Show popular cryptos by default
  useEffect(() => {
    setSearchResults(POPULAR_CRYPTOS);
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults(POPULAR_CRYPTOS);
      return;
    }
    
    setIsLoading(true);
    setUseFallback(false);
    
    try {
      // Try to fetch from CoinGecko API first
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false`
      );
      
      if (!response.ok) {
        throw new Error('API limit reached, using fallback data');
      }
      
      const data = await response.json();
      const filtered = data.filter((crypto: CGCoin) => 
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(filtered);
      
    } catch (error) {
      console.log('CoinGecko API failed, using fallback data:', error);
      setUseFallback(true);
      
      // Use fallback data from our predefined list
      const filtered = POPULAR_CRYPTOS.filter((crypto: CGCoin) => 
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(filtered);
      
      if (filtered.length === 0) {
        toast({
          description: "Showing popular cryptocurrencies. Search functionality limited.",
        });
        setSearchResults(POPULAR_CRYPTOS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCrypto = (crypto: CGCoin) => {
    const walletAddress = getDefaultWalletAddress(crypto.symbol);
    
    const newCrypto: Cryptocurrency = {
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol.toLowerCase(),
      balance: 0,
      usdValue: 0,
      address: walletAddress,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      change: crypto.price_change_percentage_24h || 0,
      isUp: (crypto.price_change_percentage_24h || 0) >= 0,
      transactions: [],
      cgId: crypto.id,
      imageUrl: crypto.image
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
          {useFallback && (
            <p className="text-xs text-amber-600 mt-2">
              Using fallback data. Some cryptocurrencies may not be available.
            </p>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-blue"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <h4 className="text-gray-600 mb-2">
              {searchTerm ? 'Search Results' : 'Popular Cryptocurrencies'}
            </h4>
            <div className="space-y-2">
              {searchResults.map((crypto) => {
                const alreadyAdded = existingCryptos.some(c => c.symbol === crypto.symbol.toLowerCase());
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
                        <p className="text-sm text-gray-500">{crypto.symbol.toUpperCase()}</p>
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
        return 'Sent';
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
      return transaction.from || transaction.senderAddress || 'Unknown';
    }
    return transaction.to || transaction.recipientAddress || 'Unknown';
  };
  
  const getAmountColor = () => {
    return transaction.type === 'deposit' || transaction.type === 'received' 
      ? 'text-green-600' 
      : 'text-black';
  };

  const getTimeRemaining = () => {
    if (transaction.status === 'pending' && transaction.pendingUntil) {
      const now = new Date();
      const pendingUntil = new Date(transaction.pendingUntil);
      const diffMs = pendingUntil.getTime() - now.getTime();
      const diffMins = Math.max(0, Math.ceil(diffMs / 60000));
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    }
    return null;
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
          {transaction.status === 'pending' && (
            <div className="mt-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium flex items-center">
              <Clock size={14} className="mr-1" />
              Pending ({getTimeRemaining()})
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between mb-3">
              <span className="text-gray-500">Status</span>
              <span className={cn(
                "font-medium flex items-center",
                transaction.status === 'completed' ? 'text-green-600' : 'text-amber-600'
              )}>
                {transaction.status === 'pending' && <Clock size={14} className="mr-1" />}
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

  // Function to process pending transactions
  const processPendingTransactions = async (walletRef: any, transactions: any[]) => {
    const now = new Date();
    const batch = writeBatch(db);
    let hasUpdates = false;

    for (const tx of transactions) {
      if (tx.status === 'pending' && tx.pendingUntil) {
        const pendingUntil = tx.pendingUntil.toDate();
        if (now >= pendingUntil) {
          // Update transaction status to completed
          const txRef = doc(walletRef, 'transactions', tx.id);
          batch.update(txRef, {
            status: 'completed'
          });
          hasUpdates = true;

          // Update wallet balance
          const walletDoc = await getDoc(walletRef);
          if (walletDoc.exists()) {
            const walletData = walletDoc.data();
            const newBalance = (walletData.cryptoBalance || 0) + tx.amount;
            batch.update(walletRef, {
              cryptoBalance: newBalance
            });
          }
        }
      }
    }

    if (hasUpdates) {
      try {
        await batch.commit();
      } catch (error) {
        console.error('Error processing pending transactions:', error);
      }
    }
  };

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
              const walletRef = doc(db, 'users', currentUser.uid, 'wallets', walletDoc.id);
              
              let transactions: Transaction[] = [];
              try {
                const transactionsSnapshot = await getDocs(
                  collection(walletDoc.ref, 'transactions')
                );
                
                // Process pending transactions first
                const rawTransactions = transactionsSnapshot.docs
                  .filter(doc => doc.id !== 'initial')
                  .map(doc => {
                    const data = doc.data();
                    return {
                      id: doc.id,
                      ...data,
                      date: data.date?.toDate() || new Date(),
                      pendingUntil: data.pendingUntil?.toDate()
                    } as Transaction;
                  });

                // Check and process any pending transactions that are ready
                await processPendingTransactions(walletRef, rawTransactions);

                // Re-fetch transactions after processing
                const updatedTransactionsSnapshot = await getDocs(
                  collection(walletDoc.ref, 'transactions')
                );
                
                transactions = updatedTransactionsSnapshot.docs
                  .filter(doc => doc.id !== 'initial')
                  .map(doc => {
                    const data = doc.data();
                    return {
                      id: doc.id,
                      ...data,
                      date: data.date?.toDate() || new Date(),
                      pendingUntil: data.pendingUntil?.toDate()
                    } as Transaction;
                  });

              } catch (error) {
                console.error("Error fetching transactions:", error);
              }
              
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
                imageUrl: walletData.imageUrl
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
        imageUrl: newCrypto.imageUrl,
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
        description: "Failed to add wallet. Please try again.",
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

            <p className="mt-4 text-sm text-gray-600 text-center">
              Popular cryptocurrencies are available instantly. If you don't see a specific cryptocurrency, 
              it may not be supported in our current list.
            </p>
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
          <p className="text-sm text-gray-500">{crypto.balance} {crypto.symbol.toUpperCase()}</p>
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
  
  useEffect(() => {
    const setupPriceAlerts = async () => {
      if (!currentUser) return;
      
      try {
        const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'notifications');
        const docSnap = await getDoc(settingsRef);
        
        if (docSnap.exists()) {
          const settings = docSnap.data();
          
          if (settings.priceAlerts) {
            const simulatePriceAlert = () => {
              if (Math.random() > 0.5) {
                triggerNotifications(settings, {
                  type: 'price',
                  title: 'Price Alert',
                  message: `${localCrypto.symbol} price ${Math.random() > 0.5 ? 'increased' : 'decreased'} by 5%`
                }, toast);
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

  const getUsdValue = (amount: number) => {
    const exchangeRate = localCrypto.usdValue / localCrypto.balance;
    return amount * exchangeRate;
  };

  const getTimeRemaining = (pendingUntil: Date) => {
    const now = new Date();
    const diffMs = pendingUntil.getTime() - now.getTime();
    const diffMins = Math.max(0, Math.ceil(diffMs / 60000));
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
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
            <h3 className="text-3xl font-bold">{localCrypto.balance} {localCrypto.symbol.toUpperCase()}</h3>
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
                  className="w-full flex justify-between items-center p-4 border rounded-xl bg-white hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-all duration-200 ${
                        tx.type === 'deposit' || tx.type === 'received'
                          ? 'bg-gradient-to-br from-green-50 to-green-100 group-hover:from-green-100 group-hover:to-green-200'
                          : 'bg-gradient-to-br from-red-50 to-red-100 group-hover:from-red-100 group-hover:to-red-200'
                      }`}
                    >
                      {tx.type === 'deposit' || tx.type === 'received' ? (
                        <ArrowDownLeft
                          size={20}
                          strokeWidth={2.5}
                          style={{
                            stroke: 'url(#greenGradient)',
                          }}
                        >
                          <defs>
                            <linearGradient
                              id="greenGradient"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="1"
                            >
                              <stop offset="0%" stopColor="#22c55e" />
                              <stop offset="100%" stopColor="#16a34a" />
                            </linearGradient>
                          </defs>
                        </ArrowDownLeft>
                      ) : (
                        <ArrowUpRight
                          size={20}
                          strokeWidth={2.5}
                          style={{
                            stroke: 'url(#redGradient)',
                          }}
                        >
                          <defs>
                            <linearGradient
                              id="redGradient"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="1"
                            >
                              <stop offset="0%" stopColor="#ef4444" />
                              <stop offset="100%" stopColor="#dc2626" />
                            </linearGradient>
                          </defs>
                        </ArrowUpRight>
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-sm md:text-base capitalize">
                        {tx.type === 'withdrawal' ? 'sent' : tx.type}
                        {tx.status === 'pending' && (
                          <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                            Pending
                          </span>
                        )}
                        {tx.isExternal && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            External
                          </span>
                        )}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500">
                        {tx.date.toLocaleDateString()}
                        {tx.status === 'pending' && tx.pendingUntil && (
                          <span className="ml-2 text-amber-600">
                            • {getTimeRemaining(tx.pendingUntil)} remaining
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-semibold text-sm md:text-base ${
                        tx.type === 'deposit' || tx.type === 'received'
                          ? 'text-gradient-blue-purple'
                          : 'text-gradient-blue-indigo'
                      }`}
                    >
                      {tx.type === 'deposit' || tx.type === 'received' ? '+' : '-'}
                      {tx.amount} {localCrypto.symbol.toUpperCase()}
                    </p>

                    <p className="text-xs text-gray-500">
                      ${getUsdValue(tx.amount).toFixed(2)}
                    </p>

                    <p
                      className={`text-xs ${
                        tx.status === 'completed' 
                          ? 'text-green-500' 
                          : tx.status === 'pending'
                          ? 'text-amber-500'
                          : 'text-orange-500'
                      }`}
                    >
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
              className="mt-4 text-gradient-blue-purple font-medium hover:underline"
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