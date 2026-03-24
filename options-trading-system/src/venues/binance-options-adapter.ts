import type { VenueAdapter } from '../core/venue-adapter.js';
import type { CancelOrderRequest, MarketSnapshot, NormalizedOptionInstrument, PlaceOrderRequest, VenueBalance, VenuePosition } from '../core/types.js';
import { normalizeBinanceMark } from '../core/market-normalizers.js';
import { normalizeBinanceOptionInstrument } from '../core/normalizers.js';
import { getJson } from '../utils/http.js';

export class BinanceOptionsAdapter implements VenueAdapter {
  readonly venue = 'binance-options' as const;

  async loadInstruments(): Promise<NormalizedOptionInstrument[]> {
    const payload = await getJson<{
      optionSymbols: Array<{
        symbol: string;
        expiryDate: number;
        strikePrice: string;
        side: string;
        unit: number;
        filters?: Array<{ filterType: string; minQty?: string; tickSize?: string }>;
      }>;
    }>('https://eapi.binance.com/eapi/v1/exchangeInfo');

    return payload.optionSymbols
      .filter((item) => item.symbol.startsWith('BTC-'))
      .slice(0, 50)
      .map((item) => {
        const lotFilter = item.filters?.find((filter) => filter.filterType === 'LOT_SIZE');
        const priceFilter = item.filters?.find((filter) => filter.filterType === 'PRICE_FILTER');
        return normalizeBinanceOptionInstrument({
          symbol: item.symbol,
          underlying: 'BTC',
          quoteAsset: 'USDT',
          settlementAsset: 'USDT',
          expiryDate: item.expiryDate,
          strikePrice: item.strikePrice,
          side: item.side,
          contractMultiplier: item.unit,
          tickSize: priceFilter?.tickSize,
          lotSize: lotFilter?.minQty,
        });
      });
  }

  async connectMarketData(onSnapshot: (snapshot: MarketSnapshot) => void): Promise<void> {
    const payload = await getJson<Array<{
      symbol: string;
      markPrice: string;
      markIV?: string;
      delta?: string;
      gamma?: string;
      vega?: string;
      theta?: string;
    }>>('https://eapi.binance.com/eapi/v1/mark');

    payload
      .filter((item) => item.symbol.startsWith('BTC-'))
      .slice(0, 50)
      .map(normalizeBinanceMark)
      .forEach(onSnapshot);
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
