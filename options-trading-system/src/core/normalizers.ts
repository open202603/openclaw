import type { NormalizedOptionInstrument, OptionSide, Venue } from './types.js';

function inferOptionSide(raw: string): OptionSide {
  const value = raw.toLowerCase();
  if (value === 'c' || value === 'call') return 'call';
  if (value === 'p' || value === 'put') return 'put';
  throw new Error(`unknown option side: ${raw}`);
}

export function normalizeInstrument(input: {
  venue: Venue;
  symbol: string;
  underlying: string;
  quoteCurrency: string;
  settlementCurrency: string;
  expiryTs: number;
  strike: number;
  optionSide: string;
  contractMultiplier?: number;
  tickSize?: number;
  lotSize?: number;
}): NormalizedOptionInstrument {
  return {
    venue: input.venue,
    symbol: input.symbol,
    underlying: input.underlying,
    quoteCurrency: input.quoteCurrency,
    settlementCurrency: input.settlementCurrency,
    expiryTs: input.expiryTs,
    strike: input.strike,
    optionSide: inferOptionSide(input.optionSide),
    contractMultiplier: input.contractMultiplier ?? 1,
    tickSize: input.tickSize ?? 0.1,
    lotSize: input.lotSize ?? 1,
  };
}

export function normalizeBinanceOptionInstrument(raw: {
  symbol: string;
  underlying: string;
  quoteAsset: string;
  settlementAsset: string;
  expiryDate: number;
  strikePrice: string | number;
  side: string;
}): NormalizedOptionInstrument {
  return normalizeInstrument({
    venue: 'binance-options',
    symbol: raw.symbol,
    underlying: raw.underlying,
    quoteCurrency: raw.quoteAsset,
    settlementCurrency: raw.settlementAsset,
    expiryTs: raw.expiryDate,
    strike: Number(raw.strikePrice),
    optionSide: raw.side,
  });
}

export function normalizeDeribitOptionInstrument(raw: {
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
}): NormalizedOptionInstrument {
  return normalizeInstrument({
    venue: 'deribit',
    symbol: raw.instrument_name,
    underlying: raw.base_currency,
    quoteCurrency: raw.quote_currency,
    settlementCurrency: raw.settlement_currency,
    expiryTs: raw.expiration_timestamp,
    strike: raw.strike,
    optionSide: raw.option_type,
    contractMultiplier: raw.contract_size,
    tickSize: raw.tick_size,
    lotSize: raw.min_trade_amount,
  });
}

export function normalizeOkxOptionInstrument(raw: {
  instId: string;
  uly: string;
  settleCcy: string;
  expTime: string | number;
  stk: string | number;
  optType: string;
  tickSz?: string | number;
  lotSz?: string | number;
}): NormalizedOptionInstrument {
  const [underlying] = raw.uly.split('-');
  return normalizeInstrument({
    venue: 'okx-options',
    symbol: raw.instId,
    underlying,
    quoteCurrency: 'USD',
    settlementCurrency: raw.settleCcy,
    expiryTs: Number(raw.expTime),
    strike: Number(raw.stk),
    optionSide: raw.optType,
    tickSize: raw.tickSz ? Number(raw.tickSz) : undefined,
    lotSize: raw.lotSz ? Number(raw.lotSz) : undefined,
  });
}

export function normalizeBybitOptionInstrument(raw: {
  symbol: string;
  baseCoin: string;
  settleCoin: string;
  deliveryTime: string | number;
  strike: string | number;
  optionsType: string;
  priceFilter?: { tickSize?: string };
  lotSizeFilter?: { qtyStep?: string };
}): NormalizedOptionInstrument {
  return normalizeInstrument({
    venue: 'bybit-options',
    symbol: raw.symbol,
    underlying: raw.baseCoin,
    quoteCurrency: 'USD',
    settlementCurrency: raw.settleCoin,
    expiryTs: Number(raw.deliveryTime),
    strike: Number(raw.strike),
    optionSide: raw.optionsType,
    tickSize: raw.priceFilter?.tickSize ? Number(raw.priceFilter.tickSize) : undefined,
    lotSize: raw.lotSizeFilter?.qtyStep ? Number(raw.lotSizeFilter.qtyStep) : undefined,
  });
}
