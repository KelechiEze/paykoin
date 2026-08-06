import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Copy, Check, ExternalLink, DollarSign, ArrowDown, Clock, 
  Hash, ArrowUpRight, ArrowDownLeft, Send, Wallet, ArrowLeftRight,
  PiggyBank, Coins, TrendingUp
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
  writeBatch
} from 'firebase/firestore';
import TransferFundsModal from '@/components/layout/TransferFundsModal';

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
  currentPrice?: number;
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
  image: string;
  market_cap: number;
  total_volume: number;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
}

interface DashboardData {
  depositBalance: number;
  tradingBalance: number;
  tradingProfit: number;
  totalBalance: number;
}

// Fallback cryptocurrency data with real prices
const FALLBACK_CRYPTOS: CGCoin[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    current_price: 43250.75,
    price_change_percentage_24h: 2.34,
    image: 'https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png',
    market_cap: 845000000000,
    total_volume: 28500000000
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'eth',
    current_price: 2580.45,
    price_change_percentage_24h: 1.87,
    image: 'https://coin-images.coingecko.com/coins/images/279/small/ethereum.png',
    market_cap: 310000000000,
    total_volume: 15800000000
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'sol',
    current_price: 102.30,
    price_change_percentage_24h: 5.67,
    image: 'https://coin-images.coingecko.com/coins/images/4128/small/solana.png',
    market_cap: 42000000000,
    total_volume: 3800000000
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ada',
    current_price: 0.52,
    price_change_percentage_24h: -0.45,
    image: 'https://coin-images.coingecko.com/coins/images/975/small/cardano.png',
    market_cap: 18500000000,
    total_volume: 650000000
  },
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    symbol: 'doge',
    current_price: 0.23,
    price_change_percentage_24h: 3.20,
    image: 'https://coin-images.coingecko.com/coins/images/5/small/dogecoin.png',
    market_cap: 32000000000,
    total_volume: 1200000000
  },
  {
    id: 'ripple',
    name: 'XRP',
    symbol: 'xrp',
    current_price: 2.80,
    price_change_percentage_24h: 1.20,
    image: 'https://coin-images.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    market_cap: 150000000000,
    total_volume: 5000000000
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'dot',
    current_price: 3.86,
    price_change_percentage_24h: 2.10,
    image: 'https://coin-images.coingecko.com/coins/images/12171/small/polkadot.png',
    market_cap: 9200000000,
    total_volume: 480000000
  },
  {
    id: 'matic-network',
    name: 'Polygon',
    symbol: 'matic',
    current_price: 0.22,
    price_change_percentage_24h: 4.30,
    image: 'https://coin-images.coingecko.com/coins/images/4713/small/matic-token-icon.png',
    market_cap: 8200000000,
    total_volume: 520000000
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'usdt',
    current_price: 1.00,
    price_change_percentage_24h: 0.00,
    image: 'https://coin-images.coingecko.com/coins/images/325/small/tether.png',
    market_cap: 120000000000,
    total_volume: 80000000000
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'bnb',
    current_price: 994.42,
    price_change_percentage_24h: -2.00,
    image: 'https://coin-images.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    market_cap: 150000000000,
    total_volume: 2000000000
  },
  {
    id: 'shiba-inu',
    name: 'Shiba Inu',
    symbol: 'shib',
    current_price: 0.00001192,
    price_change_percentage_24h: -2.80,
    image: 'https://coin-images.coingecko.com/coins/images/11939/small/shiba.png',
    market_cap: 7000000000,
    total_volume: 300000000
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'avax',
    current_price: 29.75,
    price_change_percentage_24h: -14.20,
    image: 'https://coin-images.coingecko.com/coins/images/12559/small/avalanche.png',
    market_cap: 11000000000,
    total_volume: 600000000
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'link',
    current_price: 20.48,
    price_change_percentage_24h: -6.20,
    image: 'https://coin-images.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    market_cap: 8200000000,
    total_volume: 520000000
  },
  {
    id: 'stellar',
    name: 'Stellar',
    symbol: 'xlm',
    current_price: 0.306,
    price_change_percentage_24h: -5.70,
    image: 'https://coin-images.coingecko.com/coins/images/100/small/stellar.png',
    market_cap: 8500000000,
    total_volume: 200000000
  },
  {
    id: 'trx',
    name: 'TRON',
    symbol: 'trx',
    current_price: 0.2872,
    price_change_percentage_24h: -1.30,
    image: 'https://coin-images.coingecko.com/coins/images/1094/small/tron.png',
    market_cap: 25000000000,
    total_volume: 1000000000
  },
  {
    id: 'near',
    name: 'NEAR Protocol',
    symbol: 'near',
    current_price: 3.50,
    price_change_percentage_24h: 5.20,
    image: 'https://coin-images.coingecko.com/coins/images/10365/small/near.png',
    market_cap: 3800000000,
    total_volume: 150000000
  },
  {
    id: 'aptos',
    name: 'Aptos',
    symbol: 'apt',
    current_price: 6.80,
    price_change_percentage_24h: 3.50,
    image: 'https://coin-images.coingecko.com/coins/images/26455/small/aptos.png',
    market_cap: 2800000000,
    total_volume: 120000000
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'arb',
    current_price: 0.65,
    price_change_percentage_24h: 2.80,
    image: 'https://coin-images.coingecko.com/coins/images/16547/small/arbitrum.png',
    market_cap: 2100000000,
    total_volume: 180000000
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'op',
    current_price: 1.80,
    price_change_percentage_24h: 4.10,
    image: 'https://coin-images.coingecko.com/coins/images/25244/small/optimism.png',
    market_cap: 1900000000,
    total_volume: 160000000
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
    'avax': '0x27ce5c98F25EA3E7c8567bd1DD61F6B9036F10C1',
    'near': '0x27ce5c98F25EA3E7c8567bd1DD61F6B9036F10C1',
    'apt': '0x27ce5c98F25EA3E7c8567bd1DD61F6B9036F10C1',
    'arb': '0x27ce5c98F25EA3E7c8567bd1DD61F6B9036F10C1',
    'op': '0x27ce5c98F25EA3E7c8567bd1DD61F6B9036F10C1'
  };
  
  return defaultWallets[symbol.toLowerCase()] || `0x${Math.random().toString(36).substring(2, 22)}${Math.random().toString(36).substring(2, 22)}`;
};

