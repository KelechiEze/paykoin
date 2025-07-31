import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, ExternalLink, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Types for our cryptocurrency data
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
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  status: 'pending' | 'completed';
}

interface CGCoin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

// Default cryptocurrencies with transactions
const defaultCryptos = [
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    symbol: 'btc', 
    balance: 0.00000, // Updated balance to reflect transactions
    usdValue: 0.00,
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    color: '#F7931A',
    change: 3.15,
    isUp: true,
    transactions: [
      //{ id: 'tx1', type: 'deposit', amount: 0.034, date: '2025-07-29', status: 'pending' },
      //{ id: 'tx2', type: 'withdrawal', amount: 0.1, date: '2025-03-21', status: 'completed' },
     // { id: 'tx3', type: 'withdrawal', amount: 0.1, date: '2025-03-20', status: 'completed' },
      //{ id: 'tx4', type: 'withdrawal', amount: 0.1, date: '2025-03-19', status: 'completed' },
      //{ id: 'tx5', type: 'withdrawal', amount: 0.1, date: '2025-03-19', status: 'completed' },
      //{ id: 'tx6', type: 'withdrawal', amount: 0.1, date: '2025-03-18', status: 'completed' },
      //{ id: 'tx7', type: 'deposit', amount: 0.1, date: '2025-03-18', status: 'completed' },
      //{ id: 'tx8', type: 'withdrawal', amount: 0.05, date: '2025-03-15', status: 'completed' },
      //{ id: 'tx9', type: 'deposit', amount: 0.2, date: '2025-03-12', status: 'pending' },
      //{ id: 'tx10', type: 'withdrawal', amount: 0.1, date: '2025-03-10', status: 'completed' },
    ],
    cgId: 'bitcoin'
  },
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    symbol: 'eth', 
    balance: 0.00000, // Updated balance to reflect transactions
    usdValue: 0.00,
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    color: '#627EEA',
    change: -1.24,
    isUp: false,
    transactions: [
      //{ id: 'tx5', type: 'deposit', amount: 1.5, date: '2025-03-08', status: 'completed' },
      //{ id: 'tx6', type: 'withdrawal', amount: 0.75, date: '2025-03-11', status: 'completed' },
      //{ id: 'tx7', type: 'deposit', amount: 2.0, date: '2025-03-14', status: 'pending' },
      //{ id: 'tx8', type: 'withdrawal', amount: 1.0, date: '2025-03-15', status: 'completed' },
    ],
    cgId: 'ethereum'
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    symbol: 'sol', 
    balance: 0.0000, // Updated balance to reflect transactions
    usdValue: 0.00,
    address: 'CXSq1UktW8BnUqxezSZ9G6QL8uQyYKN9BYR3qNfUjJcS',
    color: '#14F195',
    change: 5.67,
    isUp: true,
    transactions: [
      //{ id: 'tx9', type: 'deposit', amount: 10, date: '2025-03-09', status: 'completed' },
      //{ id: 'tx10', type: 'withdrawal', amount: 5, date: '2025-03-12', status: 'completed' },
      //{ id: 'tx11', type: 'deposit', amount: 15, date: '2025-03-14', status: 'pending' },
      //{ id: 'tx12', type: 'withdrawal', amount: 8, date: '2025-03-16', status: 'completed' },
    ],
    cgId: 'solana'
  },
  { 
    id: 'cardano', 
    name: 'Cardano', 
    symbol: 'ada', 
    balance: 0.0000, // Updated balance to reflect transactions
    usdValue: 0.00,
    address: 'addr1qx54l9frjhncsjy2qpme4rqj7kj24j8y5jf3rnrliuvxefuej7tl2jzuzkfjr69xn04d3j5vs6pzq6n5gpr3jmvl5hmsz3wcdt',
    color: '#0033AD',
    change: 0.32,
    isUp: true,
    transactions: [
      //{ id: 'tx13', type: 'deposit', amount: 500, date: '2025-03-07', status: 'completed' },
      //{ id: 'tx14', type: 'withdrawal', amount: 200, date: '2025-03-10', status: 'completed' },
      //{ id: 'tx15', type: 'deposit', amount: 300, date: '2025-03-13', status: 'pending' },
      //{ id: 'tx16', type: 'withdrawal', amount: 100, date: '2025-03-14', status: 'completed' },
    ],
    cgId: 'cardano'
  },
];

