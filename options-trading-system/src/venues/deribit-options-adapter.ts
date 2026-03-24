import type { VenueAdapter } from '../core/venue-adapter.js';
import type { CancelOrderRequest, MarketSnapshot, NormalizedOptionInstrument, PlaceOrderRequest, VenueBalance, VenuePosition } from '../core/types.js';
import { normalizeDeribitBookSummary } from '../core/market-normalizers.js';
import { normalizeDeribitOptionInstrument } from '../core/normalizers.js';
import { getJson } from '../utils/http.js';
import { DeribitPrivateClient } from './deribit-private-client.js';

export class DeribitOptionsAdapter implements VenueAdapter {
  readonly venue = 'deribit' as const;
  private readonly privateClient: DeribitPrivateClient;

  constructor(
    private readonly privateConfig: {
      apiKey?: string;
      apiSecret?: string;
      enabled?: boolean;
    } = {},
  ) {
    this.privateClient = new DeribitPrivateClient({
      apiKey: privateConfig.apiKey,
      apiSecret: privateConfig.apiSecret,
      enabled: Boolean(privateConfig.enabled),
    });
  }

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
    if (!this.privateConfig.enabled) return [];
    const payload = await this.privateClient.getAccountSummary('BTC');
    if (!payload?.result?.currency) return [];
    return [{
      venue: this.venue,
      currency: payload.result.currency,
      total: payload.result.balance ?? 0,
      available: payload.result.available_funds ?? 0,
    }];
  }

  async syncPositions(): Promise<VenuePosition[]> {
    if (!this.privateConfig.enabled) return [];
    const payload = await this.privateClient.getPositions('BTC');
    return (payload?.result ?? []).map((item) => ({
      venue: this.venue,
      symbol: item.instrument_name,
      size: item.size,
      avgPrice: item.average_price ?? 0,
      delta: item.delta,
      gamma: item.gamma,
      vega: item.vega,
      theta: item.theta,
    }));
  }

  async syncOpenOrders() {
    if (!this.privateConfig.enabled) return [];
    const payload = await this.privateClient.getOpenOrders('BTC');
    return (payload?.result ?? []).map((item) => ({
      venue: this.venue,
      orderId: item.order_id,
      symbol: item.instrument_name,
      side: item.direction,
      price: item.price,
      quantity: item.amount,
      status: (
        item.order_state === 'open'
          ? 'open'
          : item.order_state === 'filled'
            ? 'filled'
            : item.order_state === 'cancelled'
              ? 'cancelled'
              : item.order_state === 'rejected'
                ? 'rejected'
                : 'partial'
      ) as 'open' | 'filled' | 'cancelled' | 'rejected' | 'partial',
      timestamp: item.creation_timestamp,
    }));
  }

  async syncFills() {
    if (!this.privateConfig.enabled) return [];
    const payload = await this.privateClient.getUserTrades('BTC');
    return (payload?.result?.trades ?? []).map((item) => ({
      venue: this.venue,
      fillId: item.trade_id,
      orderId: item.order_id,
      symbol: item.instrument_name,
      side: item.direction,
      price: item.price,
      quantity: item.amount,
      fee: item.fee,
      timestamp: item.timestamp,
    }));
  }

  async placeOrder(_request: PlaceOrderRequest): Promise<{ orderId: string }> {
    return { orderId: 'deribit-placeholder' };
  }

  async cancelOrder(_request: CancelOrderRequest): Promise<void> {}
}
