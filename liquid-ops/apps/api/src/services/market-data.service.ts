import { EventEmitter } from 'node:events';
import type { Candle, Market, OrderBookSnapshot } from '@liquid-ops/types';

type MarketState = Market & {
  basePrice: number;
  lastPrice: number;
  betaToBtc: number;
  volatility: number;
};

type MutableCandle = Candle & {
  bucket: number;
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
    lastPrice: 84214,
    betaToBtc: 1,
    volatility: 0.00085,
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
    lastPrice: 4682,
    betaToBtc: 1.35,
    volatility: 0.0012,
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
    lastPrice: 214,
    betaToBtc: 1.9,
    volatility: 0.0018,
  },
];

const round = (value: number, decimals = 2) => Number(value.toFixed(decimals));
const minuteMs = 60_000;

export class MarketDataService extends EventEmitter {
  private readonly markets = new Map(seedMarkets.map((market) => [market.symbol, { ...market }]));
  private readonly candles = new Map<string, MutableCandle[]>();
  private readonly timer: NodeJS.Timeout;

  constructor() {
    super();
    for (const market of this.markets.values()) {
      this.candles.set(market.symbol, this.buildInitialCandles(market));
    }

    this.timer = setInterval(() => {
      const btcMove = this.tickBtc();
      for (const symbol of this.markets.keys()) {
        if (symbol === 'BTC-PERP') {
          const market = this.markets.get(symbol);
          if (market) this.emit('market.tick', market.symbol, this.toPublicMarket(market));
          continue;
        }

        const market = this.tickAlt(symbol, btcMove);
        if (market) {
          this.emit('market.tick', market.symbol, this.toPublicMarket(market));
        }
      }
    }, 1200);
    this.timer.unref();
  }

  private buildInitialCandles(market: MarketState) {
    const nowBucket = Math.floor(Date.now() / minuteMs) * minuteMs;
    const candles: MutableCandle[] = [];
    let price = market.markPrice * 0.985;

    for (let index = 23; index >= 0; index -= 1) {
      const bucket = nowBucket - index * minuteMs;
      const swing = Math.sin(bucket / 180000 + market.basePrice) * market.markPrice * market.volatility * 8;
      const open = round(price);
      const close = round(Math.max(1, open + swing));
      const high = round(Math.max(open, close) + Math.abs(swing) * 0.45);
      const low = round(Math.max(1, Math.min(open, close) - Math.abs(swing) * 0.45));
      candles.push({
        bucket,
        time: new Date(bucket).toISOString(),
        open,
        high,
        low,
        close,
        volume: Math.round((market.volume24h / 1440) * (0.85 + ((23 - index) % 6) * 0.05)),
      });
      price = close;
    }

    return candles;
  }

  private updateCandle(symbol: string, nextPrice: number, intensity: number) {
    const bucket = Math.floor(Date.now() / minuteMs) * minuteMs;
    const series = this.candles.get(symbol) ?? [];
    const last = series.at(-1);

    if (!last || last.bucket !== bucket) {
      const open = last?.close ?? nextPrice;
      const candle: MutableCandle = {
        bucket,
        time: new Date(bucket).toISOString(),
        open: round(open),
        high: round(Math.max(open, nextPrice)),
        low: round(Math.min(open, nextPrice)),
        close: round(nextPrice),
        volume: Math.max(1, Math.round(intensity)),
      };
      series.push(candle);
      if (series.length > 240) {
        series.shift();
      }
    } else {
      last.high = round(Math.max(last.high, nextPrice));
      last.low = round(Math.min(last.low, nextPrice));
      last.close = round(nextPrice);
      last.volume += Math.max(1, Math.round(intensity));
    }

    this.candles.set(symbol, series);
  }

  private recalcDerivedFields(market: MarketState, priceMovePct: number, liquidityBias: number) {
    market.markPrice = round(Math.max(1, market.markPrice));
    market.indexPrice = round(market.markPrice * (1 - 0.00015 + liquidityBias * 0.0002));
    market.change24h = round(((market.markPrice - market.basePrice) / market.basePrice) * 100, 2);
    market.volume24h = Math.max(1, Math.round(market.volume24h * (0.9992 + Math.abs(priceMovePct) * 10 + 0.0002)));
    market.openInterest = Math.max(1, Math.round(market.openInterest * (0.9995 + Math.abs(priceMovePct) * 4 + 0.0001)));
    market.high24h = Math.max(market.high24h, market.markPrice);
    market.low24h = Math.min(market.low24h, market.markPrice);
    market.fundingRate = round(Math.max(-0.00045, Math.min(0.00045, priceMovePct * 0.6 + liquidityBias * 0.00018)), 5);
  }

