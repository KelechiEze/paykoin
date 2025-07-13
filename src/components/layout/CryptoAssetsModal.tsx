import React, { useState } from 'react';
import { X, Search, TrendingUp, TrendingDown, Star, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  supply: number;
  rank: number;
  isFavorite?: boolean;
}

const cryptoAssets: CryptoAsset[] = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 77073.10,
    change24h: 2.41,
    change7d: 8.15,
    marketCap: 1520000000000,
    volume24h: 45000000000,
    supply: 19750000,
    rank: 1,
    isFavorite: true
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 1973.25,
    change24h: -0.87,
    change7d: 12.45,
    marketCap: 237000000000,
    volume24h: 12000000000,
    supply: 120000000,
    rank: 2,
    isFavorite: true
  },
  {
    id: '3',
    name: 'Solana',
    symbol: 'SOL',
    price: 142.15,
    change24h: 5.23,
    change7d: -2.18,
    marketCap: 67000000000,
    volume24h: 3200000000,
    supply: 471000000,
    rank: 3
  },
  {
    id: '4',
    name: 'Cardano',
    symbol: 'ADA',
    price: 0.34,
    change24h: -1.45,
    change7d: 6.78,
    marketCap: 12000000000,
    volume24h: 890000000,
    supply: 35000000000,
    rank: 4
  },
  {
    id: '5',
    name: 'Polygon',
    symbol: 'MATIC',
    price: 0.42,
    change24h: 3.67,
    change7d: -4.23,
    marketCap: 4200000000,
    volume24h: 234000000,
    supply: 10000000000,
    rank: 5
  },
  {
    id: '6',
    name: 'Chainlink',
    symbol: 'LINK',
    price: 14.82,
    change24h: 1.89,
    change7d: 15.67,
    marketCap: 8900000000,
    volume24h: 567000000,
    supply: 1000000000,
    rank: 6
  }
];

interface CryptoAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CryptoAssetsModal: React.FC<CryptoAssetsModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'price' | 'change24h' | 'marketCap'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAssets = cryptoAssets
    .filter(asset => 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toLocaleString();
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const PercentageDisplay: React.FC<{ value: number }> = ({ value }) => {
    const isPositive = value >= 0;
    return (
      <div className={cn(
        "flex items-center font-semibold",
        isPositive ? "text-emerald-600" : "text-red-500"
      )}>
        {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
        <span>{isPositive ? '+' : ''}{value.toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-7xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 px-6 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Cryptocurrency Market</h2>
                  <p className="text-slate-300 mt-1">Real-time market data and insights</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="mt-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto max-h-[calc(90vh-200px)]">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('rank')}
                        className="flex items-center space-x-1 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                      >
                        <span>#</span>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="font-semibold text-slate-700">Asset</span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSort('price')}
                        className="flex items-center space-x-1 font-semibold text-slate-700 hover:text-slate-900 transition-colors ml-auto"
                      >
                        <span>Price</span>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSort('change24h')}
                        className="flex items-center space-x-1 font-semibold text-slate-700 hover:text-slate-900 transition-colors ml-auto"
                      >
                        <span>24h Change</span>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="font-semibold text-slate-700">7d Change</span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSort('marketCap')}
                        className="flex items-center space-x-1 font-semibold text-slate-700 hover:text-slate-900 transition-colors ml-auto"
                      >
                        <span>Market Cap</span>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="font-semibold text-slate-700">Volume (24h)</span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="font-semibold text-slate-700">Circulating Supply</span>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-700">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.map((asset, index) => (
                    <motion.tr
                      key={asset.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50/30 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {asset.isFavorite && <Star className="text-yellow-500 fill-current" size={16} />}
                          <span className="text-slate-600 font-medium">#{asset.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {asset.symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{asset.name}</div>
                            <div className="text-sm text-slate-500">{asset.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-slate-900">${asset.price.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <PercentageDisplay value={asset.change24h} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <PercentageDisplay value={asset.change7d} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-slate-700">{formatCurrency(asset.marketCap)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-slate-600">{formatCurrency(asset.volume24h)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-slate-600">{formatNumber(asset.supply)} {asset.symbol}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
                          <ExternalLink size={14} className="mr-1" />
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-t">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div>Showing {filteredAssets.length} of {cryptoAssets.length} cryptocurrencies</div>
                <div className="flex items-center space-x-4">
                  <span>Data updated every 30 seconds</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CryptoAssetsModal;
