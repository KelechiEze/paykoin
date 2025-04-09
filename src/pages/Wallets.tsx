
import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, ExternalLink, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Sample cryptocurrency data with transactions
const cryptoCurrencies = [
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    balance: 0.78, 
    usdValue: 18000.24,
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    color: '#F7931A',
    change: 3.15,
    isUp: true,
    transactions: [
      { id: 'tx1', type: 'withdrawal', amount: 0.1, date: '2025-03-22', status: 'completed' },
      { id: 'tx2', type: 'withdrawal', amount: 0.1, date: '2025-03-21', status: 'completed' },
      { id: 'tx3', type: 'withdrawal', amount: 0.1, date: '2025-03-20', status: 'completed' },
      { id: 'tx4', type: 'withdrawal', amount: 0.1, date: '2025-03-19', status: 'completed' },
      { id: 'tx5', type: 'withdrawal', amount: 0.1, date: '2025-03-19', status: 'completed' },
      { id: 'tx6', type: 'withdrawal', amount: 0.1, date: '2025-03-18', status: 'completed' },
      { id: 'tx7', type: 'deposit', amount: 0.1, date: '2025-03-18', status: 'completed' },
      { id: 'tx8', type: 'withdrawal', amount: 0.05, date: '2025-03-15', status: 'completed' },
      { id: 'tx9', type: 'deposit', amount: 0.2, date: '2025-03-12', status: 'pending' },
      { id: 'tx10', type: 'withdrawal', amount: 0.1, date: '2025-03-10', status: 'completed' },
    ]
  },
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    balance: 3.25, 
    usdValue: 9789.00,
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    color: '#627EEA',
    change: -1.24,
    isUp: false,
    transactions: [
      { id: 'tx5', type: 'deposit', amount: 1.5, date: '2025-03-08', status: 'completed' },
      { id: 'tx6', type: 'withdrawal', amount: 0.75, date: '2025-03-11', status: 'completed' },
      { id: 'tx7', type: 'deposit', amount: 2.0, date: '2025-03-14', status: 'pending' },
      { id: 'tx8', type: 'withdrawal', amount: 1.0, date: '2025-03-15', status: 'completed' },
    ]
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    symbol: 'SOL', 
    balance: 28.5, 
    usdValue: 4051.35,
    address: 'CXSq1UktW8BnUqxezSZ9G6QL8uQyYKN9BYR3qNfUjJcS',
    color: '#14F195',
    change: 5.67,
    isUp: true,
    transactions: [
      { id: 'tx9', type: 'deposit', amount: 10, date: '2025-03-09', status: 'completed' },
      { id: 'tx10', type: 'withdrawal', amount: 5, date: '2025-03-12', status: 'completed' },
      { id: 'tx11', type: 'deposit', amount: 15, date: '2025-03-14', status: 'pending' },
      { id: 'tx12', type: 'withdrawal', amount: 8, date: '2025-03-16', status: 'completed' },
    ]
  },
  { 
    id: 'cardano', 
    name: 'Cardano', 
    symbol: 'ADA', 
    balance: 1250.75, 
    usdValue: 1125.68,
    address: 'addr1qx54l9frjhncsjy2qpme4rqj7kj24j8y5jf3rnrliuvxefuej7tl2jzuzkfjr69xn04d3j5vs6pzq6n5gpr3jmvl5hmsz3wcdt',
    color: '#0033AD',
    change: 0.32,
    isUp: true,
    transactions: [
      { id: 'tx13', type: 'deposit', amount: 500, date: '2025-03-07', status: 'completed' },
      { id: 'tx14', type: 'withdrawal', amount: 200, date: '2025-03-10', status: 'completed' },
      { id: 'tx15', type: 'deposit', amount: 300, date: '2025-03-13', status: 'pending' },
      { id: 'tx16', type: 'withdrawal', amount: 100, date: '2025-03-14', status: 'completed' },
    ]
  },
];

