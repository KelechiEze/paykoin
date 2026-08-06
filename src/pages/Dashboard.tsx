import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, TrendingUp, TrendingDown, Activity, 
  ArrowRight, DollarSign, Bitcoin, Wallet, 
  Send, X, Bell, Search, Loader, Brain, AlertTriangle,
  Star, Zap, Target, Check, ArrowUpRight, Coins, 
  PiggyBank, ArrowLeftRight, Play, Pause, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import CryptoAssetsModal from '@/components/layout/CryptoAssetsModal';
import { auth, db } from '@/firebase';
import { 
  doc, getDoc, onSnapshot, collection, 
  addDoc, query, where, orderBy, serverTimestamp,
  updateDoc, arrayUnion, arrayRemove, getDocs, setDoc,
  runTransaction
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import TransferFundsModal from '@/components/layout/TransferFundsModal';

interface MarketTrend {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image?: string;
}

interface DashboardData {
  totalBalance: number;
  depositBalance: number;
  tradingBalance: number;
  tradingProfit: number;
  portfolioGrowth: number;
  activeWallets: number;
  topPerformer: string;
  topPerformerImage?: string;
  topPerformerSymbol?: string;
  topPerformerChange?: number;
  isTradingActive: boolean;
  tradingStartDate?: Date;
  lastProfitUpdate?: Date;
  weeklyProfitRate?: number;
  currentTradingAmount?: number;
}

interface AITradingSuggestion {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  aiConfidence: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell';
  description: string;
  benefits: string[];
  risks: string[];
  image?: string;
}

// Trading profit tiers
const getTradingProfitRate = (amount: number): number => {
  if (amount >= 100000) return 13; // 10-13% for $100,000+
  if (amount >= 20000) return 10; // 10% for $20,000 - $100,000
  if (amount >= 5000) return 7; // 7% for $5,000 - $20,000
  if (amount >= 500) return 5; // 5% for $500 - $5,000
  return 0;
};

// FALLBACK MARKET DATA
const FALLBACK_MARKET_TRENDS: MarketTrend[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    current_price: 43250.75,
    price_change_percentage_24h: 2.34,
    image: 'https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    current_price: 2580.45,
    price_change_percentage_24h: 1.87,
    image: 'https://coin-images.coingecko.com/coins/images/279/small/ethereum.png'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    current_price: 102.30,
    price_change_percentage_24h: 5.67,
    image: 'https://coin-images.coingecko.com/coins/images/4128/small/solana.png'
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    current_price: 0.52,
    price_change_percentage_24h: -0.45,
    image: 'https://coin-images.coingecko.com/coins/images/975/small/cardano.png'
  },
  {
    id: 'ripple',
    name: 'XRP',
    symbol: 'XRP',
    current_price: 2.80,
    price_change_percentage_24h: 1.20,
    image: 'https://coin-images.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png'
  },
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    symbol: 'DOGE',
    current_price: 0.23,
    price_change_percentage_24h: 3.20,
    image: 'https://coin-images.coingecko.com/coins/images/5/small/dogecoin.png'
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    current_price: 3.86,
    price_change_percentage_24h: 2.10,
    image: 'https://coin-images.coingecko.com/coins/images/12171/small/polkadot.png'
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'LINK',
    current_price: 20.48,
    price_change_percentage_24h: -6.20,
    image: 'https://coin-images.coingecko.com/coins/images/877/small/chainlink-new-logo.png'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    current_price: 29.75,
    price_change_percentage_24h: -14.20,
    image: 'https://coin-images.coingecko.com/coins/images/12559/small/avalanche.png'
  },
  {
    id: 'matic-network',
    name: 'Polygon',
    symbol: 'MATIC',
    current_price: 0.22,
    price_change_percentage_24h: 4.30,
    image: 'https://coin-images.coingecko.com/coins/images/4713/small/matic-token-icon.png'
  }
];

