export type Market = {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  markPrice: number;
  indexPrice: number;
  change24h: number;
  volume24h: number;
};

export type Position = {
  id: string;
  marketSymbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  leverage: number;
};

export type AccountSnapshot = {
  accountId: string;
  equity: number;
  freeCollateral: number;
  usedMargin: number;
  realizedPnl: number;
  unrealizedPnl: number;
};

export type SimulatedOrderRequest = {
  accountId: string;
  marketSymbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop-market';
  size: number;
  price?: number;
  leverage: number;
};
