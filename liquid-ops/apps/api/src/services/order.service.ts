import type { OrderRecord, PlaceOrderResponse, SimulatedOrderRequest } from '@liquid-ops/types';
import type { MarketDataService } from './market-data.service.js';
import type { PersistenceService } from './persistence.service.js';
import type { PortfolioService } from './portfolio.service.js';
import type { RiskEngineService } from './risk-engine.service.js';

function shouldFillImmediately(order: SimulatedOrderRequest, markPrice: number) {
  if (order.type === 'market') return true;
  if (typeof order.price !== 'number') return false;

  if (order.type === 'limit') {
    return order.side === 'buy' ? markPrice <= order.price : markPrice >= order.price;
  }

  return order.side === 'buy' ? markPrice >= order.price : markPrice <= order.price;
}

export class OrderService {
  constructor(
    private readonly marketData: MarketDataService,
    private readonly portfolioService: PortfolioService,
    private readonly riskEngine: RiskEngineService,
    private readonly persistence: PersistenceService,
  ) {}

  private buildOrderRecord(
    order: SimulatedOrderRequest,
    status: OrderRecord['status'],
    options?: { fillPrice?: number; reservedMargin?: number; triggerPrice?: number },
  ): OrderRecord {
    const now = new Date().toISOString();
    return {
      orderId: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      accountId: order.accountId,
      marketSymbol: order.marketSymbol.toUpperCase(),
      side: order.side,
      type: order.type,
      size: order.size,
      leverage: order.leverage,
      requestedPrice: order.type === 'limit' ? order.price : undefined,
      triggerPrice: order.type === 'stop-market' ? order.price : undefined,
      fillPrice: options?.fillPrice ?? 0,
      reservedMargin: options?.reservedMargin,
      status,
      createdAt: now,
      updatedAt: now,
      filledAt: status === 'filled' ? now : undefined,
    };
  }

  placeSimulatedOrder(order: SimulatedOrderRequest): PlaceOrderResponse {
    const { market, requiredMargin } = this.riskEngine.validateOrder(
      order.accountId,
      order.marketSymbol,
      order.side,
      order.size,
      order.leverage,
      order.price,
      order.type,
    );

    if (shouldFillImmediately(order, market.markPrice)) {
      const fillPrice = order.type === 'market'
        ? market.markPrice
        : order.type === 'limit'
          ? order.price ?? market.markPrice
          : market.markPrice;
      const orderRecord = this.buildOrderRecord(order, 'filled', { fillPrice, reservedMargin: 0, triggerPrice: order.price });
      const position = this.portfolioService.applyOrderFill(orderRecord);
      const portfolio = this.portfolioService.getPortfolioSnapshot(order.accountId);

      return {
        order: { ...orderRecord, status: 'filled' },
        position,
        portfolio,
        marketSnapshot: this.marketData.getMarket(order.marketSymbol),
      };
    }

    const orderRecord = this.buildOrderRecord(order, 'open', {
      reservedMargin: requiredMargin,
      triggerPrice: order.type === 'stop-market' ? order.price : undefined,
    });
    this.persistence.insertOrder(orderRecord);
    const portfolio = this.portfolioService.refreshAccount(order.accountId, { emit: true, recordHistory: true });

    return {
      order: orderRecord,
      position: portfolio.positions.find((position) => position.marketSymbol === order.marketSymbol.toUpperCase()) ?? null,
      portfolio,
      marketSnapshot: this.marketData.getMarket(order.marketSymbol),
    };
  }

  processTriggeredOrders(marketSymbol: string) {
    const market = this.marketData.getMarket(marketSymbol);
    if (!market) return;

    const openOrders = this.persistence.getOpenOrdersBySymbol(market.symbol);
    for (const order of openOrders) {
      if (!shouldFillImmediately({
        accountId: order.accountId,
        marketSymbol: order.marketSymbol,
        side: order.side,
        type: order.type,
        size: order.size,
        price: order.type === 'limit' ? order.requestedPrice : order.triggerPrice,
        leverage: order.leverage,
      }, market.markPrice)) {
        continue;
      }

      const fillPrice = order.type === 'limit'
        ? order.requestedPrice ?? market.markPrice
        : market.markPrice;
      const now = new Date().toISOString();
      const filledOrder: OrderRecord = {
        ...order,
        status: 'filled',
        fillPrice,
        reservedMargin: 0,
        updatedAt: now,
        filledAt: now,
      };
      this.portfolioService.applyOrderFill(filledOrder);
    }
  }

  cancelOrder(accountId: string, orderId: string) {
    const order = this.persistence.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    if (order.accountId !== accountId) {
      throw new Error('Order does not belong to this account');
    }
    if (order.status !== 'open') {
      throw new Error('Only open orders can be canceled');
    }

    const canceledOrder: OrderRecord = {
      ...order,
      status: 'canceled',
      reservedMargin: 0,
      updatedAt: new Date().toISOString(),
      canceledAt: new Date().toISOString(),
    };
    this.persistence.updateOrder(canceledOrder);
    const portfolio = this.portfolioService.refreshAccount(accountId, { emit: true, recordHistory: true });

    return {
      order: canceledOrder,
      position: portfolio.positions.find((position) => position.marketSymbol === canceledOrder.marketSymbol) ?? null,
      portfolio,
      marketSnapshot: this.marketData.getMarket(canceledOrder.marketSymbol),
    } satisfies PlaceOrderResponse;
  }
}
