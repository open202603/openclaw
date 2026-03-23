import type { AccountSnapshot, OrderRecord, PortfolioSnapshot, Position } from '@liquid-ops/types';
import type { MarketDataService } from './market-data.service.js';

type AccountState = AccountSnapshot & {
  startingEquity: number;
};

const seededAccounts: Record<string, AccountState> = {
  acc_demo_001: {
    accountId: 'acc_demo_001',
    equity: 100000,
    freeCollateral: 84210,
    usedMargin: 15790,
    realizedPnl: 2840,
    unrealizedPnl: 0,
    startingEquity: 100000,
  },
};

const seededPositions: Record<string, Position[]> = {
  acc_demo_001: [
    {
      id: 'pos_seed_btc',
      marketSymbol: 'BTC-PERP',
      side: 'long',
      size: 0.85,
      entryPrice: 83120,
      markPrice: 84214,
      unrealizedPnl: 929.9,
      leverage: 5,
      notional: 71581.9,
      liquidationPrice: 66496,
    },
    {
      id: 'pos_seed_eth',
      marketSymbol: 'ETH-PERP',
      side: 'short',
      size: 12,
      entryPrice: 4720,
      markPrice: 4682,
      unrealizedPnl: 456,
      leverage: 3,
      notional: 56184,
      liquidationPrice: 6293.33,
    },
  ],
};

const seededOrders: Record<string, OrderRecord[]> = {
  acc_demo_001: [
    {
      orderId: 'ord_seed_001',
      accountId: 'acc_demo_001',
      marketSymbol: 'BTC-PERP',
      side: 'buy',
      type: 'market',
      size: 0.15,
      leverage: 5,
      fillPrice: 83980,
      status: 'filled',
      createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    },
  ],
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export class PortfolioService {
  private readonly accountState = clone(seededAccounts);
  private readonly positionState = clone(seededPositions);
  private readonly orderState = clone(seededOrders);

  constructor(private readonly marketData: MarketDataService) {
    this.refreshAccount('acc_demo_001');
  }

  private ensureAccount(accountId: string) {
    if (!this.accountState[accountId]) {
      this.accountState[accountId] = {
        accountId,
        equity: 50000,
        freeCollateral: 50000,
        usedMargin: 0,
        realizedPnl: 0,
        unrealizedPnl: 0,
        startingEquity: 50000,
      };
      this.positionState[accountId] = [];
      this.orderState[accountId] = [];
    }

    return this.accountState[accountId];
  }

  private computeUnrealized(position: Position, markPrice: number) {
    const priceDelta = position.side === 'long' ? markPrice - position.entryPrice : position.entryPrice - markPrice;
    return Number((priceDelta * position.size).toFixed(2));
  }

  private computeLiquidationPrice(side: 'long' | 'short', entryPrice: number, leverage: number) {
    const move = entryPrice / Math.max(leverage, 1);
    return Number((side === 'long' ? entryPrice - move : entryPrice + move).toFixed(2));
  }

  refreshAccount(accountId: string): PortfolioSnapshot {
    const account = this.ensureAccount(accountId);
    const positions = this.getPositions(accountId);
    const unrealizedPnl = positions.reduce((sum, position) => sum + position.unrealizedPnl, 0);
    const usedMargin = positions.reduce((sum, position) => sum + position.notional / position.leverage, 0);

    account.unrealizedPnl = Number(unrealizedPnl.toFixed(2));
    account.usedMargin = Number(usedMargin.toFixed(2));
    account.equity = Number((account.startingEquity + account.realizedPnl + account.unrealizedPnl).toFixed(2));
    account.freeCollateral = Number((account.equity - account.usedMargin).toFixed(2));

    const { startingEquity: _startingEquity, ...publicAccount } = account;

    return {
      account: publicAccount,
      positions,
      recentOrders: this.getRecentOrders(accountId),
    };
  }

  getAccountSnapshot(accountId: string): AccountSnapshot {
    return this.refreshAccount(accountId).account;
  }

  getPositions(accountId: string): Position[] {
    this.ensureAccount(accountId);
    return (this.positionState[accountId] ?? []).map((position) => {
      const market = this.marketData.getMarket(position.marketSymbol);
      const markPrice = market?.markPrice ?? position.markPrice;
      const notional = Number((markPrice * position.size).toFixed(2));
      return {
        ...position,
        markPrice,
        notional,
        unrealizedPnl: this.computeUnrealized(position, markPrice),
        liquidationPrice: this.computeLiquidationPrice(position.side, position.entryPrice, position.leverage),
      };
    });
  }

  getRecentOrders(accountId: string): OrderRecord[] {
    this.ensureAccount(accountId);
    return [...(this.orderState[accountId] ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12);
  }

  getPortfolioSnapshot(accountId: string): PortfolioSnapshot {
    return this.refreshAccount(accountId);
  }

  applyOrderFill(order: OrderRecord) {
    const accountId = order.accountId;
    this.ensureAccount(accountId);

    const side = order.side === 'buy' ? 'long' : 'short';
    const currentPositions = this.getPositions(accountId);
    const nextPosition: Position = {
      id: `pos_${Date.now()}`,
      marketSymbol: order.marketSymbol,
      side,
      size: order.size,
      entryPrice: order.fillPrice,
      markPrice: order.fillPrice,
      unrealizedPnl: 0,
      leverage: order.leverage,
      notional: Number((order.size * order.fillPrice).toFixed(2)),
      liquidationPrice: this.computeLiquidationPrice(side, order.fillPrice, order.leverage),
    };

    this.positionState[accountId] = [nextPosition, ...currentPositions].slice(0, 20);
    this.orderState[accountId] = [order, ...(this.orderState[accountId] ?? [])].slice(0, 50);

    this.refreshAccount(accountId);
    return nextPosition;
  }
}
