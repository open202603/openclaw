export type Venue = 'binance-options' | 'deribit' | 'okx-options' | 'bybit-options';

export type OptionSide = 'call' | 'put';

export interface NormalizedOptionInstrument {
  venue: Venue;
  symbol: string;
  underlying: string;
  quoteCurrency: string;
  settlementCurrency: string;
  expiryTs: number;
  strike: number;
  optionSide: OptionSide;
  contractMultiplier: number;
  tickSize: number;
  lotSize: number;
}

export interface MarketSnapshot {
  venue: Venue;
  symbol: string;
  bidPrice: number | null;
  askPrice: number | null;
  bidSize: number | null;
  askSize: number | null;
  markPrice: number | null;
  indexPrice: number | null;
  impliedVol: number | null;
  delta?: number | null;
  gamma?: number | null;
  vega?: number | null;
  theta?: number | null;
  timestamp: number;
}

export interface VenueBalance {
  venue: Venue;
  currency: string;
  total: number;
  available: number;
}

export interface VenuePosition {
  venue: Venue;
  symbol: string;
  size: number;
  avgPrice: number;
  delta?: number;
  gamma?: number;
  vega?: number;
  theta?: number;
}

export interface PlaceOrderRequest {
  venue: Venue;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  postOnly?: boolean;
}

export interface CancelOrderRequest {
  venue: Venue;
  orderId: string;
  symbol: string;
}
