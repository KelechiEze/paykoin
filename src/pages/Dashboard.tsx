import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, TrendingUp, TrendingDown, Activity, 
  ArrowRight, DollarSign, Bitcoin, Wallet, MessageSquare,
  Send, X, Bell, Search, Loader, Brain, AlertTriangle,
  Star, Zap, Target, Check, ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
// import CryptoChart from '@/components/layout/CryptoChart';
import CryptoAssetsModal from '@/components/layout/CryptoAssetsModal';
import { auth, db } from '@/firebase';
import { 
  doc, getDoc, onSnapshot, collection, 
  addDoc, query, where, orderBy, serverTimestamp,
  updateDoc, arrayUnion, arrayRemove, getDocs
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

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
  portfolioGrowth: number;
  activeWallets: number;
  topPerformer: string;
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

// Commenting out messaging interfaces for now
/*
interface Message {
  id: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  receiverId: string;
  receiverEmail: string;
  content: string;
  timestamp: any;
  read: boolean;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
}
*/

const Dashboard: React.FC = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  // const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalBalance: 0,
    portfolioGrowth: 0,
    activeWallets: 0,
    topPerformer: ''
  });
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AITradingSuggestion[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<AITradingSuggestion | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
  // Commenting out messaging states for now
  /*
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  */
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

  // Fetch dashboard data from Firestore
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid, 'dashboard', 'stats'),
      (doc) => {
        if (doc.exists()) {
          setDashboardData(doc.data() as DashboardData);
        } else {
          console.log('No dashboard data found');
        }
      },
      (err) => {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch market trends data
  useEffect(() => {
    const fetchMarketTrends = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1&sparkline=false&price_change_percentage=24h'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }
        
        const data = await response.json();
        setMarketTrends(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching market trends:', err);
        setError('Failed to load market trends');
        // Fallback data
        setMarketTrends([
          { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', current_price: 0, price_change_percentage_24h: 0 },
          { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', current_price: 0, price_change_percentage_24h: 0 },
          { id: 'solana', name: 'Solana', symbol: 'SOL', current_price: 0, price_change_percentage_24h: 0 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketTrends();
    const intervalId = setInterval(fetchMarketTrends, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Fetch AI Trading Suggestions with Images
  useEffect(() => {
    const fetchAiSuggestions = async () => {
      try {
        setIsLoadingAi(true);
        // Using CoinGecko API to get crypto data with images
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=false&price_change_percentage=24h'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch AI suggestions');
        }
        
        const data = await response.json();
        
        // Transform data with AI analysis and recommendations
        const suggestions: AITradingSuggestion[] = data.map((coin: any, index: number) => {
          // AI analysis simulation based on market data
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
            description: `AI analysis suggests ${coin.symbol.toUpperCase()} shows strong momentum with ${coin.price_change_percentage_24h > 0 ? 'positive' : 'consolidating'} trends. Our algorithm identifies potential growth opportunities based on market sentiment and technical indicators.`,
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
      } catch (err) {
        console.error('Error fetching AI suggestions:', err);
        // Fallback demo data with images
        setAiSuggestions(getDemoAiSuggestions());
      } finally {
        setIsLoadingAi(false);
      }
    };

    fetchAiSuggestions();
  }, []);

  // Demo data for AI suggestions with images
  const getDemoAiSuggestions = (): AITradingSuggestion[] => {
    return [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: '₿',
        price: 43250.75,
        change24h: 2.34,
        marketCap: 845000000000,
        volume24h: 28500000000,
        aiConfidence: 88,
        riskLevel: 'Medium',
        recommendation: 'Strong Buy',
        image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
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
        symbol: 'Ξ',
        price: 2580.45,
        change24h: 1.87,
        marketCap: 310000000000,
        volume24h: 15800000000,
        aiConfidence: 82,
        riskLevel: 'Medium',
        recommendation: 'Buy',
        image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
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
        symbol: '◎',
        price: 102.30,
        change24h: 5.67,
        marketCap: 42000000000,
        volume24h: 3800000000,
        aiConfidence: 76,
        riskLevel: 'High',
        recommendation: 'Buy',
        image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
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
        symbol: '₳',
        price: 0.52,
        change24h: -0.45,
        marketCap: 18500000000,
        volume24h: 650000000,
        aiConfidence: 71,
        riskLevel: 'Medium',
        recommendation: 'Hold',
        image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
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
        symbol: '●',
        price: 7.25,
        change24h: 3.12,
        marketCap: 9200000000,
        volume24h: 480000000,
        aiConfidence: 79,
        riskLevel: 'Medium',
        recommendation: 'Buy',
        image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
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
        symbol: 'Ł',
        price: 14.80,
        change24h: 1.25,
        marketCap: 8200000000,
        volume24h: 520000000,
        aiConfidence: 85,
        riskLevel: 'Low',
        recommendation: 'Strong Buy',
        image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
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
  };

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

  /*
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  */

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Messages Icon */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Dashboard</h1>
        <div className="relative">
          <button 
            onClick={() => setIsMessagesOpen(true)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors relative"
          >
            <MessageSquare size={24} />
            {/* Commenting out unread count for now */}
            {/* {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )} */}
          </button>
        </div>
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

      {/* Balance Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="balance-card relative p-6 rounded-lg shadow-md bg-white"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-600">Total Balance</h2>
        </div>

        <div className="flex items-center space-x-2">
          <h3 className="text-4xl font-bold text-gray-900">
            {isBalanceVisible ? formatCurrency(dashboardData.totalBalance) : "••••••••"}
          </h3>
          <button 
            onClick={toggleBalanceVisibility}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
          >
            {isBalanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Dynamic Percentage Change */}
        <div className="mt-2">
          <PercentageChange 
            value={dashboardData.portfolioGrowth} 
            suffix={`${formatCurrency(dashboardData.totalBalance * (dashboardData.portfolioGrowth / 100))} today`} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button 
            className="flex items-center justify-center py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/wallets')}
          >
            <DollarSign size={18} className="mr-2" />
            <span>Deposit</span>
          </button>

          <button 
            className="flex items-center justify-center py-3 px-4 rounded-xl bg-white text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/wallets')}
          >
            <Activity size={18} className="mr-2" />
            <span>Transfer</span>
          </button>

          {/*<button className="flex items-center justify-center py-3 px-4 rounded-xl bg-white text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            <TrendingUp size={18} className="mr-2" />
            <span>Trade</span>
          </button>*/}
        </div>
      </motion.section>

      {/* AI Trading Suggestions Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
            {aiSuggestions.map((crypto, index) => (
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
      
      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Portfolio Growth"
          value={`${dashboardData.portfolioGrowth >= 0 ? '+' : ''}${dashboardData.portfolioGrowth.toFixed(2)}%`}
          subtitle="Latest Updated"
          trend={dashboardData.portfolioGrowth >= 0 ? "up" : "down"}
          icon={TrendingUp}
        />
        <StatCard 
          title="Active Wallets"
          value={dashboardData.activeWallets.toString()}
          subtitle="Last updated today"
          icon={Wallet}
        />
        <StatCard 
          title="Top Performer"
          value={dashboardData.topPerformer || "None"}
          subtitle={dashboardData.topPerformer ? `${dashboardData.portfolioGrowth >= 0 ? '+' : ''}${dashboardData.portfolioGrowth.toFixed(2)}%` : "No data"}
          trend={dashboardData.portfolioGrowth >= 0 ? "up" : "down"}
          icon={Bitcoin}
        />
      </section>
      
      {/* Market Trends */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <div className="divide-y">
            {marketTrends.map((coin) => (
              <div key={coin.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  {coin.image ? (
                    <img 
                      src={coin.image} 
                      alt={coin.name}
                      className="w-10 h-10 rounded-full mr-3"
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
                  <p className="font-medium">${coin.current_price.toLocaleString()}</p>
                  <PercentageChange value={coin.price_change_percentage_24h} />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Crypto Chart - Commented Out */}
      {/* <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="dashboard-card"
      >
        <CryptoChart />
      </motion.section> */}

      {/* Crypto Assets Modal */}
      <CryptoAssetsModal 
        isOpen={isAssetsModalOpen} 
        onClose={() => setIsAssetsModalOpen(false)} 
      />

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

      {/* Messages Modal - Coming Soon */}
      {isMessagesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Messages</h3>
              <button 
                onClick={() => setIsMessagesOpen(false)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 text-center">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <h4 className="text-xl font-semibold mb-2">Coming Soon</h4>
              <p className="text-gray-500">The messaging feature is currently under development and will be available in a future update.</p>
            </div>
          </div>
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
      {/* Header with gradient */}
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
            <p className="text-xl font-bold mt-1">{formatCurrency(crypto.price)}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-gray-600">24h Change</p>
            <PercentageChange value={crypto.change24h} />
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-gray-600">AI Confidence</p>
            <p className="font-semibold text-blue-600">{crypto.aiConfidence}%</p>
          </div>
        </div>

        {/* Risk level */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Risk Level:</span>
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            getRiskColor(crypto.riskLevel)
          )}>
            {crypto.riskLevel}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2">
          {crypto.description}
        </p>

        {/* Action button */}
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

// Helper function to format currency (duplicated for component use)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export default Dashboard;