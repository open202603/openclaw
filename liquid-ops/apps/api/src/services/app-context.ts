import { MarketDataService } from './market-data.service.js';
import { OrderService } from './order.service.js';
import { PortfolioService } from './portfolio.service.js';
import { RiskEngineService } from './risk-engine.service.js';

export function buildAppContext() {
  const marketData = new MarketDataService();
  const portfolioService = new PortfolioService(marketData);
  const riskEngine = new RiskEngineService(portfolioService, marketData);
  const orderService = new OrderService(marketData, portfolioService, riskEngine);

  return {
    marketData,
    portfolioService,
    riskEngine,
    orderService,
  };
}
