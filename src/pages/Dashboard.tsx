import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, TrendingUp, TrendingDown, Activity, 
  ArrowRight, DollarSign, Bitcoin, Wallet 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const marketTrends = [
  { name: 'Bitcoin', symbol: 'BTC', price: 83893.82, change: 2.41, isUp: true },
  { name: 'Ethereum', symbol: 'ETH', price: 1973.25, change: -0.87, isUp: false },
  { name: 'Solana', symbol: 'SOL', price: 142.15, change: 5.23, isUp: true },
];

const Dashboard: React.FC = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const navigate = useNavigate();

  // Toggle function for balance visibility
  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prev) => !prev);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Dashboard</h1>
      
      {/* Balance Card */}
      <section className="balance-card relative p-6 rounded-lg shadow-md bg-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-crypto-blue opacity-5 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-crypto-indigo opacity-5 rounded-full -ml-10 -mb-10" />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-600">Total Balance</h2>
        </div>

        <div className="flex items-center space-x-2">
          <h3 className="text-4xl font-bold text-gray-900">
            {isBalanceVisible ? "$42,582.14" : "••••••••"}
          </h3>
          <button 
            onClick={toggleBalanceVisibility}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
          >
            {isBalanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="mt-2 text-green-600 flex items-center">
          <TrendingUp size={16} className="mr-1" />
          <span className="text-sm font-medium">+5.23% ($2,124.35 today)</span>
        </div>

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
      </section>
      
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
          value="Bitcoin"
          subtitle="+5.23% today"
          trend="up"
          icon={Bitcoin}
        />
      </section>
      
      {/* Market Trends */}
      <section className="dashboard-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Market Trends</h2>
          <button className="text-sm text-crypto-blue font-medium flex items-center hover:underline">
            View all <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        
        <div className="divide-y">
          {marketTrends.map((coin) => (
            <div key={coin.symbol} className="py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 mr-3">
                  {coin.symbol.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium">{coin.name}</h3>
                  <p className="text-sm text-gray-500">{coin.symbol}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium">${coin.price.toLocaleString()}</p>
                <p className={cn(
                  "text-sm flex items-center justify-end",
                  coin.isUp ? "text-green-600" : "text-red-500"
                )}>
                  {coin.isUp ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                  {coin.change}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
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
    <div className="dashboard-card">
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
    </div>
  );
};

export default Dashboard;
