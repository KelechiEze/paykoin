import React, { useState, useEffect } from 'react';
import { X, Search, TrendingUp, TrendingDown, Star, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  market_cap_rank: number;
  image?: string;
  isFavorite?: boolean;
}

const CryptoAssetsModal: React.FC<CryptoAssetsModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap'>('market_cap_rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real-time data from CoinGecko API
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h,7d'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        
        // Map API data to our interface
        const mappedData = data.map((coin: any) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          current_price: coin.current_price,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency,
          market_cap: coin.market_cap,
          total_volume: coin.total_volume,
          circulating_supply: coin.circulating_supply,
          market_cap_rank: coin.market_cap_rank,
          image: coin.image,
          // Preserve favorites if they exist in local storage
          isFavorite: localStorage.getItem(`favorite_${coin.id}`) === 'true'
        }));
        
        setAssets(mappedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load market data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up interval for refreshing data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, [isOpen]);

  const filteredAssets = assets
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

  const toggleFavorite = (id: string) => {
    setAssets(prevAssets => 
      prevAssets.map(asset => 
        asset.id === id 
          ? { ...asset, isFavorite: !asset.isFavorite } 
          : asset
      )
    );
    // Save to local storage
    const currentStatus = localStorage.getItem(`favorite_${id}`) === 'true';
    localStorage.setItem(`favorite_${id}`, String(!currentStatus));
  };

  const PercentageDisplay: React.FC<{ value: number }> = ({ value }) => {
    const isPositive = value >= 0;
    return (
      <div className={cn(
        "flex items-center font-semibold",
        isPositive ? "text-emerald-600" : "text-red-500"
      )}>
        {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
        <span>{isPositive ? '+' : ''}{value?.toFixed(2) || '0.00'}%</span>
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

            {/* Loading/Error State */}
            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}

            {error && (
              <div className="flex justify-center items-center py-20 text-red-500">
                {error}
              </div>
            )}

            {/* Table Container */}
            {!isLoading && !error && (
              <div className="overflow-x-auto max-h-[calc(90vh-200px)]">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('market_cap_rank')}
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
                          onClick={() => handleSort('current_price')}
                          className="flex items-center space-x-1 font-semibold text-slate-700 hover:text-slate-900 transition-colors ml-auto"
                        >
                          <span>Price</span>
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSort('price_change_percentage_24h')}
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
                          onClick={() => handleSort('market_cap')}
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
                            <button 
                              onClick={() => toggleFavorite(asset.id)}
                              className="text-slate-400 hover:text-yellow-500 transition-colors"
                            >
                              <Star 
                                size={16} 
                                className={asset.isFavorite ? "text-yellow-500 fill-current" : ""} 
                              />
                            </button>
                            <span className="text-slate-600 font-medium">#{asset.market_cap_rank}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {asset.image ? (
                              <img 
                                src={asset.image} 
                                alt={asset.name} 
                                className="w-10 h-10 rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                  target.className = 'w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm';
                                  target.textContent = asset.symbol.charAt(0);
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {asset.symbol.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-900">{asset.name}</div>
                              <div className="text-sm text-slate-500">{asset.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-slate-900">
                            ${asset.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <PercentageDisplay value={asset.price_change_percentage_24h} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <PercentageDisplay value={asset.price_change_percentage_7d_in_currency || 0} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-semibold text-slate-700">{formatCurrency(asset.market_cap)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-slate-600">{formatCurrency(asset.total_volume)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-slate-600">
                            {formatNumber(asset.circulating_supply)} {asset.symbol}
                          </div>
                        </td>
                       <td className="px-6 py-4 text-center">
                        <a 
                          href={`https://coinmarketcap.com/currencies/${asset.id}/`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                          <ExternalLink size={14} className="mr-1" />
                          View
                        </a>
                      </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-t">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div>Showing {filteredAssets.length} of {assets.length} cryptocurrencies</div>
                <div className="flex items-center space-x-4">
                  <span>Data updates every 30 seconds</span>
                  {!isLoading && !error && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface CryptoAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default CryptoAssetsModal;