import type { PlaceOrderResponse, SimulatedOrderRequest } from '@liquid-ops/types';
import type { MarketDataService } from './market-data.service.js';
import type { PortfolioService } from './portfolio.service.js';
import type { RiskEngineService } from './risk-engine.service.js';

export class OrderService {
  constructor(
    private readonly marketData: MarketDataService,
    private readonly portfolioService: PortfolioService,
    private readonly riskEngine: RiskEngineService,
  ) {}

  placeSimulatedOrder(order: SimulatedOrderRequest): PlaceOrderResponse {
    const { market } = this.riskEngine.validateOrder(
      order.accountId,
      order.marketSymbol,
      order.side,
      order.size,
      order.leverage,
      order.price,
    );

    const fillPrice = order.type === 'market' ? market.markPrice : order.price ?? market.markPrice;
    const orderRecord = {
      orderId: `ord_${Date.now()}`,
      accountId: order.accountId,
      marketSymbol: order.marketSymbol,
      side: order.side,
      type: order.type,
      size: order.size,
      leverage: order.leverage,
      requestedPrice: order.price,
      fillPrice,
      status: 'filled' as const,
      createdAt: new Date().toISOString(),
    };

    const position = this.portfolioService.applyOrderFill(orderRecord);
    const portfolio = this.portfolioService.getPortfolioSnapshot(order.accountId);

    return {
      order: orderRecord,
      position,
      portfolio,
      marketSnapshot: this.marketData.getMarket(order.marketSymbol),
    };
  }
}