  private tickBtc() {
    const market = this.markets.get('BTC-PERP');
    if (!market) return 0;

    const phase = Date.now() / 1000;
    const drift = Math.sin(phase / 75) * 0.00022;
    const wave = Math.cos(phase / 17) * 0.00018;
    const impulse = Math.sin(phase / 5.2) * 0.00008;
    const movePct = drift + wave + impulse;

    market.lastPrice = market.markPrice;
    market.markPrice = market.markPrice * (1 + movePct);
    this.recalcDerivedFields(market, movePct, Math.sin(phase / 33));
    this.updateCandle(market.symbol, market.markPrice, market.volume24h / 1440 * (0.7 + Math.abs(movePct) * 450));
    this.emit('market.tick', market.symbol, this.toPublicMarket(market));

    return market.lastPrice > 0 ? (market.markPrice - market.lastPrice) / market.lastPrice : 0;
  }

  private tickAlt(symbol: string, btcMovePct: number) {
    const market = this.markets.get(symbol);
    if (!market) return null;

    const phase = Date.now() / 1000;
    const sectorDrift = Math.sin(phase / (symbol === 'ETH-PERP' ? 48 : 31) + market.basePrice) * market.volatility * 0.35;
    const relativeStrength = Math.cos(phase / 14 + market.markPrice) * market.volatility * 0.18;
    const movePct = btcMovePct * market.betaToBtc + sectorDrift + relativeStrength;

    market.lastPrice = market.markPrice;
    market.markPrice = market.markPrice * (1 + movePct);
    this.recalcDerivedFields(market, movePct, Math.cos(phase / 28 + market.betaToBtc));
    this.updateCandle(market.symbol, market.markPrice, market.volume24h / 1440 * (0.65 + Math.abs(movePct) * 520));

    return market;
  }

  private toPublicMarket(market: MarketState): Market {
    const { basePrice: _basePrice, lastPrice: _lastPrice, betaToBtc: _betaToBtc, volatility: _volatility, ...publicMarket } = market;
    return publicMarket;
  }

  listMarkets() {
    return Array.from(this.markets.values()).map((market) => this.toPublicMarket(market)).sort((a, b) => {
      if (a.symbol === 'BTC-PERP') return -1;
      if (b.symbol === 'BTC-PERP') return 1;
      return b.volume24h - a.volume24h;
    });
  }

  getMarket(symbol: string) {
    const market = this.markets.get(symbol.toUpperCase());
    return market ? this.toPublicMarket(market) : null;
  }

  getOrderBook(symbol: string): OrderBookSnapshot | null {
    const market = this.getMarket(symbol);
    if (!market) return null;

    const precision = market.markPrice > 1000 ? 0 : 2;
    const tickSize = market.symbol === 'BTC-PERP' ? 1 : market.markPrice > 100 ? 0.1 : 0.01;
    const spread = round(Math.max(tickSize, market.markPrice * (market.symbol === 'BTC-PERP' ? 0.00008 : 0.00018)), precision);
    const mid = market.markPrice;
    const baseSize = market.symbol === 'BTC-PERP' ? 0.45 : market.symbol === 'ETH-PERP' ? 5.2 : 55;

    const bids = Array.from({ length: 8 }, (_, index) => ({
      price: round(mid - spread * (index + 1), precision),
      size: round(baseSize * (1 + (8 - index) * 0.22) * (1 + Math.sin(Date.now() / 6000 + index) * 0.08), 3),
    }));

    const asks = Array.from({ length: 8 }, (_, index) => ({
      price: round(mid + spread * (index + 1), precision),
      size: round(baseSize * (1 + (index + 1) * 0.19) * (1 + Math.cos(Date.now() / 5500 + index) * 0.07), 3),
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
    const series = this.candles.get(symbol.toUpperCase()) ?? [];
    return series.slice(-Math.max(1, Math.min(points, 240))).map(({ bucket: _bucket, ...candle }) => candle);
  }
}
