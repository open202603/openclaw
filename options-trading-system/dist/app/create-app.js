import { loadConfig } from '../config/load-config.js';
import { AccountService } from '../services/account-service.js';
import { ExecutionService } from '../services/execution-service.js';
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
    const marketDataService = new MarketDataService(adapters);
    const accountService = new AccountService(adapters);
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
            console.log('[app] venues =', adapters.map((adapter) => adapter.venue).join(', '));
            await marketDataService.start();
            await accountService.start();
            for (const strategy of strategies) {
                strategy.register({ marketDataService, accountService, executionService, riskEngine });
            }
            console.log('[app] system bootstrapped');
        },
    };
}
