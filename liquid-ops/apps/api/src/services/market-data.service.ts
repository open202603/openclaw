import type { Market } from '@liquid-ops/types';

const markets: Market[] = [
  { symbol: 'BTC-PERP', baseAsset: 'BTC', quoteAsset: 'USD', markPrice: 84214, indexPrice: 84201, change24h: 3.2, volume24h: 1203400000 },
  { symbol: 'ETH-PERP', baseAsset: 'ETH', quoteAsset: 'USD', markPrice: 4682, indexPrice: 4676, change24h: 2.1, volume24h: 843000000 },
  { symbol: 'SOL-PERP', baseAsset: 'SOL', quoteAsset: 'USD', markPrice: 214, indexPrice: 213.7, change24h: -1.4, volume24h: 351000000 },
];

export class MarketDataService {
  listMarkets() {
    return markets;
  }

  getMarket(symbol: string) {
    return markets.find((market) => market.symbol === symbol.toUpperCase()) ?? null;
  }
}
