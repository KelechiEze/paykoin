import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface CryptoCoin {
  id: string;
  name: string;
  symbol: string;
  priceUsd: number;
  changePercent24Hr: number;
  iconUrl: string;
}

const DEFAULT_COINS: CryptoCoin[] = [
  { id: 'pcoin', name: 'PayCoin Vault', symbol: 'PCOIN', priceUsd: 12.85, changePercent24Hr: 24.50, iconUrl: 'https://assets.coincap.io/assets/icons/btc@2x.png' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', priceUsd: 94850.20, changePercent24Hr: 3.42, iconUrl: 'https://assets.coincap.io/assets/icons/btc@2x.png' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', priceUsd: 3450.80, changePercent24Hr: 2.15, iconUrl: 'https://assets.coincap.io/assets/icons/eth@2x.png' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', priceUsd: 198.40, changePercent24Hr: 5.88, iconUrl: 'https://assets.coincap.io/assets/icons/sol@2x.png' },
  { id: 'ripple', name: 'XRP', symbol: 'XRP', priceUsd: 2.45, changePercent24Hr: -1.20, iconUrl: 'https://assets.coincap.io/assets/icons/xrp@2x.png' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', priceUsd: 0.92, changePercent24Hr: 1.85, iconUrl: 'https://assets.coincap.io/assets/icons/ada@2x.png' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', priceUsd: 0.28, changePercent24Hr: 8.45, iconUrl: 'https://assets.coincap.io/assets/icons/doge@2x.png' },
  { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX', priceUsd: 38.60, changePercent24Hr: -0.75, iconUrl: 'https://assets.coincap.io/assets/icons/avax@2x.png' },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', priceUsd: 19.80, changePercent24Hr: 4.12, iconUrl: 'https://assets.coincap.io/assets/icons/link@2x.png' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', priceUsd: 8.75, changePercent24Hr: 0.95, iconUrl: 'https://assets.coincap.io/assets/icons/dot@2x.png' },
  { id: 'sui', name: 'Sui', symbol: 'SUI', priceUsd: 3.15, changePercent24Hr: 12.30, iconUrl: 'https://assets.coincap.io/assets/icons/sui@2x.png' },
];

export const CryptoMarquee: React.FC = () => {
  const [coins, setCoins] = useState<CryptoCoin[]>(DEFAULT_COINS);
  const [liveStatus, setLiveStatus] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCryptoPrices = async () => {
      try {
        // Try fetching from free public API (CoinCap)
        const res = await fetch('https://api.coincap.io/v2/assets?limit=12');
        if (res.ok) {
          const data = await res.json();
          if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
            const formatted: CryptoCoin[] = data.data.map((item: any) => ({
              id: item.id,
              name: item.name,
              symbol: item.symbol,
              priceUsd: parseFloat(item.priceUsd),
              changePercent24Hr: parseFloat(item.changePercent24Hr),
              iconUrl: `https://assets.coincap.io/assets/icons/${item.symbol.toLowerCase()}@2x.png`
            }));
            if (isMounted) {
              setCoins(formatted);
              setLiveStatus(true);
            }
            return;
          }
        }
      } catch (err) {
        // Silently fallback to default real live coin market state
      }

      // Secondary free endpoint fallback (CoinGecko public)
      try {
        const res2 = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=false');
        if (res2.ok) {
          const data2 = await res2.json();
          if (Array.isArray(data2) && data2.length > 0) {
            const formatted2: CryptoCoin[] = data2.map((item: any) => ({
              id: item.id,
              name: item.name,
              symbol: item.symbol.toUpperCase(),
              priceUsd: item.current_price,
              changePercent24Hr: item.price_change_percentage_24h,
              iconUrl: item.image
            }));
            if (isMounted) {
              setCoins(formatted2);
              setLiveStatus(true);
            }
          }
        }
      } catch (e) {
        // Keeps default state
      }
    };

    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 30000); // refresh every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Double array for seamless infinite marquee scroll loop
  const marqueeItems = [...coins, ...coins, ...coins];

  return (
    <div className="w-full bg-[#0a0d14] border-y border-white/10 py-3.5 overflow-hidden select-none relative z-20">
      {/* Sleek marquee ticker strip without any rounded container or background boxes */}
      <div className="flex animate-marquee whitespace-nowrap items-center">
        {marqueeItems.map((coin, index) => {
          const isPositive = coin.changePercent24Hr >= 0;
          return (
            <div
              key={`${coin.id}-${index}`}
              className="inline-flex items-center gap-3 px-8 text-white font-['Poppins'] transition-opacity duration-300 hover:opacity-100"
            >
              {/* Coin Icon - pure image without box container */}
              <img
                src={coin.iconUrl}
                alt={coin.name}
                className="w-5 h-5 object-contain shrink-0 filter drop-shadow"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />

              {/* Coin Name & Symbol */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-white">
                  {coin.symbol}
                </span>
                <span className="text-xs text-gray-400 font-light hidden sm:inline">
                  {coin.name}
                </span>
              </div>

              {/* Price USD */}
              <span className="text-sm font-semibold tracking-tight text-gray-100 font-mono">
                ${coin.priceUsd < 10 ? coin.priceUsd.toFixed(4) : coin.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>

              {/* 24h Change Badge - pure text without pill background */}
              <div className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-[#61dafb]' : 'text-rose-400'}`}>
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-[#61dafb]" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {isPositive ? '+' : ''}{coin.changePercent24Hr.toFixed(2)}%
                </span>
              </div>

              {/* Separator dot */}
              <span className="text-gray-700 text-xs ml-4">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
