import { EventEmitter } from 'node:events';
import type { AccountSnapshot, OrderRecord, PortfolioSnapshot, Position } from '@liquid-ops/types';
import type { MarketDataService } from './market-data.service.js';
import type { PersistenceService } from './persistence.service.js';

const round = (value: number, decimals = 2) => Number(value.toFixed(decimals));

export class PortfolioService extends EventEmitter {
  constructor(
    private readonly marketData: MarketDataService,
    private readonly persistence: PersistenceService,
  ) {
    super();
  }

  private ensureAccount(accountId: string) {
    const existing = this.persistence.getAccount(accountId);
    if (existing) return existing;

    const created = {
      accountId,
      startingEquity: 50000,
      realizedPnl: 0,
    };
    this.persistence.saveAccount(created);
    return created;
  }

  private computeUnrealized(position: Pick<Position, 'side' | 'entryPrice' | 'size'>, markPrice: number) {
    const priceDelta = position.side === 'long' ? markPrice - position.entryPrice : position.entryPrice - markPrice;
    return round(priceDelta * position.size);
  }

  private computeLiquidationPrice(side: 'long' | 'short', entryPrice: number, leverage: number) {
    const move = entryPrice / Math.max(leverage, 1);
    return round(side === 'long' ? entryPrice - move : entryPrice + move);
  }

  private hydratePositions(accountId: string): Position[] {
    this.ensureAccount(accountId);
    return this.persistence.getPositions(accountId).map((position) => {
      const market = this.marketData.getMarket(position.marketSymbol);
      const markPrice = market?.markPrice ?? position.entryPrice;
      return {
        ...position,
        markPrice,
        notional: round(markPrice * position.size),
        unrealizedPnl: this.computeUnrealized(position, markPrice),
        liquidationPrice: this.computeLiquidationPrice(position.side, position.entryPrice, position.leverage),
      };
    });
  }

  private computeOrderReservedMargin(order: OrderRecord, positions: Position[]) {
    if (order.status !== 'open') return 0;

    const referencePrice = order.type === 'stop-market'
      ? (order.triggerPrice ?? order.requestedPrice)
      : (order.requestedPrice ?? this.marketData.getMarket(order.marketSymbol)?.markPrice ?? 0);

    if (!referencePrice || referencePrice <= 0) {
      return round(order.reservedMargin ?? 0);
    }

    const current = positions.find((position) => position.marketSymbol === order.marketSymbol) ?? null;
    const incomingSide: Position['side'] = order.side === 'buy' ? 'long' : 'short';
    const marginBearingSize = current && current.side !== incomingSide
      ? Math.max(0, order.size - current.size)
      : order.size;

    return round((marginBearingSize * referencePrice) / Math.max(order.leverage, 1));
  }

  private recordHistory(accountId: string, snapshot: PortfolioSnapshot) {
    this.persistence.insertHistoryPoint({
      accountId,
      timestamp: new Date().toISOString(),
      equity: snapshot.account.equity,
      freeCollateral: snapshot.account.freeCollateral,
      usedMargin: snapshot.account.usedMargin,
      realizedPnl: snapshot.account.realizedPnl,
      unrealizedPnl: snapshot.account.unrealizedPnl,
    });
  }

  refreshAccount(accountId: string, options?: { emit?: boolean; recordHistory?: boolean }): PortfolioSnapshot {
    const account = this.ensureAccount(accountId);
    const positions = this.hydratePositions(accountId);
    const unrealizedPnl = round(positions.reduce((sum, position) => sum + position.unrealizedPnl, 0));
    const positionMargin = round(positions.reduce((sum, position) => sum + position.notional / position.leverage, 0));
    const openOrders = this.getOpenOrders(accountId, undefined, positions);
    const reservedOrderMargin = round(openOrders.reduce((sum, order) => sum + this.computeOrderReservedMargin(order, positions), 0));
    const usedMargin = round(positionMargin + reservedOrderMargin);
    const equity = round(account.startingEquity + account.realizedPnl + unrealizedPnl);
    const freeCollateral = round(equity - usedMargin);

    const snapshot: PortfolioSnapshot = {
      account: {
        accountId,
        equity,
        freeCollateral,
        usedMargin,
        positionMargin,
        reservedOrderMargin,
        realizedPnl: round(account.realizedPnl),
        unrealizedPnl,
      },
      positions,
      recentOrders: this.getRecentOrders(accountId),
      openOrders,
      history: this.persistence.getHistory(accountId, 40),
    };

    if (options?.recordHistory) {
      const lastPoint = snapshot.history.at(-1);
      const materiallyChanged = !lastPoint
        || Math.abs(lastPoint.equity - snapshot.account.equity) >= 1
        || Math.abs(lastPoint.unrealizedPnl - snapshot.account.unrealizedPnl) >= 1
        || Math.abs(lastPoint.usedMargin - snapshot.account.usedMargin) >= 1;
      if (materiallyChanged) {
        this.recordHistory(accountId, snapshot);
        snapshot.history = this.persistence.getHistory(accountId, 40);
      }
    }

    if (options?.emit) {
      this.emit('account.updated', accountId, snapshot);
    }

    return snapshot;
  }

