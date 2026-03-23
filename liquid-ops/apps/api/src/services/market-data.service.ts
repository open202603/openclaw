import type { Candle, Market, OrderBookSnapshot } from '@liquid-ops/types';

type MarketState = Market & {
  basePrice: number;
};

const seedMarkets: MarketState[] = [
  {
    symbol: 'BTC-PERP',
    baseAsset: 'BTC',
    quoteAsset: 'USD',
    markPrice: 84214,
    indexPrice: 84201,
    change24h: 3.2,
    volume24h: 1203400000,
    fundingRate: 0.00012,
    openInterest: 428000000,
    high24h: 85120,
    low24h: 81240,
    basePrice: 83120,
  },
  {
    symbol: 'ETH-PERP',
    baseAsset: 'ETH',
    quoteAsset: 'USD',
    markPrice: 4682,
    indexPrice: 4676,
    change24h: 2.1,
    volume24h: 843000000,
    fundingRate: 0.00018,
    openInterest: 211000000,
    high24h: 4740,
    low24h: 4488,
    basePrice: 4588,
  },
  {
    symbol: 'SOL-PERP',
    baseAsset: 'SOL',
    quoteAsset: 'USD',
    markPrice: 214,
    indexPrice: 213.7,
    change24h: -1.4,
    volume24h: 351000000,
    fundingRate: -0.00004,
    openInterest: 92000000,
    high24h: 222,
    low24h: 206,
    basePrice: 217,
  },
];

const round = (value: number, decimals = 2) => Number(value.toFixed(decimals));

export class MarketDataService {
  private readonly markets = new Map(seedMarkets.map((market) => [market.symbol, { ...market }]));

  private tickMarket(symbol: string) {
    const market = this.markets.get(symbol);
    if (!market) return null;

    const drift = Math.sin(Date.now() / 15000 + market.basePrice) * 0.0006;
    const noise = (Math.sin(Date.now() / 7000 + market.markPrice) + 1) * 0.00035;
    const move = market.markPrice * (drift + noise - 0.00035);

    market.markPrice = round(Math.max(1, market.markPrice + move));
    market.indexPrice = round(market.markPrice * 0.9998);
    market.change24h = round(((market.markPrice - market.basePrice) / market.basePrice) * 100, 2);
    market.volume24h = Math.round(market.volume24h * (0.999 + ((Date.now() / 1000) % 5) * 0.0002));
    market.openInterest = Math.round(market.openInterest * (0.9995 + ((Date.now() / 1000) % 3) * 0.0004));
    market.high24h = Math.max(market.high24h, market.markPrice);
    market.low24h = Math.min(market.low24h, market.markPrice);
    market.fundingRate = round(Math.sin(Date.now() / 20000 + market.basePrice) * 0.00025, 5);

    return market;
  }

  private asMarket(symbol: string): Market | null {
    const market = this.tickMarket(symbol);
    if (!market) return null;
    const { basePrice: _basePrice, ...publicMarket } = market;
    return publicMarket;
  }

  listMarkets() {
    return Array.from(this.markets.keys()).map((symbol) => this.asMarket(symbol)!).sort((a, b) => b.volume24h - a.volume24h);
  }

  getMarket(symbol: string) {
    return this.asMarket(symbol.toUpperCase());
  }

  getOrderBook(symbol: string): OrderBookSnapshot | null {
    const market = this.getMarket(symbol);
    if (!market) return null;

    const tickSize = market.markPrice > 1000 ? 5 : market.markPrice > 100 ? 0.1 : 0.01;
    const spread = round(Math.max(tickSize, market.markPrice * 0.00025), market.markPrice > 1000 ? 0 : 2);
    const mid = market.markPrice;

    const bids = Array.from({ length: 6 }, (_, index) => ({
      price: round(mid - spread - index * spread, market.markPrice > 1000 ? 0 : 2),
      size: round((6 - index) * (market.symbol === 'BTC-PERP' ? 0.35 : market.symbol === 'ETH-PERP' ? 4.2 : 45), 3),
    }));

    const asks = Array.from({ length: 6 }, (_, index) => ({
      price: round(mid + spread + index * spread, market.markPrice > 1000 ? 0 : 2),
      size: round((index + 1) * (market.symbol === 'BTC-PERP' ? 0.31 : market.symbol === 'ETH-PERP' ? 3.7 : 38), 3),
    }));

    return {
      symbol: market.symbol,
      spread,
      bids,
      asks,
      timestamp: new Date().toISOString(),
    };
  }

  getCandles(symbol: string, points = 24): Candle[] {
    const market = this.getMarket(symbol);
    if (!market) return [];

    const now = Date.now();
    return Array.from({ length: points }, (_, index) => {
      const reversedIndex = points - index;
      const time = new Date(now - reversedIndex * 60_000).toISOString();
      const swing = Math.sin((now / 60000 + index) / 2 + market.baseAsset.length) * market.markPrice * 0.006;
      const open = round(market.markPrice - swing * 0.8);
      const close = round(market.markPrice - swing * 0.35);
      const high = round(Math.max(open, close) + Math.abs(swing) * 0.45);
      const low = round(Math.min(open, close) - Math.abs(swing) * 0.45);
      return {
        time,
        open,
        high,
        low,
        close,
        volume: Math.round((market.volume24h / 24) * (0.8 + (index % 5) * 0.06)),
      };
    });
  }
}
