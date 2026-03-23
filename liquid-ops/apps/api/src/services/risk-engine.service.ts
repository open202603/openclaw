import type { MarketDataService } from './market-data.service.js';
import type { PortfolioService } from './portfolio.service.js';

const round = (value: number) => Number(value.toFixed(2));

export class RiskEngineService {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly marketData: MarketDataService,
  ) {}

  validateOrder(accountId: string, marketSymbol: string, side: 'buy' | 'sell', size: number, leverage: number, price?: number, type: 'market' | 'limit' | 'stop-market' = 'market') {
    if (size <= 0) throw new Error('Order size must be greater than zero');
    if (leverage < 1 || leverage > 10) throw new Error('Leverage must be between 1x and 10x');
    if (type !== 'market' && (typeof price !== 'number' || price <= 0)) throw new Error('Price must be greater than zero');
    if (typeof price !== 'undefined' && price <= 0) throw new Error('Price must be greater than zero');

    const market = this.marketData.getMarket(marketSymbol);
    if (!market) throw new Error(`Unknown market: ${marketSymbol}`);

    if (type === 'stop-market' && typeof price === 'number') {
      if (side === 'buy' && price <= market.markPrice) {
        throw new Error('Buy stop trigger must be above the current mark price');
      }
      if (side === 'sell' && price >= market.markPrice) {
        throw new Error('Sell stop trigger must be below the current mark price');
      }
    }

    const snapshot = this.portfolioService.getPortfolioSnapshot(accountId);
    const existing = snapshot.positions.find((position) => position.marketSymbol === marketSymbol.toUpperCase()) ?? null;
    const incomingSide = side === 'buy' ? 'long' : 'short';
    const referencePrice = price ?? market.markPrice;

    let marginBearingSize = size;
    if (existing && existing.side !== incomingSide) {
      marginBearingSize = Math.max(0, size - existing.size);
    }

    const requiredMargin = round((marginBearingSize * referencePrice) / leverage);
    if (requiredMargin > snapshot.account.freeCollateral) {
      throw new Error('Insufficient free collateral for this order');
    }

    return { market, requiredMargin, referencePrice };
  }
}
