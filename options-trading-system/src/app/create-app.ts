import { loadConfig } from '../config/load-config.js';
import { AccountReadinessService } from '../services/account-readiness-service.js';
import { AccountService } from '../services/account-service.js';
import { ExecutionService } from '../services/execution-service.js';
import { InstrumentRegistry } from '../services/instrument-registry.js';
import { MarketDataService } from '../services/market-data-service.js';
import { RiskEngine } from '../services/risk-engine.js';
import { ArbitrageStrategy } from '../strategies/arbitrage-strategy.js';
import { MarketMakingStrategy } from '../strategies/market-making-strategy.js';
import { BinanceOptionsAdapter } from '../venues/binance-options-adapter.js';
import { BybitOptionsAdapter } from '../venues/bybit-options-adapter.js';
import { DeribitOptionsAdapter } from '../venues/deribit-options-adapter.js';
import { OkxOptionsAdapter } from '../venues/okx-options-adapter.js';

export function createApp() {
  const config = loadConfig();

  const adapters = [
    new BinanceOptionsAdapter(),
    new DeribitOptionsAdapter(),
    new OkxOptionsAdapter(),
    new BybitOptionsAdapter(),
  ];

  const instrumentRegistry = new InstrumentRegistry(adapters);
  const marketDataService = new MarketDataService(adapters, config.marketDataRefreshMs);
  const accountService = new AccountService(adapters);
  const accountReadinessService = new AccountReadinessService(config.credentials);
  const riskEngine = new RiskEngine(config.risk);
  const executionService = new ExecutionService({ mode: config.executionMode, adapters, riskEngine });

  const strategies = [
    new ArbitrageStrategy(),
    new MarketMakingStrategy(),
  ];

  return {
    async start() {
      console.log('[app] starting options trading system');
      console.log('[app] execution mode =', config.executionMode);
      console.log('[app] market data refresh ms =', config.marketDataRefreshMs);
      console.log('[app] venues =', adapters.map((adapter) => adapter.venue).join(', '));

      await instrumentRegistry.loadAll();
      await marketDataService.start();
      await accountService.start();
      console.log('[accounts] venue credential readiness =', accountReadinessService.getSummary());

      for (const strategy of strategies) {
        strategy.register({ marketDataService, accountService, executionService, riskEngine });
      }

      console.log('[app] system bootstrapped');
    },
  };
}
