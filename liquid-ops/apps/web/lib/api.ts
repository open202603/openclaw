import type {
  Candle,
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
