import type { MarketDataService } from './market-data.service.js';
import type { PortfolioService } from './portfolio.service.js';

export class RiskEngineService {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly marketData: MarketDataService,
  ) {}

  validateOrder(accountId: string, marketSymbol: string, size: number, leverage: number, price?: number) {
    if (size <= 0) throw new Error('Order size must be greater than zero');
    if (leverage < 1 || leverage > 10) throw new Error('Leverage must be between 1x and 10x');

    const market = this.marketData.getMarket(marketSymbol);
    if (!market) throw new Error(`Unknown market: ${marketSymbol}`);

    const snapshot = this.portfolioService.getAccountSnapshot(accountId);
    const referencePrice = price ?? market.markPrice;
    const requiredMargin = Number(((size * referencePrice) / leverage).toFixed(2));

    if (requiredMargin > snapshot.freeCollateral) {
      throw new Error('Insufficient free collateral for this order');
    }

    return { market, requiredMargin };
  }
}
