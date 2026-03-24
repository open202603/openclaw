import type {
  CancelOrderRequest,
  MarketSnapshot,
  NormalizedOptionInstrument,
  PlaceOrderRequest,
  Venue,
  VenueBalance,
  VenueFill,
  VenueOrder,
  VenuePosition,
} from './types.js';

export interface VenueAdapter {
  readonly venue: Venue;
  loadInstruments(): Promise<NormalizedOptionInstrument[]>;
  connectMarketData(onSnapshot: (snapshot: MarketSnapshot) => void): Promise<void>;
  refreshMarketData?(onSnapshot: (snapshot: MarketSnapshot) => void): Promise<void>;
  syncBalances(): Promise<VenueBalance[]>;
  syncPositions(): Promise<VenuePosition[]>;
  syncOpenOrders?(): Promise<VenueOrder[]>;
  syncFills?(): Promise<VenueFill[]>;
  placeOrder(request: PlaceOrderRequest): Promise<{ orderId: string }>;
  cancelOrder(request: CancelOrderRequest): Promise<void>;
}