// FALLBACK AI SUGGESTIONS
const FALLBACK_AI_SUGGESTIONS: AITradingSuggestion[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 43250.75,
    change24h: 2.34,
    marketCap: 845000000000,
    volume24h: 28500000000,
    aiConfidence: 88,
    riskLevel: 'Medium',
    recommendation: 'Strong Buy',
    image: 'https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png',
    description: 'Bitcoin continues to show strength as digital gold with increasing institutional adoption and limited supply dynamics.',
    benefits: [
      'Store of value characteristics',
      'Strong network security',
      'Limited supply of 21 million',
      'Growing institutional adoption'
    ],
    risks: [
      'Price volatility remains high',
      'Regulatory scrutiny increasing',
      'Energy consumption concerns',
      'Competition from other stores of value'
    ]
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 2580.45,
    change24h: 1.87,
    marketCap: 310000000000,
    volume24h: 15800000000,
    aiConfidence: 82,
    riskLevel: 'Medium',
    recommendation: 'Buy',
    image: 'https://coin-images.coingecko.com/coins/images/279/small/ethereum.png',
    description: 'Ethereum ecosystem shows robust growth with DeFi and NFT applications driving network value and utility.',
    benefits: [
      'Largest smart contract platform',
      'Strong developer ecosystem',
      'Upcoming protocol improvements',
      'Diverse application landscape'
    ],
    risks: [
      'Network congestion issues',
      'Competition from layer 2 solutions',
      'Regulatory uncertainty for DeFi',
      'Transition to proof-of-stake risks'
    ]
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    price: 102.30,
    change24h: 5.67,
    marketCap: 42000000000,
    volume24h: 3800000000,
    aiConfidence: 76,
    riskLevel: 'High',
    recommendation: 'Buy',
    image: 'https://coin-images.coingecko.com/coins/images/4128/small/solana.png',
    description: 'Solana demonstrates high throughput capabilities with growing DeFi and NFT projects building on its network.',
    benefits: [
      'High transaction throughput',
      'Low transaction costs',
      'Growing ecosystem of dApps',
      'Strong venture capital backing'
    ],
    risks: [
      'Network stability concerns',
      'Centralization criticisms',
      'Early stage technology',
      'Competitive landscape intense'
    ]
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    price: 0.52,
    change24h: -0.45,
    marketCap: 18500000000,
    volume24h: 650000000,
    aiConfidence: 71,
    riskLevel: 'Medium',
    recommendation: 'Hold',
    image: 'https://coin-images.coingecko.com/coins/images/975/small/cardano.png',
    description: 'Cardano continues its methodical development approach with smart contract capabilities now live on mainnet.',
    benefits: [
      'Peer-reviewed development',
      'Strong academic partnerships',
      'Energy efficient proof-of-stake',
      'Global adoption initiatives'
    ],
    risks: [
      'Slower development pace',
      'Ecosystem maturity needed',
      'Competition from established platforms',
      'Market sentiment volatility'
    ]
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    price: 7.25,
    change24h: 3.12,
    marketCap: 9200000000,
    volume24h: 480000000,
    aiConfidence: 79,
    riskLevel: 'Medium',
    recommendation: 'Buy',
    image: 'https://coin-images.coingecko.com/coins/images/12171/small/polkadot.png',
    description: 'Polkadot interoperability framework enables cross-chain communication with parachain auctions driving ecosystem growth.',
    benefits: [
      'Interoperability between chains',
      'Shared security model',
      'Active parachain ecosystem',
      'Strong technical foundation'
    ],
    risks: [
      'Complex technology stack',
      'Competition in interoperability',
      'Adoption timeline uncertainties',
      'Regulatory landscape evolving'
    ]
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'LINK',
    price: 14.80,
    change24h: 1.25,
    marketCap: 8200000000,
    volume24h: 520000000,
    aiConfidence: 85,
    riskLevel: 'Low',
    recommendation: 'Strong Buy',
    image: 'https://coin-images.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    description: 'Chainlink maintains dominant position as decentralized oracle network with growing integrations across DeFi and enterprise.',
    benefits: [
      'Market leader in oracle space',
      'Strong enterprise partnerships',
      'Proven track record of reliability',
      'Growing use cases beyond DeFi'
    ],
    risks: [
      'Competition emerging in oracle space',
      'Smart contract dependency risks',
      'Market correlation with DeFi',
      'Technology adoption pace'
    ]
  }
];

