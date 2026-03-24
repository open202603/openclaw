import { getJson } from '../utils/http.js';

type DeribitTokenResponse = {
  result?: { access_token?: string };
};

export class DeribitPrivateClient {
  constructor(
    private readonly credentials: {
      apiKey?: string;
      apiSecret?: string;
      enabled: boolean;
    },
  ) {}

  async authenticate() {
    if (!this.credentials.enabled || !this.credentials.apiKey || !this.credentials.apiSecret) {
      return null;
    }

    const url = new URL('https://www.deribit.com/api/v2/public/auth');
    url.searchParams.set('grant_type', 'client_credentials');
    url.searchParams.set('client_id', this.credentials.apiKey);
    url.searchParams.set('client_secret', this.credentials.apiSecret);

    try {
      const payload = await getJson<DeribitTokenResponse>(url.toString());
      return payload.result?.access_token ?? null;
    } catch {
      return null;
    }
  }

  private async privateGet<T>(path: string, search: Record<string, string>) {
    const token = await this.authenticate();
    if (!token) return null;

    const url = new URL(`https://www.deribit.com/api/v2/${path}`);
    Object.entries(search).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set('access_token', token);

    try {
      return await getJson<T>(url.toString());
    } catch {
      return null;
    }
  }

  async getAccountSummary(currency: 'BTC' | 'ETH' = 'BTC') {
    return this.privateGet<{
      result?: {
        currency?: string;
        balance?: number;
        available_funds?: number;
      };
    }>('private/get_account_summary', { currency });
  }

  async getPositions(currency: 'BTC' | 'ETH' = 'BTC') {
    return this.privateGet<{
      result?: Array<{
        instrument_name: string;
        size: number;
        average_price?: number;
        delta?: number;
        gamma?: number;
        vega?: number;
        theta?: number;
      }>;
    }>('private/get_positions', { currency, kind: 'option' });
  }

  async getOpenOrders(currency: 'BTC' | 'ETH' = 'BTC') {
    return this.privateGet<{
      result?: Array<{
        order_id: string;
        instrument_name: string;
        direction: 'buy' | 'sell';
        price: number;
        amount: number;
        order_state: string;
        creation_timestamp: number;
      }>;
    }>('private/get_open_orders_by_currency', { currency, kind: 'option' });
  }

  async getUserTrades(currency: 'BTC' | 'ETH' = 'BTC') {
    return this.privateGet<{
      result?: {
        trades?: Array<{
          trade_id: string;
          order_id: string;
          instrument_name: string;
          direction: 'buy' | 'sell';
          price: number;
          amount: number;
          fee?: number;
          timestamp: number;
        }>;
      };
    }>('private/get_user_trades_by_currency', { currency, kind: 'option', count: '20' });
  }
}
