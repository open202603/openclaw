import type { VenueAdapter } from '../core/venue-adapter.js';
import type { CancelOrderRequest, MarketSnapshot, NormalizedOptionInstrument, PlaceOrderRequest, VenueBalance, VenuePosition } from '../core/types.js';
import { normalizeOkxTicker } from '../core/market-normalizers.js';
import { normalizeOkxOptionInstrument } from '../core/normalizers.js';
import { getJson } from '../utils/http.js';

export class OkxOptionsAdapter implements VenueAdapter {
  readonly venue = 'okx-options' as const;

  async loadInstruments(): Promise<NormalizedOptionInstrument[]> {
    const payload = await getJson<{
      data: Array<{
        instId: string;
        uly: string;
        settleCcy: string;
        expTime: string;
        stk: string;
        optType: string;
        tickSz?: string;
        lotSz?: string;
      }>;
    }>('https://www.okx.com/api/v5/public/instruments?instType=OPTION&uly=BTC-USD');

    return payload.data.slice(0, 50).map(normalizeOkxOptionInstrument);
  }

  async connectMarketData(onSnapshot: (snapshot: MarketSnapshot) => void): Promise<void> {
    await this.refreshMarketData(onSnapshot);
  }

  async refreshMarketData(onSnapshot: (snapshot: MarketSnapshot) => void): Promise<void> {
    const payload = await getJson<{
      data: Array<{
        instId: string;
        bidPx?: string;
        askPx?: string;
        bidSz?: string;
        askSz?: string;
        last?: string;
        ts?: string;
      }>;
    }>('https://www.okx.com/api/v5/market/tickers?instType=OPTION&uly=BTC-USD');

    payload.data.slice(0, 50).map(normalizeOkxTicker).forEach(onSnapshot);
  }

  async syncBalances(): Promise<VenueBalance[]> {
    return [];
  }

  async syncPositions(): Promise<VenuePosition[]> {
    return [];
  }

  async placeOrder(_request: PlaceOrderRequest): Promise<{ orderId: string }> {
    return { orderId: 'okx-placeholder' };
  }

  async cancelOrder(_request: CancelOrderRequest): Promise<void> {}
}