const Wallets: React.FC = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // If a cryptocurrency is selected, show its details
  if (selectedCrypto) {
    const crypto = cryptoCurrencies.find(c => c.id === selectedCrypto);
    if (!crypto) return null;
    
    return <CryptoDetail crypto={crypto} onBack={() => setSelectedCrypto(null)} />;
  }
  
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Wallets</h1>
      
      {/* Total Balance Summary */}
      <div className="dashboard-card">
        <h2 className="text-gray-600 font-medium">Total Balance</h2>
        <p className="text-3xl font-bold mt-2">$32,794.92</p>
        <p className="text-sm text-gray-500 mt-1">4 wallets</p>
      </div>
      
      {/* Wallets List */}
      <div className="dashboard-card">
        <h2 className="text-xl font-semibold mb-6">Your Crypto Assets</h2>
        
        <div className="divide-y">
          {cryptoCurrencies.map((crypto) => (
            <CryptoRow 
              key={crypto.id} 
              crypto={crypto} 
              onClick={() => setSelectedCrypto(crypto.id)} 
            />
          ))}
        </div>
        
        <button className="w-full mt-6 py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
          + Add New Wallet
        </button>
      </div>
    </div>
  );
};

interface CryptoRowProps {
  crypto: any;
  onClick: () => void;
}

const CryptoRow: React.FC<CryptoRowProps> = ({ crypto, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full crypto-row"
    >
      <div className="flex items-center">
        <div 
          className="w-10 h-10 rounded-full mr-3 flex items-center justify-center"
          style={{ backgroundColor: `${crypto.color}20` }}
        >
          <span style={{ color: crypto.color }}>{crypto.symbol.charAt(0)}</span>
        </div>
        <div className="text-left">
          <h3 className="font-medium">{crypto.name}</h3>
          <p className="text-sm text-gray-500">{crypto.balance} {crypto.symbol}</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-medium">${crypto.usdValue.toLocaleString()}</p>
        <p className={cn(
          "text-sm",
          crypto.isUp ? "text-green-600" : "text-red-500"
        )}>
          {crypto.isUp ? "+" : ""}{crypto.change}%
        </p>
      </div>
    </button>
  );
};

interface CryptoDetailProps {
  crypto: any;
  onBack: () => void;
}

const CryptoDetail: React.FC<CryptoDetailProps> = ({ crypto, onBack }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(crypto.address)
      .then(() => {
        setIsCopied(true);
        toast({
          description: "Wallet address copied to clipboard",
        });
        
        // Reset copy status after 2 seconds
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
  
  return (
    <div className="animate-fade-in">
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
            <span style={{ color: crypto.color }} className="text-lg font-bold">{crypto.symbol.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{crypto.name}</h2>
            <p className="text-gray-500">{crypto.symbol}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-gray-500 mb-1">Balance</p>
            <h3 className="text-3xl font-bold">{crypto.balance} {crypto.symbol}</h3>
            <p className="mt-1 text-xl">${crypto.usdValue.toLocaleString()}</p>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className={cn(
              "py-2 px-4 rounded-lg text-center",
              crypto.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            )}>
              <p className="font-medium">
                {crypto.isUp ? "+" : ""}{crypto.change}% 
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
            <button className="flex items-center py-2.5 px-4 rounded-lg bg-crypto-blue text-white font-medium hover:bg-crypto-blue/90 transition-colors">
              <DollarSign size={16} className="mr-2" />
              <span>Transfer</span>
            </button>
            <button className="flex items-center py-2.5 px-4 rounded-lg border border-gray-200 font-medium hover:bg-gray-50 transition-colors">
              <ExternalLink size={16} className="mr-2" />
              <span>View on Explorer</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Transaction History Section */}
<div className="dashboard-card">
  <h3 className="text-xl font-semibold mb-6">Transaction History</h3>
  {crypto.transactions.length > 0 ? (
    <div className="space-y-4">
      {crypto.transactions.map((tx) => (
        <div key={tx.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
          <div>
            <p className="text-sm font-medium capitalize">{tx.type}</p>
            <p className="text-xs text-gray-500">{tx.date}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">
              {tx.type === "deposit" ? "+" : "-"}{tx.amount} {crypto.symbol}
            </p>
            <p className={`text-xs ${tx.status === "completed" ? "text-green-500" : "text-orange-500"}`}>
              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-10 text-gray-500">
      <p>No transactions found for this wallet</p>
      <button className="mt-4 text-crypto-blue font-medium hover:underline">
        Make your first transaction
      </button>
    </div>
  )}
</div>

    </div>
  );
};

export default Wallets;
