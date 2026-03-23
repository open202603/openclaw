import type { SimulatedOrderRequest } from '@liquid-ops/types';
import type { MarketDataService } from './market-data.service.js';
import type { PortfolioService } from './portfolio.service.js';
import type { RiskEngineService } from './risk-engine.service.js';

export class OrderService {
  constructor(
    private readonly marketData: MarketDataService,
    private readonly portfolioService: PortfolioService,
    private readonly riskEngine: RiskEngineService,
  ) {}

  placeSimulatedOrder(order: SimulatedOrderRequest) {
    const { market } = this.riskEngine.validateOrder(
      order.accountId,
      order.marketSymbol,
      order.size,
      order.leverage,
      order.price,
    );

    const fillPrice = order.type === 'market' ? market.markPrice : order.price ?? market.markPrice;
    const position = this.portfolioService.applyOrderFill(
      order.accountId,
      order.marketSymbol,
      order.side,
      order.size,
      fillPrice,
      order.leverage,
    );

    return {
      orderId: `ord_${Date.now()}`,
      status: 'filled',
      fillPrice,
      position,
      marketSnapshot: this.marketData.getMarket(order.marketSymbol),
    };
  }
}