  refreshAllAccounts(options?: { emit?: boolean; recordHistory?: boolean }) {
    for (const accountId of this.persistence.listAccountIds()) {
      this.refreshAccount(accountId, options);
    }
  }

  getAccountSnapshot(accountId: string): AccountSnapshot {
    return this.refreshAccount(accountId).account;
  }

  getPositions(accountId: string): Position[] {
    return this.refreshAccount(accountId).positions;
  }

  getRecentOrders(accountId: string): OrderRecord[] {
    this.ensureAccount(accountId);
    return this.persistence.getRecentOrders(accountId, 20);
  }

  getOpenOrders(accountId: string, marketSymbol?: string, hydratedPositions?: Position[]): OrderRecord[] {
    this.ensureAccount(accountId);
    const positions = hydratedPositions ?? this.hydratePositions(accountId);
    return this.persistence.getOpenOrders(accountId, marketSymbol, 20).map((order) => ({
      ...order,
      reservedMargin: this.computeOrderReservedMargin(order, positions),
    }));
  }

  getPortfolioSnapshot(accountId: string): PortfolioSnapshot {
    return this.refreshAccount(accountId, { recordHistory: true });
  }

  getPortfolioHistory(accountId: string) {
    this.ensureAccount(accountId);
    return this.persistence.getHistory(accountId, 60);
  }

  applyOrderFill(order: OrderRecord) {
    const account = this.ensureAccount(order.accountId);
    const existingPositions = this.persistence.getPositions(order.accountId);
    const current = existingPositions.find((position) => position.marketSymbol === order.marketSymbol) ?? null;
    const incomingSide: Position['side'] = order.side === 'buy' ? 'long' : 'short';
    const nextPositions = existingPositions.filter((position) => position.marketSymbol !== order.marketSymbol);

    let nextPosition: Position | null = null;
    let realizedPnl = 0;
    let closedSize = 0;

    if (!current) {
      nextPosition = {
        id: `pos_${Date.now()}`,
        marketSymbol: order.marketSymbol,
        side: incomingSide,
        size: order.size,
        entryPrice: order.fillPrice,
        markPrice: order.fillPrice,
        unrealizedPnl: 0,
        leverage: order.leverage,
        notional: round(order.size * order.fillPrice),
        liquidationPrice: this.computeLiquidationPrice(incomingSide, order.fillPrice, order.leverage),
        updatedAt: order.filledAt ?? order.createdAt,
      };
    } else if (current.side === incomingSide) {
      const nextSize = round(current.size + order.size, 6);
      const weightedEntry = round(((current.entryPrice * current.size) + (order.fillPrice * order.size)) / nextSize);
      const weightedLeverage = round(((current.leverage * current.size) + (order.leverage * order.size)) / nextSize, 2);
      nextPosition = {
        ...current,
        size: nextSize,
        entryPrice: weightedEntry,
        leverage: weightedLeverage,
        updatedAt: order.filledAt ?? order.createdAt,
      };
    } else {
      closedSize = Math.min(current.size, order.size);
      const perUnitPnl = current.side === 'long' ? order.fillPrice - current.entryPrice : current.entryPrice - order.fillPrice;
      realizedPnl = round(closedSize * perUnitPnl);

      if (order.size < current.size) {
        nextPosition = {
          ...current,
          size: round(current.size - order.size, 6),
          updatedAt: order.filledAt ?? order.createdAt,
        };
      } else if (order.size > current.size) {
        nextPosition = {
          id: `pos_${Date.now()}`,
          marketSymbol: order.marketSymbol,
          side: incomingSide,
          size: round(order.size - current.size, 6),
          entryPrice: order.fillPrice,
          markPrice: order.fillPrice,
          unrealizedPnl: 0,
          leverage: order.leverage,
          notional: round((order.size - current.size) * order.fillPrice),
          liquidationPrice: this.computeLiquidationPrice(incomingSide, order.fillPrice, order.leverage),
          updatedAt: order.filledAt ?? order.createdAt,
        };
      }
    }

    account.realizedPnl = round(account.realizedPnl + realizedPnl);
    this.persistence.saveAccount(account);
    this.persistence.replacePositions(order.accountId, nextPosition ? [nextPosition, ...nextPositions] : nextPositions);

    const persistedOrder: OrderRecord = {
      ...order,
      status: 'filled',
      reservedMargin: 0,
      updatedAt: order.filledAt ?? new Date().toISOString(),
      realizedPnl: realizedPnl || undefined,
      closedSize: closedSize || undefined,
    };
    this.persistence.updateOrder(persistedOrder);

    const snapshot = this.refreshAccount(order.accountId, { emit: true, recordHistory: true });
    return snapshot.positions.find((position) => position.marketSymbol === order.marketSymbol) ?? null;
  }
}