// Fetch real-time crypto data with retry logic and cache busting
const fetchCryptoPricesWithRetry = async (ids: string[], retries = 5, delay = 500): Promise<CGCoin[]> => {
  const uniqueIds = [...new Set(ids)];
  
  for (let i = 0; i < retries; i++) {
    try {
      const cacheBuster = `&_=${Date.now()}`;
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${uniqueIds.join(',')}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h${cacheBuster}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return data;
        }
      }
      
      if (response.status === 429) {
        const waitTime = delay * Math.pow(2, i);
        console.log(`Rate limited, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      } else {
        return getFallbackData(uniqueIds);
      }
    }
  }
  return getFallbackData(uniqueIds);
};

const getFallbackData = (ids: string[]): CGCoin[] => {
  const fallbackData: CGCoin[] = [];
  
  ids.forEach(id => {
    const fallback = FALLBACK_CRYPTOS.find(c => c.id === id);
    if (fallback) {
      fallbackData.push(fallback);
    }
  });
  
  return fallbackData;
};

const searchCryptosWithRetry = async (query: string, retries = 5, delay = 500): Promise<CGCoin[]> => {
  const searchTerm = query.trim().toLowerCase();
  
  for (let i = 0; i < retries; i++) {
    try {
      const cacheBuster = `&_=${Date.now()}`;
      const searchResponse = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(searchTerm)}${cacheBuster}`
      );
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        
        if (searchData.coins && searchData.coins.length > 0) {
          const coinIds = searchData.coins.slice(0, 20).map((coin: any) => coin.id);
          
          const marketResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h${cacheBuster}`
          );
          
          if (marketResponse.ok) {
            const marketData = await marketResponse.json();
            if (marketData && marketData.length > 0) {
              return marketData;
            }
          }
        }
      }
      
      const topCoinsResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h${cacheBuster}`
      );
      
      if (topCoinsResponse.ok) {
        const allData = await topCoinsResponse.json();
        const filtered = allData.filter((coin: CGCoin) => 
          coin.name.toLowerCase().includes(searchTerm) || 
          coin.symbol.toLowerCase().includes(searchTerm)
        );
        
        if (filtered.length > 0) {
          return filtered.slice(0, 20);
        }
      }
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      
      throw new Error('No results found');
    } catch (error) {
      console.warn(`Search attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      } else {
        const filtered = FALLBACK_CRYPTOS.filter(coin => 
          coin.name.toLowerCase().includes(searchTerm) || 
          coin.symbol.toLowerCase().includes(searchTerm)
        );
        return filtered.length > 0 ? filtered : FALLBACK_CRYPTOS.slice(0, 10);
      }
    }
  }
  return FALLBACK_CRYPTOS.slice(0, 10);
};

const fetchTopCryptosWithRetry = async (retries = 5, delay = 500): Promise<CGCoin[]> => {
  for (let i = 0; i < retries; i++) {
    try {
      const cacheBuster = `&_=${Date.now()}`;
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h${cacheBuster}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return data;
        }
      }
      
      if (response.status === 429) {
        const waitTime = delay * Math.pow(2, i);
        console.log(`Rate limited, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      } else {
        return FALLBACK_CRYPTOS;
      }
    }
  }
  return FALLBACK_CRYPTOS;
};

