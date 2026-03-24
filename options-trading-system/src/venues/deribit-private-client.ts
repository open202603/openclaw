import { getJson } from '../utils/http.js';

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
      const payload = await getJson<{
        result?: { access_token?: string };
      }>(url.toString());
      return payload.result?.access_token ?? null;
    } catch {
      return null;
    }
  }

  async getAccountSummary(_currency: 'BTC' | 'ETH' = 'BTC') {
    const token = await this.authenticate();
    if (!token) return null;
    return { tokenAvailable: true };
  }
}