const TransferModal = ({ crypto, onClose }: { crypto: Cryptocurrency, onClose: () => void }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

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
    // Generate a random address (in a real app, this would be generated properly)
    const randomAddress = `0x${Math.random().toString(36).substring(2, 22)}${Math.random().toString(36).substring(2, 22)}`;
    
    const newCrypto: Cryptocurrency = {
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      balance: 0,
      usdValue: 0,
      address: randomAddress,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
      change: crypto.price_change_percentage_24h || 0,
      isUp: (crypto.price_change_percentage_24h || 0) >= 0,
      transactions: [],
      cgId: crypto.id
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
                    <div>
                      <p className="font-medium">{crypto.name}</p>
                      <p className="text-sm text-gray-500">{crypto.symbol}</p>
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

const Wallets: React.FC = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>(defaultCryptos);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch crypto data from CoinGecko
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        // Get all CoinGecko IDs from our cryptocurrencies
        const cgIds = cryptos.map(c => c.cgId).filter(Boolean).join(',');
        
        if (!cgIds) return;
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cgIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch data from CoinGecko');
        }
        
        const data = await response.json();
        
        // Update our cryptocurrencies with fresh data
        setCryptos(prev => prev.map(crypto => {
          if (!crypto.cgId) return crypto;
          
          const cgData = data.find((coin: CGCoin) => coin.id === crypto.cgId);
          if (!cgData) return crypto;
          
          return {
            ...crypto,
            usdValue: crypto.balance * cgData.current_price,
            change: cgData.price_change_percentage_24h || 0,
            isUp: (cgData.price_change_percentage_24h || 0) >= 0
          };
        }));
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        toast({
          variant: "destructive",
          title: "API Rate Limit Reached",
          description: "Displaying cached data. Prices may not be up to date.",
        });
      }
    };

    fetchCryptoData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchCryptoData, 300000);
    return () => clearInterval(interval);
  }, [cryptos, toast]);

  const handleAddCrypto = (newCrypto: Cryptocurrency) => {
    setCryptos(prev => [...prev, newCrypto]);
    toast({
      description: `${newCrypto.name} wallet added successfully!`,
    });
  };

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
      </div>
    </div>
  );
};

interface CryptoRowProps {
  crypto: Cryptocurrency;
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
          <span style={{ color: crypto.color }}>{crypto.symbol.charAt(0).toUpperCase()}</span>
        </div>
        <div className="text-left">
          <h3 className="font-medium">{crypto.name}</h3>
          <p className="text-sm text-gray-500">{crypto.balance.toFixed(8)} {crypto.symbol.toUpperCase()}</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-medium">${crypto.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className={cn(
          "text-sm",
          crypto.isUp ? "text-green-600" : "text-red-500"
        )}>
          {crypto.isUp ? "+" : ""}{crypto.change.toFixed(2)}%
        </p>
      </div>
    </button>
  );
};

interface CryptoDetailProps {
  crypto: Cryptocurrency;
  onBack: () => void;
}

const CryptoDetail: React.FC<CryptoDetailProps> = ({ crypto, onBack }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const { toast } = useToast();
  
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
  
  return (
    <div className="animate-fade-in">
      {showTransferModal && (
        <TransferModal crypto={crypto} onClose={() => setShowTransferModal(false)} />
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
            <span style={{ color: crypto.color }} className="text-lg font-bold">{crypto.symbol.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{crypto.name}</h2>
            <p className="text-gray-500">{crypto.symbol.toUpperCase()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-gray-500 mb-1">Balance</p>
            <h3 className="text-3xl font-bold">{crypto.balance.toFixed(8)} {crypto.symbol.toUpperCase()}</h3>
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
            {crypto.transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm font-medium capitalize">{tx.type}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {tx.type === "deposit" ? "+" : "-"}{tx.amount} {crypto.symbol.toUpperCase()}
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