// Helper function to update dashboard stats
const updateDashboardStats = async (userId: string) => {
  try {
    const walletsSnapshot = await getDocs(collection(db, 'users', userId, 'wallets'));
    
    let totalBalance = 0;
    let activeWallets = 0;
    let topPerformer = '';
    let topPerformerChange = -Infinity;
    
    for (const walletDoc of walletsSnapshot.docs) {
      const walletData = walletDoc.data();
      const balance = walletData.cryptoBalance || 0;
      const currentPrice = walletData.currentPrice || 0;
      const usdValue = balance * currentPrice;
      
      totalBalance += usdValue;
      
      if (balance > 0) {
        activeWallets++;
      }
      
      const change = walletData.change || 0;
      if (change > topPerformerChange && balance > 0) {
        topPerformerChange = change;
        topPerformer = walletData.name || '';
      }
    }
    
    const portfolioGrowth = activeWallets > 0 ? topPerformerChange : 0;
    
    const dashboardRef = doc(db, 'users', userId, 'dashboard', 'stats');
    await updateDoc(dashboardRef, {
      totalBalance,
      activeWallets,
      topPerformer: topPerformer || 'None',
      portfolioGrowth
    });
    
    console.log('Dashboard stats updated successfully');
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
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
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientWalletAddress, setRecipientWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [fiatAmount, setFiatAmount] = useState('');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const [transferMethod, setTransferMethod] = useState<'email' | 'wallet'>('email');
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

  const hasRequiredDeposit = () => {
    const totalDeposits = crypto.transactions
      .filter(tx => tx.type === 'deposit' || tx.type === 'received')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const requiredDeposit = crypto.balance * 0.05;
    return totalDeposits >= requiredDeposit;
  };

  const handleWithdraw = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        description: "You must be logged in to transfer crypto",
      });
      return;
    }

    if (transferMethod === 'wallet' && !hasRequiredDeposit()) {
      const requiredDeposit = crypto.balance * 0.05;
      setError(`You need to make a deposit of at least ${requiredDeposit.toFixed(8)} ${crypto.symbol} (5% of your balance) before you can transfer using wallet addresses`);
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

    if (transferMethod === 'email') {
      if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
        setError('Please enter a valid email address');
        return;
      }

      if (recipientEmail === currentUser.email) {
        setError('You cannot send to your own email');
        return;
      }
    } else {
      if (!recipientWalletAddress.trim()) {
        setError('Please enter a valid wallet address');
        return;
      }

      if (recipientWalletAddress.length < 10) {
        setError('Please enter a valid wallet address');
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
      if (transferMethod === 'email') {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', recipientEmail));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('No user found with this email');
          setIsWithdrawing(false);
          return;
        }
        
        const recipientDoc = querySnapshot.docs[0];
        const recipientId = recipientDoc.id;
        
        const walletsRef = collection(db, 'users', recipientId, 'wallets');
        const walletQuery = query(walletsRef, where('symbol', '==', crypto.symbol));
        const walletSnapshot = await getDocs(walletQuery);
        
        if (walletSnapshot.empty) {
          setError('Recipient does not have a wallet for this cryptocurrency');
          setIsWithdrawing(false);
          return;
        }
        
        const recipientWallet = walletSnapshot.docs[0];
        const recipientWalletData = recipientWallet.data();
        
        const batch = writeBatch(db);
        
        const senderWalletRef = doc(db, 'users', currentUser.uid, 'wallets', crypto.id);
        const senderNewBalance = crypto.balance - totalDeduction;
        
        batch.update(senderWalletRef, {
          cryptoBalance: senderNewBalance
        });
        
        const senderTxRef = doc(collection(senderWalletRef, 'transactions'));
        batch.set(senderTxRef, {
          type: 'sent',
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
        
        const recipientWalletRef = doc(db, 'users', recipientId, 'wallets', recipientWallet.id);
        const recipientNewBalance = (recipientWalletData.cryptoBalance || 0) + withdrawAmount;
        
        batch.update(recipientWalletRef, {
          cryptoBalance: recipientNewBalance
        });
        
        const recipientTxRef = doc(collection(recipientWalletRef, 'transactions'));
        batch.set(recipientTxRef, {
          type: 'received',
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

        if (notificationSettings) {
          triggerNotifications(notificationSettings, {
            type: 'transaction',
            title: 'Transaction Completed',
            message: `Sent ${withdrawAmount} ${crypto.symbol} to ${recipientEmail}`
          }, toast);

          triggerNotifications(notificationSettings, {
            type: 'security',
            title: 'Security Alert',
            message: `Transfer of ${withdrawAmount} ${crypto.symbol} initiated from your account`
          }, toast);
        }

        toast({
          title: 'Transfer successful!',
          description: `${withdrawAmount} ${crypto.symbol} sent to ${recipientEmail}`,
        });
      } else {
        const requiredDeposit = crypto.balance * 0.05;
        toast({
          variant: "destructive",
          title: 'Deposit Required',
          description: `You need to make a deposit of at least ${requiredDeposit.toFixed(8)} ${crypto.symbol} (5% of your balance) before you can transfer using wallet addresses`,
        });
        setIsWithdrawing(false);
        return;
      }

      if (currentUser) {
        await updateDashboardStats(currentUser.uid);
      }

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

        <div className="mb-6">
          <label className="block text-gray-700 mb-3">Transfer Method</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTransferMethod('email')}
              className={`p-3 border rounded-lg text-center transition-colors ${
                transferMethod === 'email'
                  ? 'border-crypto-blue bg-crypto-blue/10 text-crypto-blue'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Send size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Email</span>
            </button>
            <button
              onClick={() => setTransferMethod('wallet')}
              className={`p-3 border rounded-lg text-center transition-colors ${
                transferMethod === 'wallet'
                  ? 'border-crypto-blue bg-crypto-blue/10 text-crypto-blue'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Wallet size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Wallet Address</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">
              {transferMethod === 'email' ? 'Recipient Email Address' : 'Recipient Wallet Address'}
            </label>
            {transferMethod === 'email' ? (
              <input
                type="email"
                placeholder="Enter recipient's email"
                className="w-full p-3 border rounded-lg"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            ) : (
              <div>
                <input
                  type="text"
                  placeholder={`Enter ${crypto.symbol.toUpperCase()} wallet address`}
                  className="w-full p-3 border rounded-lg"
                  value={recipientWalletAddress}
                  onChange={(e) => setRecipientWalletAddress(e.target.value)}
                />
                {!hasRequiredDeposit() && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm">
                      <strong>Deposit Required:</strong> You need to make a deposit of at least {(crypto.balance * 0.05).toFixed(8)} {crypto.symbol} (5% of your balance) before you can transfer using wallet addresses.
                    </p>
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {transferMethod === 'email' 
                ? "The recipient must have a registered account and a " + crypto.symbol + " wallet"
                : "Enter the recipient's wallet address for " + crypto.symbol.toUpperCase()
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
            disabled={isWithdrawing || (transferMethod === 'wallet' && !hasRequiredDeposit())}
            className="w-full py-3 bg-crypto-blue text-white rounded-lg hover:bg-crypto-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWithdrawing ? 'Processing Transfer...' : 
             transferMethod === 'wallet' && !hasRequiredDeposit() ? 'Deposit Required' : 'Transfer Now'}
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTopCryptos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTopCryptosWithRetry();
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching top cryptos:', error);
        setError('Using fallback data. Some prices may be delayed.');
        setSearchResults(FALLBACK_CRYPTOS);
        toast({
          description: "Using fallback cryptocurrency data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopCryptos();
  }, [toast]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTopCryptosWithRetry();
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching top cryptos:', error);
        setError('Using fallback data.');
        setSearchResults(FALLBACK_CRYPTOS);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const results = await searchCryptosWithRetry(searchTerm);
      if (results.length > 0) {
        setSearchResults(results);
      } else {
        setError('No cryptocurrencies found. Try a different search term.');
        const filtered = FALLBACK_CRYPTOS.filter(coin => 
          coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtered.length > 0) {
          setSearchResults(filtered);
          setError('Showing fallback results. Live data unavailable.');
        }
      }
    } catch (error) {
      console.error('Error searching cryptos:', error);
      setError('Search failed. Showing available cryptocurrencies.');
      const filtered = FALLBACK_CRYPTOS.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered.length > 0 ? filtered : FALLBACK_CRYPTOS);
    } finally {
      setIsSearching(false);
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
      imageUrl: crypto.image,
      currentPrice: crypto.current_price
    };
    
    onAdd(newCrypto);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Add New Cryptocurrency</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        
        <div className="mb-4">
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
              className="px-4 bg-crypto-blue text-white rounded-lg hover:bg-crypto-blue/90 transition-colors disabled:opacity-50"
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <p className="text-xs text-amber-600 mt-1">{error}</p>}
          {!error && searchTerm && <p className="text-xs text-gray-500 mt-1">Searching for: "{searchTerm}"</p>}
          {!error && !searchTerm && <p className="text-xs text-gray-500 mt-1">Showing top 50 cryptocurrencies by market cap</p>}
        </div>
        
        {isLoading || isSearching ? (
          <div className="flex justify-center py-8 flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-blue"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {searchResults.map((crypto) => {
                const alreadyAdded = existingCryptos.some(c => c.symbol === crypto.symbol.toLowerCase());
                return (
                  <div 
                    key={crypto.id} 
                    className={`p-3 rounded-lg border flex justify-between items-center ${alreadyAdded ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50 cursor-pointer'}`}
                    onClick={() => !alreadyAdded && handleAddCrypto(crypto)}
                  >
                    <div className="flex items-center min-w-0">
                      {crypto.image && (
                        <img 
                          src={crypto.image} 
                          alt={crypto.name} 
                          className="w-8 h-8 mr-3 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{crypto.name}</p>
                        <p className="text-sm text-gray-500">{crypto.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                    {alreadyAdded && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">Added</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-center">
              {searchTerm ? 'No cryptocurrencies found' : 'Loading cryptocurrencies...'}
            </p>
          </div>
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
      return transaction.from || 'Unknown';
    }
    return transaction.to || 'Unknown';
  };
  
  const getAmountColor = () => {
    return transaction.type === 'deposit' || transaction.type === 'received' 
      ? 'text-green-600' 
      : 'text-black';
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
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    depositBalance: 0,
    tradingBalance: 0,
    tradingProfit: 0,
    totalBalance: 0
  });
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

  // Fetch dashboard data for balances
  useEffect(() => {
    if (!authChecked || !currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid, 'dashboard', 'stats'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setDashboardData({
            depositBalance: data.depositBalance || 0,
            tradingBalance: data.tradingBalance || 0,
            tradingProfit: data.tradingProfit || 0,
            totalBalance: data.totalBalance || 0
          });
        }
      },
      (err) => {
        console.error('Error fetching dashboard data:', err);
      }
    );

    return () => unsubscribe();
  }, [authChecked, currentUser]);

  // Update crypto prices every 30 seconds with cache busting
  useEffect(() => {
    if (!authChecked || !currentUser || cryptos.length === 0) return;

    const updatePrices = async () => {
      try {
        const cgIds = cryptos.filter(c => c.cgId).map(c => c.cgId!);
        if (cgIds.length === 0) return;

        const uniqueIds = [...new Set(cgIds)];
        
        const priceData = await fetchCryptoPricesWithRetry(uniqueIds);
        
        if (priceData && priceData.length > 0) {
          setCryptos(prevCryptos => 
            prevCryptos.map(crypto => {
              const priceInfo = priceData.find(p => p.id === crypto.cgId);
              if (priceInfo && priceInfo.current_price) {
                const newPrice = priceInfo.current_price;
                const newChange = priceInfo.price_change_percentage_24h || 0;
                return {
                  ...crypto,
                  currentPrice: newPrice,
                  change: newChange,
                  isUp: newChange >= 0,
                  usdValue: crypto.balance * newPrice
                };
              }
              return crypto;
            })
          );
        }
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    };

    updatePrices();
    const intervalId = setInterval(updatePrices, 30000);

    return () => clearInterval(intervalId);
  }, [authChecked, currentUser, cryptos.length]);

  // Listen to wallet changes and update dashboard stats
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
                      date: data.date?.toDate() || new Date()
                    } as Transaction;
                  });
              } catch (error) {
                console.error("Error fetching transactions:", error);
              }
              
              let currentPrice = walletData.currentPrice || 0;
              let priceChange = walletData.change || 0;
              
              if (walletData.cgId) {
                try {
                  const priceData = await fetchCryptoPricesWithRetry([walletData.cgId]);
                  if (priceData.length > 0) {
                    currentPrice = priceData[0].current_price;
                    priceChange = priceData[0].price_change_percentage_24h || 0;
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
                imageUrl: walletData.imageUrl,
                currentPrice: currentPrice
              };
            })
          );

          setCryptos(updatedCryptos);
          
          if (currentUser) {
            await updateDashboardStats(currentUser.uid);
          }
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
        currentPrice: newCrypto.currentPrice || 0,
        createdAt: serverTimestamp()
      });

      await setDoc(doc(walletRef, 'transactions', 'initial'), {});

      await updateDashboardStats(currentUser.uid);

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

  const handleTransferSuccess = () => {
    toast({
      description: "Transfer completed successfully!",
    });
    setIsTransferModalOpen(false);
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
      
      {/* Transfer Funds Modal */}
      {isTransferModalOpen && currentUser && (
        <TransferFundsModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          onSuccess={handleTransferSuccess}
          userId={currentUser.uid}
          depositBalance={dashboardData.depositBalance}
          tradingBalance={dashboardData.tradingBalance}
        />
      )}
      
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Wallets</h1>
      
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dashboard-card bg-white border-l-4 border-blue-500">
          <div className="flex items-center space-x-2">
            <PiggyBank className="text-blue-600" size={20} />
            <h2 className="text-sm font-medium text-gray-600">Deposit Balance</h2>
          </div>
          <p className="text-2xl font-bold mt-2">${dashboardData.depositBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="dashboard-card bg-white border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="text-green-600" size={20} />
              <h2 className="text-sm font-medium text-gray-600">Trading Balance</h2>
            </div>
            <button 
              onClick={() => setIsTransferModalOpen(true)}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <ArrowLeftRight size={12} />
              <span>Transfer</span>
            </button>
          </div>
          <p className="text-2xl font-bold mt-2">${dashboardData.tradingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="dashboard-card bg-white border-l-4 border-purple-500">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-purple-600" size={20} />
            <h2 className="text-sm font-medium text-gray-600">Trading Profit</h2>
          </div>
          <p className="text-2xl font-bold mt-2">${dashboardData.tradingProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="dashboard-card bg-white border-l-4 border-gray-500">
          <div className="flex items-center space-x-2">
            <Wallet className="text-gray-600" size={20} />
            <h2 className="text-sm font-medium text-gray-600">Total Balance</h2>
          </div>
          <p className="text-2xl font-bold mt-2">${dashboardData.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
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
              Search for any cryptocurrency by name or symbol to add it to your wallet.
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
  const { currentUser } = useAuth();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const handleWithdrawSuccess = () => {
    if (currentUser) {
      updateDashboardStats(currentUser.uid);
    }
    toast({
      description: "Withdrawal successful!",
    });
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
                  message: `${crypto.symbol} price ${Math.random() > 0.5 ? 'increased' : 'decreased'} by 5%`
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
  }, [currentUser, crypto.symbol, toast]);
  
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
  
  const handleViewOnExplorer = () => {
    let explorerUrl = '';
    
    switch (crypto.symbol.toLowerCase()) {
      case 'btc':
        explorerUrl = `https://www.blockchain.com/explorer/addresses/btc/${crypto.address}`;
        break;
      case 'eth':
        explorerUrl = `https://etherscan.io/address/${crypto.address}`;
        break;
      case 'sol':
        explorerUrl = `https://solscan.io/account/${crypto.address}`;
        break;
      case 'ada':
        explorerUrl = `https://cardanoscan.io/address/${crypto.address}`;
        break;
      default:
        explorerUrl = `https://www.google.com/search?q=${crypto.name}+blockchain+explorer`;
    }
    
    window.open(explorerUrl, '_blank');
  };

  const getUsdValue = (amount: number) => {
    const exchangeRate = crypto.usdValue / crypto.balance;
    return amount * exchangeRate;
  };
  
  return (
    <div className="animate-fade-in">
      {showTransferModal && (
        <TransferModal crypto={crypto} onClose={() => setShowTransferModal(false)} />
      )}
      
      {showWithdrawModal && (
        <WithdrawModal 
          crypto={crypto} 
          onClose={() => setShowWithdrawModal(false)}
          onWithdrawSuccess={handleWithdrawSuccess}
        />
      )}
      
      {selectedTransaction && (
        <TransactionDetailModal 
          transaction={selectedTransaction} 
          crypto={crypto} 
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
            style={{ backgroundColor: `${crypto.color}20` }}
          >
            {crypto.imageUrl ? (
              <img 
                src={crypto.imageUrl} 
                alt={crypto.name} 
                className="w-8 h-8"
              />
            ) : (
              <span style={{ color: crypto.color }} className="text-sm font-bold">
                {crypto.symbol.slice(0, 4).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{crypto.name}</h2>
            <p className="text-gray-500">{crypto.symbol.toUpperCase()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-gray-500 mb-1">Balance</p>
            <h3 className="text-3xl font-bold">{crypto.balance} {crypto.symbol.toUpperCase()}</h3>
            <p className="mt-1 text-xl">${crypto.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className={cn(
              "py-2 px-4 rounded-lg text-center",
              crypto.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            )}>
              <p className="font-medium">
                {crypto.isUp ? "+" : ""}{crypto.change.toFixed(2)}% 
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
                  {crypto.address}
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
        {crypto.transactions.length > 0 ? (
          <div className="space-y-4">
            {crypto.transactions
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
                        <ArrowUpRight className="text-black" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm md:text-base capitalize">
                        {tx.type === 'withdrawal' ? 'sent' : tx.type}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500">
                        {tx.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm md:text-base ${tx.type === 'deposit' || tx.type === 'received' ? 'text-green-600' : 'text-black'}`}>
                      {tx.type === 'deposit' || tx.type === 'received' ? '+' : '-'}
                      {tx.amount} {crypto.symbol.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${getUsdValue(tx.amount).toFixed(2)}
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