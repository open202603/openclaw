import type { VenueAdapter } from '../core/venue-adapter.js';
import type { CancelOrderRequest, MarketSnapshot, NormalizedOptionInstrument, PlaceOrderRequest, VenueBalance, VenuePosition } from '../core/types.js';
import { normalizeDeribitBookSummary } from '../core/market-normalizers.js';
import { normalizeDeribitOptionInstrument } from '../core/normalizers.js';
import { getJson } from '../utils/http.js';

export class DeribitOptionsAdapter implements VenueAdapter {
  readonly venue = 'deribit' as const;

  async loadInstruments(): Promise<NormalizedOptionInstrument[]> {
    const payload = await getJson<{
      result: Array<{
        instrument_name: string;
        base_currency: string;
        quote_currency: string;
        settlement_currency: string;
        expiration_timestamp: number;
        strike: number;
        option_type: string;
        contract_size?: number;
        tick_size?: number;
        min_trade_amount?: number;
      }>;
    }>('https://www.deribit.com/api/v2/public/get_instruments?currency=BTC&kind=option&expired=false');

    return payload.result.slice(0, 50).map(normalizeDeribitOptionInstrument);
  }

  async connectMarketData(onSnapshot: (snapshot: MarketSnapshot) => void): Promise<void> {
    await this.refreshMarketData(onSnapshot);
  }

  async refreshMarketData(onSnapshot: (snapshot: MarketSnapshot) => void): Promise<void> {
    const payload = await getJson<{
      result: Array<{
        instrument_name: string;
        bid_price?: number;
        ask_price?: number;
        mark_price?: number;
        mark_iv?: number;
        underlying_price?: number;
        creation_timestamp?: number;
      }>;
    }>('https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=BTC&kind=option');

    payload.result.slice(0, 50).map(normalizeDeribitBookSummary).forEach(onSnapshot);
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
