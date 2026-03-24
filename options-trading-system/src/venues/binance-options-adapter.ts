import type { VenueAdapter } from '../core/venue-adapter.js';
import type { CancelOrderRequest, MarketSnapshot, NormalizedOptionInstrument, PlaceOrderRequest, VenueBalance, VenuePosition } from '../core/types.js';
import { sampleBinanceInstrument } from './sample-instruments.js';

export class BinanceOptionsAdapter implements VenueAdapter {
  readonly venue = 'binance-options' as const;

  async loadInstruments(): Promise<NormalizedOptionInstrument[]> {
    return [sampleBinanceInstrument];
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
    return { orderId: 'binance-placeholder' };
  }

  async cancelOrder(_request: CancelOrderRequest): Promise<void> {}
}
