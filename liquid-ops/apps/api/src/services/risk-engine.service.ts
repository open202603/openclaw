import type { MarketDataService } from './market-data.service.js';
import type { PortfolioService } from './portfolio.service.js';

export class RiskEngineService {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly marketData: MarketDataService,
  ) {}

  validateOrder(accountId: string, marketSymbol: string, size: number, leverage: number, price?: number) {
    const market = this.marketData.getMarket(marketSymbol);
    if (!market) throw new Error(`Unknown market: ${marketSymbol}`);

    const snapshot = this.portfolioService.getAccountSnapshot(accountId);
    const referencePrice = price ?? market.markPrice;
    const requiredMargin = (size * referencePrice) / leverage;

    if (requiredMargin > snapshot.freeCollateral) {
      throw new Error('Insufficient free collateral for this order');
    }

    return { market, requiredMargin };
  }
}
