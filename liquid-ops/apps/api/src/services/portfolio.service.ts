import type { AccountSnapshot, Position } from '@liquid-ops/types';
import type { MarketDataService } from './market-data.service.js';

const accountState: Record<string, AccountSnapshot> = {
  acc_demo_001: {
    accountId: 'acc_demo_001',
    equity: 100000,
    freeCollateral: 84210,
    usedMargin: 15790,
    realizedPnl: 2840,
    unrealizedPnl: 1920,
  },
};

const positionState: Record<string, Position[]> = {
  acc_demo_001: [
    { id: 'pos_1', marketSymbol: 'BTC-PERP', side: 'long', size: 0.85, entryPrice: 83120, markPrice: 84214, unrealizedPnl: 929.9, leverage: 5 },
  ],
};

export class PortfolioService {
  constructor(private readonly marketData: MarketDataService) {}

  getAccountSnapshot(accountId: string): AccountSnapshot {
    return accountState[accountId] ?? {
      accountId,
      equity: 100000,
      freeCollateral: 100000,
      usedMargin: 0,
      realizedPnl: 0,
      unrealizedPnl: 0,
    };
  }

  getPositions(accountId: string): Position[] {
    return positionState[accountId] ?? [];
  }

  applyOrderFill(accountId: string, marketSymbol: string, side: 'buy' | 'sell', size: number, fillPrice: number, leverage: number) {
    const market = this.marketData.getMarket(marketSymbol);
    const snapshot = this.getAccountSnapshot(accountId);
    const usedMarginDelta = (size * fillPrice) / leverage;

    snapshot.usedMargin += usedMarginDelta;
    snapshot.freeCollateral -= usedMarginDelta;
    accountState[accountId] = snapshot;

    const nextPosition: Position = {
      id: `pos_${Date.now()}`,
      marketSymbol,
      side: side === 'buy' ? 'long' : 'short',
      size,
      entryPrice: fillPrice,
      markPrice: market?.markPrice ?? fillPrice,
      unrealizedPnl: 0,
      leverage,
    };

    positionState[accountId] = [...this.getPositions(accountId), nextPosition];
    return nextPosition;
  }
}
