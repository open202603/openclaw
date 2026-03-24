import {
  normalizeBinanceOptionInstrument,
  normalizeBybitOptionInstrument,
  normalizeDeribitOptionInstrument,
  normalizeOkxOptionInstrument,
} from '../core/normalizers.js';

export const sampleBinanceInstrument = normalizeBinanceOptionInstrument({
  symbol: 'BTC-250329-100000-C',
  underlying: 'BTC',
  quoteAsset: 'USDT',
  settlementAsset: 'USDT',
  expiryDate: 1743206400000,
  strikePrice: '100000',
  side: 'CALL',
});

export const sampleDeribitInstrument = normalizeDeribitOptionInstrument({
  instrument_name: 'BTC-29MAR25-100000-C',
  base_currency: 'BTC',
  quote_currency: 'USD',
  settlement_currency: 'BTC',
  expiration_timestamp: 1743206400000,
  strike: 100000,
  option_type: 'call',
  contract_size: 1,
  tick_size: 0.0005,
  min_trade_amount: 0.1,
});

export const sampleOkxInstrument = normalizeOkxOptionInstrument({
  instId: 'BTC-USD-250329-100000-C',
  uly: 'BTC-USD',
  settleCcy: 'BTC',
  expTime: '1743206400000',
  stk: '100000',
  optType: 'C',
  tickSz: '0.1',
  lotSz: '0.1',
});

export const sampleBybitInstrument = normalizeBybitOptionInstrument({
  symbol: 'BTC-29MAR25-100000-C',
  baseCoin: 'BTC',
  settleCoin: 'USDC',
  deliveryTime: '1743206400000',
  strike: '100000',
  optionsType: 'Call',
  priceFilter: { tickSize: '0.1' },
  lotSizeFilter: { qtyStep: '0.1' },
});
