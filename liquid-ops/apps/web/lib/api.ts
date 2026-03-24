import type {
  Candle,
  DepositResponse,
  OrderBookSnapshot,
  PlaceOrderResponse,
  PortfolioHistoryPoint,
  PortfolioSnapshot,
  SimulatedOrderRequest,
} from '@liquid-ops/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getApiUrl() {
  return API_URL;
}

export function getWsUrl(path: string) {
  const url = new URL(path, API_URL);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

export async function fetchMarkets() {
  return getJson<{ markets: import('@liquid-ops/types').Market[] }>('/markets');
}

export async function fetchOrderBook(symbol: string) {
  return getJson<{ orderBook: OrderBookSnapshot }>(`/markets/${symbol}/order-book`);
}

export async function fetchCandles(symbol: string, points = 24) {
  return getJson<{ candles: Candle[] }>(`/markets/${symbol}/candles?points=${points}`);
}

export async function fetchPortfolio(accountId: string) {
  return getJson<PortfolioSnapshot>(`/portfolio/${accountId}`);
}

export async function fetchPortfolioHistory(accountId: string) {
  return getJson<{ history: PortfolioHistoryPoint[] }>(`/portfolio/${accountId}/history`);
}

export async function depositFunds(accountId: string, amount: number) {
  const response = await fetch(`${API_URL}/portfolio/${accountId}/deposit`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ amount }),
  });

  const body = (await response.json()) as DepositResponse | { message?: string };
  if (!response.ok) {
    throw new Error('message' in body && body.message ? body.message : 'Deposit request failed');
  }

  return body as DepositResponse;
}

export async function placeOrder(payload: SimulatedOrderRequest) {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as PlaceOrderResponse | { message?: string };
  if (!response.ok) {
    throw new Error('message' in body && body.message ? body.message : 'Order request failed');
  }

  return body as PlaceOrderResponse;
}

export async function cancelOrder(accountId: string, orderId: string) {
  const response = await fetch(`${API_URL}/orders/${orderId}?accountId=${encodeURIComponent(accountId)}`, {
    method: 'DELETE',
  });

  const body = (await response.json()) as PlaceOrderResponse | { message?: string };
  if (!response.ok) {
    throw new Error('message' in body && body.message ? body.message : 'Cancel request failed');
  }

  return body as PlaceOrderResponse;
}

export async function fetchOptionsLiveData() {
  return getJson<{
    generatedAt: number;
    instruments: Array<{
      venue: string;
      symbol: string;
      underlying: string;
      expiryTs: number;
      strike: number;
      optionSide: string;
      settlementCurrency: string;
    }>;
    snapshots: Array<{
      venue: string;
      symbol: string;
      bidPrice: number | null;
      askPrice: number | null;
      markPrice: number | null;
      indexPrice: number | null;
      impliedVol: number | null;
      delta?: number | null;
      gamma?: number | null;
      vega?: number | null;
      theta?: number | null;
      timestamp: number;
    }>;
  }>('/options/live');
}

export async function fetchOptionsAccountReadiness() {
  return getJson<{
    generatedAt: number;
    readiness: Array<{ venue: string; enabled: boolean }>;
  }>('/options/account-readiness');
}

export async function fetchOptionsAccountData() {
  return getJson<{
    generatedAt: number;
    balances: Array<{ venue: string; currency: string; total: number; available: number }>;
    positions: Array<{ venue: string; symbol: string; size: number; avgPrice: number; delta?: number; gamma?: number; vega?: number; theta?: number }>;
    openOrders: Array<{ venue: string; orderId: string; symbol: string; side: 'buy' | 'sell'; price: number; quantity: number; status: string; timestamp: number }>;
    fills: Array<{ venue: string; fillId: string; orderId: string; symbol: string; side: 'buy' | 'sell'; price: number; quantity: number; fee?: number; timestamp: number }>;
  }>('/options/account-data');
}
