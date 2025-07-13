import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import './CryptoChart.css';

interface CryptoData {
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

const CRYPTO_LIST = [
  { symbol: 'BTC', name: 'Bitcoin', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { symbol: 'BNB', name: 'BNB', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
  { symbol: 'SOL', name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  { symbol: 'XRP', name: 'XRP', icon: 'https://cryptologos.cc/logos/xrp-xrp-logo.png' },
  { symbol: 'DOGE', name: 'Dogecoin', icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png' },
  { symbol: 'ADA', name: 'Cardano', icon: 'https://cryptologos.cc/logos/cardano-ada-logo.png' },
  { symbol: 'AVAX', name: 'Avalanche', icon: 'https://cryptologos.cc/logos/avalanche-avax-logo.png' },
  { symbol: 'TRX', name: 'TRON', icon: 'https://cryptologos.cc/logos/tron-trx-logo.png' },
  { symbol: 'DOT', name: 'Polkadot', icon: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png' },
  { symbol: 'MATIC', name: 'Polygon', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
  { symbol: 'LTC', name: 'Litecoin', icon: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png' },
  { symbol: 'SHIB', name: 'Shiba Inu', icon: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png' },
  { symbol: 'UNI', name: 'Uniswap', icon: 'https://cryptologos.cc/logos/uniswap-uni-logo.png' },
  { symbol: 'ATOM', name: 'Cosmos', icon: 'https://cryptologos.cc/logos/cosmos-atom-logo.png' },
  { symbol: 'LINK', name: 'Chainlink', icon: 'https://cryptologos.cc/logos/chainlink-link-logo.png' },
  { symbol: 'XLM', name: 'Stellar', icon: 'https://cryptologos.cc/logos/stellar-xlm-logo.png' },
  { symbol: 'BCH', name: 'Bitcoin Cash', icon: 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png' },
  { symbol: 'NEAR', name: 'NEAR Protocol', icon: 'https://cryptologos.cc/logos/near-protocol-near-logo.png' },
  { symbol: 'FTM', name: 'Fantom', icon: 'https://cryptologos.cc/logos/fantom-ftm-logo.png' },
  { symbol: 'ALGO', name: 'Algorand', icon: 'https://cryptologos.cc/logos/algorand-algo-logo.png' },
  { symbol: 'VET', name: 'VeChain', icon: 'https://cryptologos.cc/logos/vechain-vet-logo.png' },
  { symbol: 'ICP', name: 'Internet Computer', icon: 'https://cryptologos.cc/logos/internet-computer-icp-logo.png' },
  { symbol: 'FIL', name: 'Filecoin', icon: 'https://cryptologos.cc/logos/filecoin-fil-logo.png' },
  { symbol: 'HBAR', name: 'Hedera', icon: 'https://cryptologos.cc/logos/hedera-hashgraph-hbar-logo.png' },
  { symbol: 'APT', name: 'Aptos', icon: 'https://cryptologos.cc/logos/aptos-apt-logo.png' },
  { symbol: 'MANA', name: 'Decentraland', icon: 'https://cryptologos.cc/logos/decentraland-mana-logo.png' },
  { symbol: 'SAND', name: 'The Sandbox', icon: 'https://cryptologos.cc/logos/the-sandbox-sand-logo.png' },
  { symbol: 'CRO', name: 'Cronos', icon: 'https://cryptologos.cc/logos/cronos-cro-logo.png' },
  { symbol: 'LDO', name: 'Lido DAO', icon: 'https://cryptologos.cc/logos/lido-dao-ldo-logo.png' },
  { symbol: 'ARB', name: 'Arbitrum', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png' },
  { symbol: 'OP', name: 'Optimism', icon: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png' },
  { symbol: 'PEPE', name: 'Pepe', icon: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg' },
  { symbol: 'RUNE', name: 'THORChain', icon: 'https://cryptologos.cc/logos/thorchain-rune-logo.png' },
  { symbol: 'INJ', name: 'Injective', icon: 'https://cryptologos.cc/logos/injective-protocol-inj-logo.png' },
  { symbol: 'SUI', name: 'Sui', icon: 'https://cryptologos.cc/logos/sui-sui-logo.png' },
  { symbol: 'GRT', name: 'The Graph', icon: 'https://cryptologos.cc/logos/the-graph-grt-logo.png' },
  { symbol: 'AAVE', name: 'Aave', icon: 'https://cryptologos.cc/logos/aave-aave-logo.png' },
  { symbol: 'MKR', name: 'Maker', icon: 'https://cryptologos.cc/logos/maker-mkr-logo.png' },
  { symbol: 'SNX', name: 'Synthetix', icon: 'https://cryptologos.cc/logos/synthetix-snx-logo.png' },
  { symbol: 'COMP', name: 'Compound', icon: 'https://cryptologos.cc/logos/compound-comp-logo.png' },
  { symbol: 'CRV', name: 'Curve DAO', icon: 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png' },
  { symbol: 'SUSHI', name: 'SushiSwap', icon: 'https://cryptologos.cc/logos/sushiswap-sushi-logo.png' },
  { symbol: 'YFI', name: 'yearn.finance', icon: 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.png' },
  { symbol: 'BAL', name: 'Balancer', icon: 'https://cryptologos.cc/logos/balancer-bal-logo.png' },
  { symbol: 'REN', name: 'Ren', icon: 'https://cryptologos.cc/logos/ren-ren-logo.png' },
  { symbol: 'ZRX', name: '0x', icon: 'https://cryptologos.cc/logos/0x-zrx-logo.png' },
  { symbol: 'KNC', name: 'Kyber Network', icon: 'https://cryptologos.cc/logos/kyber-network-knc-logo.png' },
  { symbol: 'BAND', name: 'Band Protocol', icon: 'https://cryptologos.cc/logos/band-protocol-band-logo.png' },
  { symbol: 'ENJ', name: 'Enjin Coin', icon: 'https://cryptologos.cc/logos/enjin-coin-enj-logo.png' }
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

  const generateMockData = useCallback((symbol: string, range: string) => {
    const basePrice = Math.random() * 50000 + 1000;
    const dataPoints = range === '1h' ? 60 : range === '24h' ? 24 : range === '7d' ? 168 : 30;
    const data: ChartDataPoint[] = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * volatility;
      const price = i === 0 ? basePrice : data[i - 1].price * (1 + change);
      
      data.push({
        time: new Date(Date.now() - (dataPoints - i) * (range === '1h' ? 60000 : 3600000)).toLocaleTimeString(),
        price: Math.round(price * 100) / 100,
        timestamp: Date.now() - (dataPoints - i) * (range === '1h' ? 60000 : 3600000)
      });
    }
    
    return data;
  }, []);

  const generateMockCryptoData = useCallback((symbol: string): CryptoData => {
    const price = Math.random() * 50000 + 100;
    const change = (Math.random() - 0.5) * 20;
    
    return {
      symbol,
      name: CRYPTO_LIST.find(c => c.symbol === symbol)?.name || symbol,
      price: Math.round(price * 100) / 100,
      change24h: Math.round(change * 100) / 100,
      volume24h: Math.round(Math.random() * 1000000000),
      marketCap: Math.round(Math.random() * 100000000000)
    };
  }, []);

  const fetchCryptoData = useCallback(async (symbol: string) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData = generateMockCryptoData(symbol);
    const mockChartData = generateMockData(symbol, timeRange);
    
    setCryptoData(mockData);
    setChartData(mockChartData);
    setLoading(false);
  }, [generateMockCryptoData, generateMockData, timeRange]);

  useEffect(() => {
    fetchCryptoData(selectedCrypto);
  }, [selectedCrypto, timeRange, fetchCryptoData]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCryptoData(selectedCrypto);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedCrypto, fetchCryptoData]);

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
        <h2 className="chart-title">Live Crypto Analysis</h2>
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
        </div>
      ) : (
        <>
          <div className="chart-content slide-in">
            {cryptoData && (
              <div className="crypto-info">
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
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: '#6366f1' }}
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
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CryptoChart;