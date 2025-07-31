import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, TrendingUp, TrendingDown, Activity, 
  ArrowRight, DollarSign, Bitcoin, Wallet 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import CryptoChart from '@/components/layout/CryptoChart';
import CryptoAssetsModal from '@/components/layout/CryptoAssetsModal';

interface MarketTrend {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image?: string;
}

const Dashboard: React.FC = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get user data from localStorage
  const userData = localStorage.getItem('userData');
  const userName = userData ? JSON.parse(userData).name : 'User';

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
        // Fallback data in case API fails
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
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchMarketTrends, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prev) => !prev);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Dashboard</h1>

      {/* Welcome Message */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-gradient-to-r from-crypto-indigo to-crypto-blue text-white p-4 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold">Welcome back, {userName}</h2>
        <p className="text-sm mt-1">We're glad to have you here. Let's check your crypto performance today.</p>
      </motion.div>

      {/* Balance Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="balance-card relative p-6 rounded-lg shadow-md bg-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-crypto-blue opacity-5 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-crypto-indigo opacity-5 rounded-full -ml-10 -mb-10" />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-600">Total Balance</h2>
        </div>

        <div className="flex items-center space-x-2">
          <h3 className="text-4xl font-bold text-gray-900">
            {isBalanceVisible ? "$0.00" : "••••••••"}
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
        <PercentageChange value={-0.00} suffix="$0.00 today" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button 
            className="flex items-center justify-center py-3 px-4 rounded-xl bg-crypto-blue text-white font-medium hover:bg-crypto-blue/90 transition-colors"
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

          <button className="flex items-center justify-center py-3 px-4 rounded-xl bg-white text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            <TrendingUp size={18} className="mr-2" />
            <span>Trade</span>
          </button>
        </div>
      </motion.section>
      
      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Portfolio Growth"
          value="+18.4%"
          subtitle="This month"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard 
          title="Active Wallets"
          value="4"
          subtitle="Last updated today"
          icon={Wallet}
        />
        <StatCard 
          title="Top Performer"
          value={marketTrends[0]?.name || "Loading..."}
          subtitle={marketTrends[0] ? `${marketTrends[0].price_change_percentage_24h >= 0 ? '+' : ''}${marketTrends[0].price_change_percentage_24h.toFixed(2)}% today` : "Loading..."}
          trend={marketTrends[0]?.price_change_percentage_24h >= 0 ? "up" : "down"}
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
            className="text-sm text-crypto-blue font-medium flex items-center hover:underline transition-colors"
          >
            View all <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crypto-blue"></div>
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
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                        target.className = 'w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 mr-3';
                        target.textContent = coin.symbol.charAt(0);
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
                  <p className="font-medium">${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
                  <PercentageChange value={coin.price_change_percentage_24h} />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Crypto Chart */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="dashboard-card"
      >
        <CryptoChart />
      </motion.section>

      {/* Crypto Assets Modal */}
      <CryptoAssetsModal 
        isOpen={isAssetsModalOpen} 
        onClose={() => setIsAssetsModalOpen(false)} 
      />
    </div>
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