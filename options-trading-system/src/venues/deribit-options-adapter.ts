import type { VenueAdapter } from '../core/venue-adapter.js';
import type { CancelOrderRequest, MarketSnapshot, NormalizedOptionInstrument, PlaceOrderRequest, VenueBalance, VenuePosition } from '../core/types.js';

export class DeribitOptionsAdapter implements VenueAdapter {
  readonly venue = 'deribit' as const;

  async loadInstruments(): Promise<NormalizedOptionInstrument[]> {
    return [];
  }

  async connectMarketData(onSnapshot: (snapshot: MarketSnapshot) => void): Promise<void> {
    onSnapshot({
      venue: this.venue,
      symbol: 'BTC-TEST',
      bidPrice: null,
      askPrice: null,
      bidSize: null,
      askSize: null,
      markPrice: null,
      indexPrice: null,
      impliedVol: null,
      timestamp: Date.now(),
    });
  }

  async syncBalances(): Promise<VenueBalance[]> {
    return [];
  }

  async syncPositions(): Promise<VenuePosition[]> {
    return [];
  }

  async placeOrder(_request: PlaceOrderRequest): Promise<{ orderId: string }> {
    return { orderId: 'deribit-placeholder' };
  }

  async cancelOrder(_request: CancelOrderRequest): Promise<void> {}
}
