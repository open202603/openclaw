import type { MarketSnapshot } from './types.js';

function num(value: string | number | null | undefined): number | null {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeBinanceMark(raw: {
  symbol: string;
  markPrice: string;
  markIV?: string;
  delta?: string;
  gamma?: string;
  vega?: string;
  theta?: string;
}): MarketSnapshot {
  return {
    venue: 'binance-options',
    symbol: raw.symbol,
    bidPrice: null,
    askPrice: null,
    bidSize: null,
    askSize: null,
    markPrice: num(raw.markPrice),
    indexPrice: null,
    impliedVol: num(raw.markIV),
    delta: num(raw.delta),
    gamma: num(raw.gamma),
    vega: num(raw.vega),
    theta: num(raw.theta),
    timestamp: Date.now(),
  };
}

export function normalizeDeribitBookSummary(raw: {
  instrument_name: string;
  bid_price?: number;
  ask_price?: number;
  mark_price?: number;
  mark_iv?: number;
  underlying_price?: number;
  creation_timestamp?: number;
}): MarketSnapshot {
  return {
    venue: 'deribit',
    symbol: raw.instrument_name,
    bidPrice: num(raw.bid_price),
    askPrice: num(raw.ask_price),
    bidSize: null,
    askSize: null,
    markPrice: num(raw.mark_price),
    indexPrice: num(raw.underlying_price),
    impliedVol: num(raw.mark_iv),
    timestamp: raw.creation_timestamp ?? Date.now(),
  };
}

export function normalizeOkxTicker(raw: {
  instId: string;
  bidPx?: string;
  askPx?: string;
  bidSz?: string;
  askSz?: string;
  last?: string;
  ts?: string;
}): MarketSnapshot {
  return {
    venue: 'okx-options',
    symbol: raw.instId,
    bidPrice: num(raw.bidPx),
    askPrice: num(raw.askPx),
    bidSize: num(raw.bidSz),
    askSize: num(raw.askSz),
    markPrice: num(raw.last),
    indexPrice: null,
    impliedVol: null,
    timestamp: raw.ts ? Number(raw.ts) : Date.now(),
  };
}

export function normalizeBybitTicker(raw: {
  symbol: string;
  bid1Price?: string;
  ask1Price?: string;
  bid1Size?: string;
  ask1Size?: string;
  markPrice?: string;
  indexPrice?: string;
  markIv?: string;
  delta?: string;
  gamma?: string;
  vega?: string;
  theta?: string;
}): MarketSnapshot {
  return {
    venue: 'bybit-options',
    symbol: raw.symbol,
    bidPrice: num(raw.bid1Price),
    askPrice: num(raw.ask1Price),
    bidSize: num(raw.bid1Size),
    askSize: num(raw.ask1Size),
    markPrice: num(raw.markPrice),
    indexPrice: num(raw.indexPrice),
    impliedVol: num(raw.markIv),
    delta: num(raw.delta),
    gamma: num(raw.gamma),
    vega: num(raw.vega),
    theta: num(raw.theta),
    timestamp: Date.now(),
  };
}
