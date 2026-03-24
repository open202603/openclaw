import type {
  CancelOrderRequest,
  MarketSnapshot,
  NormalizedOptionInstrument,
  PlaceOrderRequest,
  Venue,
  VenueBalance,
  VenuePosition,
} from './types.js';

export interface VenueAdapter {
  readonly venue: Venue;
  loadInstruments(): Promise<NormalizedOptionInstrument[]>;
  connectMarketData(onSnapshot: (snapshot: MarketSnapshot) => void): Promise<void>;
  syncBalances(): Promise<VenueBalance[]>;
  syncPositions(): Promise<VenuePosition[]>;
  placeOrder(request: PlaceOrderRequest): Promise<{ orderId: string }>;
  cancelOrder(request: CancelOrderRequest): Promise<void>;
}
