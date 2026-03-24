import type { VenueAdapter } from '../core/venue-adapter.js';
import type { CancelOrderRequest, MarketSnapshot, NormalizedOptionInstrument, PlaceOrderRequest, VenueBalance, VenuePosition } from '../core/types.js';
import { normalizeBybitOptionInstrument } from '../core/normalizers.js';
import { getJson } from '../utils/http.js';

export class BybitOptionsAdapter implements VenueAdapter {
  readonly venue = 'bybit-options' as const;

  async loadInstruments(): Promise<NormalizedOptionInstrument[]> {
    const payload = await getJson<{
      result: {
        list: Array<{
          symbol: string;
          baseCoin: string;
          settleCoin: string;
          deliveryTime: string;
          strike: string;
          optionsType: string;
          priceFilter?: { tickSize?: string };
          lotSizeFilter?: { qtyStep?: string };
        }>;
      };
    }>('https://api.bybit.com/v5/market/instruments-info?category=option&baseCoin=BTC');

    return payload.result.list.slice(0, 50).map(normalizeBybitOptionInstrument);
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
    return { orderId: 'bybit-placeholder' };
  }

  async cancelOrder(_request: CancelOrderRequest): Promise<void> {}
}