// Helper function to initialize or update user balances
const initializeUserBalances = async (userId: string) => {
  try {
    const dashboardRef = doc(db, 'users', userId, 'dashboard', 'stats');
    const docSnap = await getDoc(dashboardRef);
    
    if (!docSnap.exists()) {
      // New user - initialize all balances to 0
      const initialData: DashboardData = {
        totalBalance: 0,
        depositBalance: 0,
        tradingBalance: 0,
        tradingProfit: 0,
        portfolioGrowth: 0,
        activeWallets: 0,
        topPerformer: '',
        topPerformerImage: '',
        topPerformerSymbol: '',
        topPerformerChange: 0,
        isTradingActive: false,
        weeklyProfitRate: 0,
        currentTradingAmount: 0
      };
      await setDoc(dashboardRef, initialData);
      console.log('New user balances initialized to 0');
      return;
    }
    
    // Existing user - check and add missing fields
    const data = docSnap.data();
    const updates: any = {};
    
    // Preserve existing totalBalance, or set to 0 if missing
    if (data.totalBalance === undefined) updates.totalBalance = 0;
    if (data.depositBalance === undefined) updates.depositBalance = data.totalBalance || 0;
    if (data.tradingBalance === undefined) updates.tradingBalance = 0;
    if (data.tradingProfit === undefined) updates.tradingProfit = 0;
    if (data.isTradingActive === undefined) updates.isTradingActive = false;
    if (data.weeklyProfitRate === undefined) updates.weeklyProfitRate = 0;
    if (data.currentTradingAmount === undefined) updates.currentTradingAmount = 0;
    if (data.topPerformerImage === undefined) updates.topPerformerImage = '';
    if (data.topPerformerSymbol === undefined) updates.topPerformerSymbol = '';
    if (data.topPerformerChange === undefined) updates.topPerformerChange = 0;
    
    // Update only if there are missing fields
    if (Object.keys(updates).length > 0) {
      await updateDoc(dashboardRef, updates);
      console.log('Existing user balances updated with missing fields');
    }
  } catch (error) {
    console.error('Error initializing user balances:', error);
  }
};

// Helper function to update dashboard stats from wallets
const updateDashboardStats = async (userId: string) => {
  try {
    const walletsSnapshot = await getDocs(collection(db, 'users', userId, 'wallets'));
    
    let totalBalance = 0;
    let activeWallets = 0;
    let topPerformer = '';
    let topPerformerImage = '';
    let topPerformerSymbol = '';
    let topPerformerChange = -Infinity;
    
    for (const walletDoc of walletsSnapshot.docs) {
      const walletData = walletDoc.data();
      const balance = walletData.cryptoBalance || 0;
      const currentPrice = walletData.currentPrice || 0;
      const usdValue = balance * currentPrice;
      
      totalBalance += usdValue;
      
      if (balance > 0) activeWallets++;
      
      // Track top performer based on price change
      const change = walletData.change || 0;
      if (change > topPerformerChange && balance > 0) {
        topPerformerChange = change;
        topPerformer = walletData.name || '';
        topPerformerImage = walletData.imageUrl || '';
        topPerformerSymbol = walletData.symbol || '';
      }
    }
    
    const dashboardRef = doc(db, 'users', userId, 'dashboard', 'stats');
    const dashboardSnap = await getDoc(dashboardRef);
    
    if (dashboardSnap.exists()) {
      const data = dashboardSnap.data();
      await updateDoc(dashboardRef, {
        totalBalance,
        activeWallets,
        topPerformer: topPerformer || 'None',
        topPerformerImage: topPerformerImage || '',
        topPerformerSymbol: topPerformerSymbol || '',
        topPerformerChange: topPerformerChange !== -Infinity ? topPerformerChange : 0,
        portfolioGrowth: data.tradingProfit ? (data.tradingProfit / (data.tradingBalance || 1)) * 100 : 0
      });
    }
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
  }
};

// Handle trading logic
const handleTradingAction = async (userId: string, action: 'start' | 'stop') => {
  try {
    const dashboardRef = doc(db, 'users', userId, 'dashboard', 'stats');
    const docSnap = await getDoc(dashboardRef);
    
    if (!docSnap.exists()) {
      throw new Error('User dashboard not found');
    }
    
    const data = docSnap.data();
    const tradingBalance = data.tradingBalance || 0;
    
    if (action === 'start') {
      // Check if trading balance is $0
      if (tradingBalance === 0) {
        throw new Error('You must deposit funds before you can start trading. Please transfer funds from your Deposit Balance to Trading Balance.');
      }
      
      // Check if trading balance is sufficient
      if (tradingBalance < 500) {
        throw new Error('Minimum trading balance of $500 required to start trading. Please deposit more funds.');
      }
      
      // Calculate profit rate based on amount
      const profitRate = getTradingProfitRate(tradingBalance);
      
      await updateDoc(dashboardRef, {
        isTradingActive: true,
        tradingStartDate: serverTimestamp(),
        lastProfitUpdate: serverTimestamp(),
        weeklyProfitRate: profitRate,
        currentTradingAmount: tradingBalance
      });
      
      // Record transaction
      const historyRef = collection(db, 'users', userId, 'transactions');
      await addDoc(historyRef, {
        type: 'trading_started',
        amount: tradingBalance,
        profitRate: profitRate,
        date: serverTimestamp(),
        status: 'active',
        description: `Trading started with $${tradingBalance.toFixed(2)} at ${profitRate}% weekly profit rate`
      });
      
      return { success: true, message: 'Trading started successfully!' };
    } else {
      // Stop trading
      await updateDoc(dashboardRef, {
        isTradingActive: false
      });
      
      // Record transaction
      const historyRef = collection(db, 'users', userId, 'transactions');
      await addDoc(historyRef, {
        type: 'trading_stopped',
        date: serverTimestamp(),
        status: 'completed',
        description: `Trading stopped. Total profit earned: $${data.tradingProfit?.toFixed(2) || '0.00'}`
      });
      
      return { success: true, message: 'Trading stopped successfully!' };
    }
  } catch (error: any) {
    console.error('Error handling trading action:', error);
    return { success: false, message: error.message || 'Failed to process trading action' };
  }
};

