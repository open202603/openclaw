import type { AccountSnapshot, Market, Position } from '@liquid-ops/types';

export const mockMarkets: Market[] = [
  { symbol: 'BTC-PERP', baseAsset: 'BTC', quoteAsset: 'USD', markPrice: 84214, indexPrice: 84201, change24h: 3.2, volume24h: 1203400000 },
  { symbol: 'ETH-PERP', baseAsset: 'ETH', quoteAsset: 'USD', markPrice: 4682, indexPrice: 4676, change24h: 2.1, volume24h: 843000000 },
  { symbol: 'SOL-PERP', baseAsset: 'SOL', quoteAsset: 'USD', markPrice: 214, indexPrice: 213.7, change24h: -1.4, volume24h: 351000000 },
];

export const mockAccount: AccountSnapshot = {
  accountId: 'acc_demo_001',
  equity: 100000,
  freeCollateral: 84210,
  usedMargin: 15790,
  realizedPnl: 2840,
  unrealizedPnl: 1920,
};

export const mockPositions: Position[] = [
  { id: 'pos_1', marketSymbol: 'BTC-PERP', side: 'long', size: 0.85, entryPrice: 83120, markPrice: 84214, unrealizedPnl: 929.9, leverage: 5 },
  { id: 'pos_2', marketSymbol: 'ETH-PERP', side: 'short', size: 12, entryPrice: 4720, markPrice: 4682, unrealizedPnl: 456, leverage: 3 },
];
