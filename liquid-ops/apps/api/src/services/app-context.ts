import { MarketDataService } from './market-data.service.js';
import { OrderService } from './order.service.js';
import { PersistenceService } from './persistence.service.js';
import { PortfolioService } from './portfolio.service.js';
import { RiskEngineService } from './risk-engine.service.js';

export function buildAppContext() {
  const persistence = new PersistenceService(process.env.LIQUID_OPS_DB_PATH);
  const marketData = new MarketDataService();
  const portfolioService = new PortfolioService(marketData, persistence);
  const riskEngine = new RiskEngineService(portfolioService, marketData);
  const orderService = new OrderService(marketData, portfolioService, riskEngine, persistence);

  marketData.on('market.tick', (symbol: string) => {
    orderService.processTriggeredOrders(symbol);
    portfolioService.refreshAllAccounts({ emit: true, recordHistory: true });
  });

  return {
    persistence,
    marketData,
    portfolioService,
    riskEngine,
    orderService,
  };
}