// Calculate weekly profit
const calculateWeeklyProfit = async (userId: string) => {
  try {
    const dashboardRef = doc(db, 'users', userId, 'dashboard', 'stats');
    const docSnap = await getDoc(dashboardRef);
    
    if (!docSnap.exists()) return;
    
    const data = docSnap.data();
    
    // Only calculate if trading is active
    if (!data.isTradingActive) return;
    
    const lastUpdate = data.lastProfitUpdate?.toDate?.() || new Date();
    const now = new Date();
    const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    // Calculate weekly profit (7 days = 168 hours)
    const weeklyRate = data.weeklyProfitRate || 0;
    const tradingAmount = data.currentTradingAmount || data.tradingBalance || 0;
    
    // Calculate profit for the elapsed time (pro-rata)
    const weeklyProfit = (tradingAmount * weeklyRate) / 100;
    const hourlyProfit = weeklyProfit / 168;
    const profitEarned = hourlyProfit * hoursSinceLastUpdate;
    
    if (profitEarned > 0) {
      // Update trading profit
      const newTradingProfit = (data.tradingProfit || 0) + profitEarned;
      
      await updateDoc(dashboardRef, {
        tradingProfit: newTradingProfit,
        lastProfitUpdate: now,
        totalBalance: (data.totalBalance || 0) + profitEarned
      });
      
      // Record profit transaction if significant
      if (profitEarned > 0.01) {
        const historyRef = collection(db, 'users', userId, 'transactions');
        await addDoc(historyRef, {
          type: 'profit_earned',
          amount: profitEarned,
          date: serverTimestamp(),
          status: 'completed',
          description: `Weekly profit earned: $${profitEarned.toFixed(2)} at ${weeklyRate}% rate`
        });
      }
    }
  } catch (error) {
    console.error('Error calculating weekly profit:', error);
  }
};

