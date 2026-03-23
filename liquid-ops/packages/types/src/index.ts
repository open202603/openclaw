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
  updatedAt: string;
};

export type AccountSnapshot = {
  accountId: string;
  equity: number;
  freeCollateral: number;
  usedMargin: number;
  positionMargin: number;
  reservedOrderMargin: number;
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

export type OrderStatus = 'open' | 'filled' | 'canceled';

export type OrderRecord = {
  orderId: string;
  accountId: string;
  marketSymbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop-market';
  size: number;
  leverage: number;
  requestedPrice?: number;
  triggerPrice?: number;
  reservedMargin?: number;
  fillPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  filledAt?: string;
  canceledAt?: string;
  realizedPnl?: number;
  closedSize?: number;
};

export type PortfolioHistoryPoint = {
  timestamp: string;
  equity: number;
  freeCollateral: number;
  usedMargin: number;
  realizedPnl: number;
  unrealizedPnl: number;
};

export type PortfolioSnapshot = {
  account: AccountSnapshot;
  positions: Position[];
  recentOrders: OrderRecord[];
  openOrders: OrderRecord[];
  history: PortfolioHistoryPoint[];
};

export type PlaceOrderResponse = {
  order: OrderRecord;
  position: Position | null;
  portfolio: PortfolioSnapshot;
  marketSnapshot: Market | null;
};
