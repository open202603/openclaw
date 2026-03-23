export type Market = {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  markPrice: number;
  indexPrice: number;
  change24h: number;
  volume24h: number;
  fundingRate: number;
  openInterest: number;
  high24h: number;
  low24h: number;
};

export type OrderBookLevel = {
  price: number;
  size: number;
};

export type OrderBookSnapshot = {
  symbol: string;
  spread: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: string;
};

export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
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
  notional: number;
  liquidationPrice: number;
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

export type OrderRecord = {
  orderId: string;
  accountId: string;
  marketSymbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop-market';
  size: number;
  leverage: number;
  requestedPrice?: number;
  fillPrice: number;
  status: 'filled';
  createdAt: string;
};

export type PortfolioSnapshot = {
  account: AccountSnapshot;
  positions: Position[];
  recentOrders: OrderRecord[];
};

export type PlaceOrderResponse = {
  order: OrderRecord;
  position: Position;
  portfolio: PortfolioSnapshot;
  marketSnapshot: Market | null;
};
