import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, TrendingDown, ChevronDown, RefreshCw } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import './CryptoChart.css';

interface CryptoData {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

interface ChartDataPoint {
  time: string;
  price: number;
  timestamp: number;
}

// CoinMarketCap API configuration
const API_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';
const API_KEY = process.env.REACT_APP_COINMARKETCAP_API_KEY; // You'll need to set this in your environment

const CRYPTO_LIST = [
  { id: 1, symbol: 'BTC', name: 'Bitcoin', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg' },
  { id: 1027, symbol: 'ETH', name: 'Ethereum', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg' },
  { id: 1839, symbol: 'BNB', name: 'BNB', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/bnb.svg' },
  { id: 5426, symbol: 'SOL', name: 'Solana', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/sol.svg' },
  { id: 52, symbol: 'XRP', name: 'XRP', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/xrp.svg' },
  { id: 74, symbol: 'DOGE', name: 'Dogecoin', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/doge.svg' },
  { id: 2010, symbol: 'ADA', name: 'Cardano', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/ada.svg' },
  { id: 5805, symbol: 'AVAX', name: 'Avalanche', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/avax.svg' },
  { id: 1958, symbol: 'TRX', name: 'TRON', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/trx.svg' },
  { id: 6636, symbol: 'DOT', name: 'Polkadot', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/dot.svg' },
  { id: 3890, symbol: 'MATIC', name: 'Polygon', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/matic.svg' },
  { id: 2, symbol: 'LTC', name: 'Litecoin', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/ltc.svg' },
  { id: 5994, symbol: 'SHIB', name: 'Shiba Inu', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/shib.svg' },
  { id: 7083, symbol: 'UNI', name: 'Uniswap', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/uni.svg' },
  { id: 3794, symbol: 'ATOM', name: 'Cosmos', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/atom.svg' },
  { id: 1975, symbol: 'LINK', name: 'Chainlink', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/link.svg' },
  { id: 512, symbol: 'XLM', name: 'Stellar', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/xlm.svg' },
  { id: 1831, symbol: 'BCH', name: 'Bitcoin Cash', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/bch.svg' },
  { id: 6535, symbol: 'NEAR', name: 'NEAR Protocol', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/near.svg' },
  { id: 3513, symbol: 'FTM', name: 'Fantom', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/ftm.svg' },
  { id: 4030, symbol: 'ALGO', name: 'Algorand', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/algo.svg' },
  { id: 3077, symbol: 'VET', name: 'VeChain', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/vet.svg' },
  { id: 8916, symbol: 'ICP', name: 'Internet Computer', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/icp.svg' },
  { id: 2280, symbol: 'FIL', name: 'Filecoin', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/fil.svg' },
  { id: 4642, symbol: 'HBAR', name: 'Hedera', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/hbar.svg' },
  { id: 21794, symbol: 'APT', name: 'Aptos', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/apt.svg' },
  { id: 1966, symbol: 'MANA', name: 'Decentraland', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/mana.svg' },
  { id: 6210, symbol: 'SAND', name: 'The Sandbox', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/sand.svg' },
  { id: 3635, symbol: 'CRO', name: 'Cronos', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/cro.svg' },
  { id: 8000, symbol: 'LDO', name: 'Lido DAO', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/ldo.svg' },
  { id: 11841, symbol: 'ARB', name: 'Arbitrum', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/arb.svg' },
  { id: 11840, symbol: 'OP', name: 'Optimism', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/op.svg' },
  { id: 24478, symbol: 'PEPE', name: 'Pepe', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/pepe.svg' },
  { id: 4157, symbol: 'RUNE', name: 'THORChain', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/rune.svg' },
  { id: 7226, symbol: 'INJ', name: 'Injective', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/inj.svg' },
  { id: 20947, symbol: 'SUI', name: 'Sui', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/sui.svg' },
  { id: 6719, symbol: 'GRT', name: 'The Graph', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/grt.svg' },
  { id: 7278, symbol: 'AAVE', name: 'Aave', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/aave.svg' },
  { id: 1518, symbol: 'MKR', name: 'Maker', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/mkr.svg' },
  { id: 2586, symbol: 'SNX', name: 'Synthetix', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/snx.svg' },
  { id: 5692, symbol: 'COMP', name: 'Compound', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/comp.svg' },
  { id: 6538, symbol: 'CRV', name: 'Curve DAO', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/crv.svg' },
  { id: 6758, symbol: 'SUSHI', name: 'SushiSwap', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/sushi.svg' },
  { id: 5864, symbol: 'YFI', name: 'yearn.finance', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/yfi.svg' },
  { id: 5728, symbol: 'BAL', name: 'Balancer', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/bal.svg' },
  { id: 2539, symbol: 'REN', name: 'Ren', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/ren.svg' },
  { id: 1896, symbol: 'ZRX', name: '0x', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/zrx.svg' },
  { id: 9444, symbol: 'KNC', name: 'Kyber Network', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/knc.svg' },
  { id: 4679, symbol: 'BAND', name: 'Band Protocol', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/band.svg' },
  { id: 2130, symbol: 'ENJ', name: 'Enjin Coin', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/enj.svg' }
];

const TIME_RANGES = [
  { label: '1H', value: '1h' },
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y', value: '1y' }
];

const CryptoChart: React.FC = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [searchTerm, setSearchTerm] = useState('');
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(false);
  const [searchNoResults, setSearchNoResults] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch crypto data from CoinMarketCap
  const fetchCryptoData = useCallback(async (symbol: string) => {
    if (!API_KEY) {
      console.error('CoinMarketCap API key is not set');
      return;
    }

    setLoading(true);
    
    try {
      // Find the crypto ID
      const crypto = CRYPTO_LIST.find(c => c.symbol === symbol);
      if (!crypto) return;

      // Fetch latest quotes
      const quotesResponse = await fetch(
        `${API_BASE_URL}/cryptocurrency/quotes/latest?id=${crypto.id}`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': API_KEY,
          },
        }
      );

      if (!quotesResponse.ok) {
        throw new Error('Failed to fetch crypto data');
      }

      const quotesData = await quotesResponse.json();
      const quote = quotesData.data[crypto.id].quote.USD;

      const cryptoData: CryptoData = {
        id: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name,
        price: quote.price,
        change24h: quote.percent_change_24h,
        volume24h: quote.volume_24h,
        marketCap: quote.market_cap,
      };

      setCryptoData(cryptoData);
      setLastUpdated(new Date().toLocaleTimeString());

      // For chart data, we'll use a simplified approach since historical data requires a paid plan
      // In a real implementation, you would fetch historical data based on the timeRange
      generateChartData(cryptoData, timeRange);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      // Fallback to mock data if API fails
      generateMockCryptoData(symbol);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Generate chart data based on real price and time range
  const generateChartData = useCallback((data: CryptoData, range: string) => {
    // This is a simplified implementation
    // In a real app, you would fetch historical data from an API
    const basePrice = data.price;
    const volatility = 0.02;
    const dataPoints = range === '1h' ? 60 : range === '24h' ? 24 : range === '7d' ? 168 : 30;
    const chartData: ChartDataPoint[] = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const change = (Math.random() - 0.5) * volatility;
      const price = i === 0 ? basePrice : chartData[i - 1].price * (1 + change);
      
      chartData.push({
        time: new Date(Date.now() - (dataPoints - i) * (range === '1h' ? 60000 : 3600000)).toLocaleTimeString(),
        price: Math.round(price * 100) / 100,
        timestamp: Date.now() - (dataPoints - i) * (range === '1h' ? 60000 : 3600000)
      });
    }
    
    setChartData(chartData);
  }, []);

  // Fallback to mock data if API is not available
  const generateMockCryptoData = useCallback((symbol: string) => {
    const crypto = CRYPTO_LIST.find(c => c.symbol === symbol);
    if (!crypto) return;

    // More realistic mock data based on typical crypto values
    const mockPrice = symbol === 'BTC' ? 50000 + Math.random() * 10000 :
                     symbol === 'ETH' ? 3000 + Math.random() * 1000 :
                     Math.random() * 100;
    
    const mockChange = (Math.random() - 0.5) * 10;
    
    const mockData: CryptoData = {
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      price: Math.round(mockPrice * 100) / 100,
      change24h: Math.round(mockChange * 100) / 100,
      volume24h: Math.random() * 1000000000,
      marketCap: Math.random() * 100000000000
    };
    
    setCryptoData(mockData);
    setLastUpdated(new Date().toLocaleTimeString());
    generateChartData(mockData, timeRange);
  }, [timeRange, generateChartData]);

  useEffect(() => {
    if (API_KEY) {
      fetchCryptoData(selectedCrypto);
    } else {
      // Use mock data if no API key is set
      generateMockCryptoData(selectedCrypto);
    }
  }, [selectedCrypto, timeRange, fetchCryptoData, generateMockCryptoData]);

  // Auto-refresh data every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (API_KEY) {
        fetchCryptoData(selectedCrypto);
      } else {
        generateMockCryptoData(selectedCrypto);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedCrypto, fetchCryptoData, generateMockCryptoData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setSearchNoResults(false);
  };

  const filteredCryptos = CRYPTO_LIST.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (searchTerm && filteredCryptos.length === 0) {
      setSearchNoResults(true);
    } else {
      setSearchNoResults(false);
    }
  }, [searchTerm, filteredCryptos]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value > 1 ? 2 : 6
    }).format(value);
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const selectedCryptoInfo = CRYPTO_LIST.find(crypto => crypto.symbol === selectedCrypto);

  return (
    <div className="crypto-chart-container fade-in">
      <div className="chart-header">
        <div className="header-left">
          <h2 className="chart-title">Live Crypto Analysis</h2>
          {lastUpdated && (
            <div className="last-updated">
              <span>Updated: {lastUpdated}</span>
              <RefreshCw 
                size={14} 
                className="refresh-icon" 
                onClick={() => API_KEY ? fetchCryptoData(selectedCrypto) : generateMockCryptoData(selectedCrypto)} 
              />
            </div>
          )}
        </div>
        <div className="chart-controls">
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="crypto-dropdown-trigger">
              <div className="selected-crypto">
                <img 
                  src={selectedCryptoInfo?.icon} 
                  alt={selectedCryptoInfo?.name}
                  className="crypto-icon-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="crypto-icon-fallback hidden">
                  {selectedCrypto.charAt(0)}
                </div>
                <span>{selectedCryptoInfo?.name || selectedCrypto}</span>
                <span className="crypto-symbol">({selectedCrypto})</span>
              </div>
              <ChevronDown size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="crypto-dropdown-content">
              <div className="dropdown-header">
                <span className="dropdown-title">Select Cryptocurrency</span>
                <span className="dropdown-subtitle">{CRYPTO_LIST.length} assets available</span>
              </div>
              {searchNoResults ? (
                <div className="no-results">
                  <span>Crypto asset not found</span>
                </div>
              ) : (
                <div className="dropdown-list-container">
                  {filteredCryptos.map((crypto) => (
                    <DropdownMenuItem
                      key={crypto.symbol}
                      className="crypto-dropdown-item"
                      onClick={() => setSelectedCrypto(crypto.symbol)}
                    >
                      <img 
                        src={crypto.icon} 
                        alt={crypto.name}
                        className="crypto-icon-image"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <div className="crypto-icon-fallback hidden">
                        {crypto.symbol.charAt(0)}
                      </div>
                      <div className="crypto-info">
                        <span className="crypto-name">{crypto.name}</span>
                        <span className="crypto-symbol-small">{crypto.symbol}</span>
                      </div>
                      {selectedCrypto === crypto.symbol && (
                        <div className="selected-indicator"></div>
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          <div className="chart-content slide-in">
            {cryptoData && (
              <div className="crypto-info">
                <div className="crypto-main-info">
                  <img 
                    src={selectedCryptoInfo?.icon} 
                    alt={selectedCryptoInfo?.name}
                    className="crypto-icon-large"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                  <div className="crypto-icon-fallback-large hidden">
                    {cryptoData.symbol.charAt(0)}
                  </div>
                  <div className="crypto-details">
                    <h3>{cryptoData.name}</h3>
                    <p>{cryptoData.symbol}/USD</p>
                  </div>
                </div>
                <div className="price-info">
                  <span className="current-price">{formatPrice(cryptoData.price)}</span>
                  <div className={`price-change ${cryptoData.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {cryptoData.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {cryptoData.change24h >= 0 ? '+' : ''}{cryptoData.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}

            <div className="time-selector">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.value}
                  className={`time-button ${timeRange === range.value ? 'active' : ''}`}
                  onClick={() => setTimeRange(range.value)}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#888"
                    fontSize={10}
                    tickFormatter={(value) => {
                      if (timeRange === '1h') return value.split(':').slice(0, 2).join(':');
                      return value;
                    }}
                  />
                  <YAxis 
                    stroke="#888"
                    fontSize={10}
                    tickFormatter={formatPrice}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [formatPrice(value), 'Price']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={cryptoData?.change24h >= 0 ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: cryptoData?.change24h >= 0 ? '#10b981' : '#ef4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {cryptoData && (
              <div className="stats-container">
                <div className="stat-item">
                  <p className="stat-label">24h Volume</p>
                  <p className="stat-value">
                    {formatVolume(cryptoData.volume24h)}
                  </p>
                </div>
                <div className="stat-item">
                  <p className="stat-label">Market Cap</p>
                  <p className="stat-value">
                    {formatVolume(cryptoData.marketCap)}
                  </p>
                </div>
                <div className="stat-item">
                  <p className="stat-label">24h Change</p>
                  <p className={`stat-value ${cryptoData.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {cryptoData.change24h >= 0 ? '+' : ''}{cryptoData.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CryptoChart;