const Dashboard: React.FC = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>(FALLBACK_MARKET_TRENDS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalBalance: 0,
    depositBalance: 0,
    tradingBalance: 0,
    tradingProfit: 0,
    portfolioGrowth: 0,
    activeWallets: 0,
    topPerformer: '',
    topPerformerImage: '',
    topPerformerSymbol: '',
    topPerformerChange: 0,
    isTradingActive: false,
    weeklyProfitRate: 0,
    currentTradingAmount: 0
  });
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AITradingSuggestion[]>(FALLBACK_AI_SUGGESTIONS);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<AITradingSuggestion | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isTradingActionLoading, setIsTradingActionLoading] = useState(false);
  const [tradingStatusMessage, setTradingStatusMessage] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  // Array of welcome messages
  const welcomeMessages = [
    "Welcome back! Your financial progress is our success.",
    "Great to see you! Let's grow your profits together.",
    "Hello again! Your portfolio's progress brings us happiness.",
    "Welcome! We're excited to cooperate on your financial journey.",
    "Good to have you here! Your success is our foremost address.",
    "Hello! Let's continue building wealth and prosperity.",
    "Welcome back! Your financial growth is our shared quest.",
    "Great to see you! Together we'll achieve financial greatness.",
    "Hello again! Your profits and progress truly impress.",
    "Welcome! Let's make your financial dreams manifest."
  ];

  // Set a random welcome message on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setWelcomeMessage(welcomeMessages[randomIndex]);
  }, []);

  // Initialize user data and fetch dashboard data
  useEffect(() => {
    if (!user) return;

    const initializeAndFetch = async () => {
      try {
        await initializeUserBalances(user.uid);

        const unsubscribe = onSnapshot(
          doc(db, 'users', user.uid, 'dashboard', 'stats'),
          (doc) => {
            if (doc.exists()) {
              const data = doc.data() as DashboardData;
              setDashboardData(prev => ({
                ...prev,
                ...data
              }));
            }
          },
          (err) => {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing user data:', error);
        setError('Failed to initialize dashboard');
      }
    };

    initializeAndFetch();
  }, [user]);

  // Fetch wallet data to update dashboard stats
  useEffect(() => {
    if (!user) return;

    const fetchWalletData = async () => {
      try {
        const unsubscribe = onSnapshot(
          collection(db, 'users', user.uid, 'wallets'),
          async (snapshot) => {
            await updateDashboardStats(user.uid);
          },
          (err) => {
            console.error('Error fetching wallet data:', err);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up wallet listener:', error);
      }
    };

    fetchWalletData();
  }, [user]);

  // Weekly profit calculation interval
  useEffect(() => {
    if (!user || !dashboardData.isTradingActive) return;

    // Calculate profit every hour
    const intervalId = setInterval(() => {
      calculateWeeklyProfit(user.uid);
    }, 60 * 60 * 1000); // Every hour

    // Initial calculation
    calculateWeeklyProfit(user.uid);

    return () => clearInterval(intervalId);
  }, [user, dashboardData.isTradingActive]);

  // Fetch market trends data
  useEffect(() => {
    const fetchMarketTrends = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1&sparkline=false&price_change_percentage=24h'
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setMarketTrends(data);
            setError(null);
          }
        }
      } catch (err) {
        console.log('Error fetching market trends, using fallback:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketTrends();
    
    const intervalId = setInterval(fetchMarketTrends, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Fetch AI Trading Suggestions
  useEffect(() => {
    const fetchAiSuggestions = async () => {
      try {
        setIsLoadingAi(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=false&price_change_percentage=24h'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch AI suggestions');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const suggestions: AITradingSuggestion[] = data.map((coin: any, index: number) => {
            const confidence = 75 + Math.random() * 20;
            const riskLevels: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
            const recommendations: ('Strong Buy' | 'Buy' | 'Hold' | 'Sell')[] = ['Strong Buy', 'Buy', 'Hold'];
            
            const riskIndex = coin.market_cap_rank <= 10 ? 0 : coin.market_cap_rank <= 50 ? 1 : 2;
            const recommendationIndex = coin.price_change_percentage_24h > 5 ? 0 : coin.price_change_percentage_24h > 0 ? 1 : 2;
            
            return {
              id: coin.id,
              name: coin.name,
              symbol: coin.symbol.toUpperCase(),
              price: coin.current_price,
              change24h: coin.price_change_percentage_24h,
              marketCap: coin.market_cap,
              volume24h: coin.total_volume,
              aiConfidence: Math.round(confidence),
              riskLevel: riskLevels[riskIndex],
              recommendation: recommendations[recommendationIndex],
              image: coin.image,
              description: `AI analysis suggests ${coin.symbol.toUpperCase()} shows strong momentum with ${coin.price_change_percentage_24h > 0 ? 'positive' : 'consolidating'} trends.`,
              benefits: [
                'High liquidity and market depth',
                'Strong community and developer support',
                'Proven track record in market cycles',
                'Institutional adoption growing'
              ],
              risks: [
                'Market volatility can be extreme',
                'Regulatory uncertainties exist',
                'Technology and security risks',
                'Competition from other projects'
              ]
            };
          });
          
          setAiSuggestions(suggestions);
        }
      } catch (err) {
        console.error('Error fetching AI suggestions, using fallback:', err);
      } finally {
        setIsLoadingAi(false);
      }
    };

    fetchAiSuggestions();
    
    const intervalId = setInterval(fetchAiSuggestions, 120000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prev) => !prev);
  };

  const handleStartTrading = (crypto: AITradingSuggestion) => {
    setSelectedCrypto(crypto);
    setIsAiModalOpen(true);
  };

  const handleConfirmTrading = () => {
    setIsAiModalOpen(false);
    setSelectedCrypto(null);
    navigate('/wallets');
  };

  const handleCloseModal = () => {
    setIsAiModalOpen(false);
    setSelectedCrypto(null);
  };

  const handleOpenTransferModal = () => {
    setIsTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
  };

  const handleTransferSuccess = async () => {
    if (user) {
      const dashboardRef = doc(db, 'users', user.uid, 'dashboard', 'stats');
      const docSnap = await getDoc(dashboardRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as DashboardData;
        setDashboardData(prev => ({
          ...prev,
          ...data
        }));
      }
    }
    setIsTransferModalOpen(false);
  };

  const handleTradeAction = async () => {
    if (!user) return;
    
    setIsTradingActionLoading(true);
    setTradingStatusMessage(null);
    
    try {
      const action = dashboardData.isTradingActive ? 'stop' : 'start';
      const result = await handleTradingAction(user.uid, action);
      
      if (result.success) {
        setTradingStatusMessage({
          type: 'success',
          message: result.message
        });
        
        // Refresh data
        const dashboardRef = doc(db, 'users', user.uid, 'dashboard', 'stats');
        const docSnap = await getDoc(dashboardRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as DashboardData;
          setDashboardData(prev => ({
            ...prev,
            ...data
          }));
        }
      } else {
        setTradingStatusMessage({
          type: 'error',
          message: result.message
        });
      }
    } catch (error: any) {
      setTradingStatusMessage({
        type: 'error',
        message: error.message || 'Failed to process trading action'
      });
    } finally {
      setIsTradingActionLoading(false);
      // Clear status message after 5 seconds
      setTimeout(() => setTradingStatusMessage(null), 5000);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatName = (str: string) => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_\-\.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Dashboard</h1>
      </div>

      {/* Welcome Message */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold">
          Welcome back,{' '}
          {user?.displayName
            ? formatName(user.displayName)
            : user?.email
            ? formatName(user.email.split('@')[0])
            : 'User'}
        </h2>
        <p className="text-sm mt-1">{welcomeMessage}</p>
      </motion.div>

      {/* Trading Status Message */}
      {tradingStatusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg ${
            tradingStatusMessage.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : tradingStatusMessage.type === 'error'
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-blue-100 text-blue-700 border border-blue-300'
          }`}
        >
          {tradingStatusMessage.message}
        </motion.div>
      )}

      {/* Balance Cards - Three Cards Only */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Deposit/Total Balance Card */}
        <div className="balance-card relative p-5 rounded-lg shadow-md bg-white border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Wallet className="text-blue-600" size={20} />
              <h2 className="text-sm font-medium text-gray-600">Deposit/Total Balance</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenTransferModal}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <ArrowLeftRight size={12} />
                <span>Transfer</span>
              </button>
              <button 
                onClick={toggleBalanceVisibility}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
              >
                {isBalanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {isBalanceVisible ? formatCurrency(dashboardData.depositBalance) : "••••••••"}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">Main wallet balance</p>
        </div>

        {/* Trading Balance Card with Trade Button */}
        <div className="balance-card relative p-5 rounded-lg shadow-md bg-white border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Coins className="text-green-600" size={20} />
              <h2 className="text-sm font-medium text-gray-600">Trading Balance</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleTradeAction}
                disabled={isTradingActionLoading || dashboardData.tradingBalance === 0 || dashboardData.tradingBalance < 500}
                className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                  dashboardData.isTradingActive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : dashboardData.tradingBalance === 0
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } ${
                  (isTradingActionLoading || dashboardData.tradingBalance === 0 || dashboardData.tradingBalance < 500) && 'opacity-50 cursor-not-allowed'
                }`}
              >
                {isTradingActionLoading ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : dashboardData.isTradingActive ? (
                  <>
                    <Pause size={12} />
                    <span>Stop</span>
                  </>
                ) : dashboardData.tradingBalance === 0 ? (
                  <>
                    <span>Deposit Required</span>
                  </>
                ) : (
                  <>
                    <Play size={12} />
                    <span>Trade</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {isBalanceVisible ? formatCurrency(dashboardData.tradingBalance) : "••••••••"}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">Active trading funds</p>
            {dashboardData.isTradingActive && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-green-600">
                  {dashboardData.weeklyProfitRate}% weekly
                </span>
              </div>
            )}
            {!dashboardData.isTradingActive && dashboardData.tradingBalance > 0 && dashboardData.tradingBalance < 500 && (
              <span className="text-xs text-amber-600">Min $500 to trade</span>
            )}
            {dashboardData.tradingBalance === 0 && (
              <span className="text-xs text-gray-400">No funds to trade</span>
            )}
          </div>
        </div>

        {/* Trading Profit Card */}
        <div className="balance-card relative p-5 rounded-lg shadow-md bg-white border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-purple-600" size={20} />
              <h2 className="text-sm font-medium text-gray-600">Trading Profit</h2>
            </div>
            <div className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              Earnings
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {isBalanceVisible ? formatCurrency(dashboardData.tradingProfit) : "••••••••"}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">Accumulated trading profits</p>
          {dashboardData.isTradingActive && dashboardData.tradingBalance > 0 && (
            <div className="mt-2 p-1.5 bg-green-50 rounded border border-green-200">
              <p className="text-[10px] text-green-700">
                Trading active · {dashboardData.weeklyProfitRate}% weekly · ${(dashboardData.tradingBalance * dashboardData.weeklyProfitRate / 100).toFixed(2)}/week
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Portfolio Growth"
          value={`${dashboardData.portfolioGrowth >= 0 ? '+' : ''}${dashboardData.portfolioGrowth.toFixed(2)}%`}
          subtitle="Based on Trading Profit"
          trend={dashboardData.portfolioGrowth >= 0 ? "up" : "down"}
          icon={TrendingUp}
        />
        <StatCard 
          title="Active Wallets"
          value={dashboardData.activeWallets.toString()}
          subtitle="Active crypto wallets"
          icon={Wallet}
        />
        <StatCard 
          title="Top Performer"
          value={dashboardData.topPerformer || "None"}
          subtitle={dashboardData.topPerformer !== "None" ? `${dashboardData.topPerformerChange >= 0 ? '+' : ''}${dashboardData.topPerformerChange?.toFixed(2) || 0}%` : "No data"}
          trend={dashboardData.topPerformerChange && dashboardData.topPerformerChange >= 0 ? "up" : "down"}
          icon={() => {
            if (dashboardData.topPerformerImage && dashboardData.topPerformer !== "None") {
              return (
                <img 
                  src={dashboardData.topPerformerImage} 
                  alt={dashboardData.topPerformer}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              );
            }
            return <Bitcoin size={20} />;
          }}
        />
      </section>
      
      {/* Market Trends */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="dashboard-card"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Market Trends</h2>
          <button 
            onClick={() => setIsAssetsModalOpen(true)}
            className="text-sm text-blue-600 font-medium flex items-center hover:underline transition-colors"
          >
            View all <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="divide-y">
            {marketTrends.slice(0, 3).map((coin) => (
              <div key={coin.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  {coin.image ? (
                    <img 
                      src={coin.image} 
                      alt={coin.name}
                      className="w-10 h-10 rounded-full mr-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 mr-3">
                      {coin.symbol.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{coin.name}</h3>
                    <p className="text-sm text-gray-500">{coin.symbol}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">${coin.current_price?.toLocaleString() || '0.00'}</p>
                  <PercentageChange value={coin.price_change_percentage_24h || 0} />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* AI Trading Suggestions Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="dashboard-card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI Trading Suggestions</h2>
              <p className="text-sm text-gray-500">Smart recommendations powered by advanced algorithms</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
            <Zap size={16} className="text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Live Analysis</span>
          </div>
        </div>

        {isLoadingAi ? (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-gray-500">Analyzing market opportunities...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiSuggestions.slice(0, 6).map((crypto, index) => (
              <AITradingCard 
                key={crypto.id}
                crypto={crypto}
                index={index}
                onStartTrading={handleStartTrading}
              />
            ))}
          </div>
        )}
      </motion.section>

      {/* Crypto Assets Modal */}
      <CryptoAssetsModal 
        isOpen={isAssetsModalOpen} 
        onClose={() => setIsAssetsModalOpen(false)} 
      />

      {/* Transfer Funds Modal */}
      {isTransferModalOpen && user && (
        <TransferFundsModal
          isOpen={isTransferModalOpen}
          onClose={handleCloseTransferModal}
          onSuccess={handleTransferSuccess}
          userId={user.uid}
          depositBalance={dashboardData.depositBalance}
          tradingBalance={dashboardData.tradingBalance}
        />
      )}

      {/* AI Trading Confirmation Modal */}
      {isAiModalOpen && selectedCrypto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Brain className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-semibold">AI Trading Confirmation</h3>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full mb-4">
                  <Target size={16} />
                  <span className="font-medium">{selectedCrypto.recommendation}</span>
                </div>
                
                <div className="flex items-center justify-center space-x-3 mb-4">
                  {selectedCrypto.image ? (
                    <img 
                      src={selectedCrypto.image} 
                      alt={selectedCrypto.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {selectedCrypto.symbol.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedCrypto.name}</h4>
                    <p className="text-2xl font-bold text-blue-600">{selectedCrypto.symbol}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mt-2 text-sm">{selectedCrypto.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-700">AI Confidence</p>
                  <p className="text-lg font-bold">{selectedCrypto.aiConfidence}%</p>
                </div>
                <div className={cn(
                  "text-center p-3 rounded-lg",
                  selectedCrypto.riskLevel === 'Low' ? "bg-green-50 text-green-700" :
                  selectedCrypto.riskLevel === 'Medium' ? "bg-yellow-50 text-yellow-700" :
                  "bg-red-50 text-red-700"
                )}>
                  <p className="font-semibold">Risk Level</p>
                  <p className="text-lg font-bold">{selectedCrypto.riskLevel}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="font-semibold text-green-600 flex items-center space-x-1">
                    <TrendingUp size={16} />
                    <span>Key Benefits</span>
                  </h5>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    {selectedCrypto.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-red-600 flex items-center space-x-1">
                    <AlertTriangle size={16} />
                    <span>Potential Risks</span>
                  </h5>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    {selectedCrypto.risks.map((risk, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-sm text-yellow-800">
                    <strong>Disclaimer:</strong> AI suggestions are based on market analysis and historical data. 
                    Cryptocurrency investments are volatile and risky. Always do your own research and consider 
                    consulting with a financial advisor.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t bg-gray-50">
              <button 
                onClick={handleCloseModal}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button 
                onClick={handleConfirmTrading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Check size={18} />
                <span>Confirm & Trade</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

interface AITradingCardProps {
  crypto: AITradingSuggestion;
  index: number;
  onStartTrading: (crypto: AITradingSuggestion) => void;
}

const AITradingCard: React.FC<AITradingCardProps> = ({ crypto, index, onStartTrading }) => {
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Strong Buy': return 'from-green-500 to-emerald-600';
      case 'Buy': return 'from-blue-500 to-cyan-600';
      case 'Hold': return 'from-yellow-500 to-amber-600';
      case 'Sell': return 'from-red-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      <div className={cn(
        "bg-gradient-to-r p-4 text-white",
        getRecommendationColor(crypto.recommendation)
      )}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            {crypto.image ? (
              <img 
                src={crypto.image} 
                alt={crypto.name}
                className="w-10 h-10 rounded-full border-2 border-white border-opacity-20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white text-lg font-bold">
                {crypto.symbol.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg">{crypto.symbol}</h3>
              <p className="text-sm opacity-90">{crypto.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 bg-black bg-opacity-20 px-2 py-1 rounded-full">
              <Star size={12} className="fill-current" />
              <span className="text-xs font-semibold">{crypto.recommendation}</span>
            </div>
            <p className="text-xl font-bold mt-1">${crypto.price?.toLocaleString() || '0.00'}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-gray-600">24h Change</p>
            <PercentageChange value={crypto.change24h || 0} />
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-gray-600">AI Confidence</p>
            <p className="font-semibold text-blue-600">{crypto.aiConfidence || 0}%</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Risk Level:</span>
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            getRiskColor(crypto.riskLevel || 'Medium')
          )}>
            {crypto.riskLevel || 'Medium'}
          </span>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2">
          {crypto.description || 'AI analysis suggests this asset shows potential for growth.'}
        </p>

        <button
          onClick={() => onStartTrading(crypto)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform group-hover:scale-105 flex items-center justify-center space-x-2"
        >
          <Zap size={16} />
          <span>Start Trading</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down';
  icon: React.ComponentType<any>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend, icon: Icon }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="dashboard-card"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-600 font-medium">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={cn(
          "p-3 rounded-full",
          trend === 'up' ? "bg-green-50 text-green-600" : 
          trend === 'down' ? "bg-red-50 text-red-500" : 
          "bg-gray-50 text-gray-600"
        )}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
};

interface PercentageChangeProps {
  value: number;
  suffix?: string;
}

const PercentageChange: React.FC<PercentageChangeProps> = ({ value, suffix }) => {
  const isPositive = value >= 0;
  return (
    <div className={cn(
      "flex items-center text-sm font-medium",
      isPositive ? "text-green-600" : "text-red-500"
    )}>
      {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
      <span>{isPositive ? '+' : ''}{value.toFixed(2)}%{suffix && ` (${suffix})`}</span>
    </div>
  );
};

export default Dashboard;