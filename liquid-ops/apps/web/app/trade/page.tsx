import { AccountSummary } from '../../components/portfolio/account-summary';
import { MarketList } from '../../components/markets/market-list';
import { OrderBookCard } from '../../components/trading/order-book-card';
import { OrderTicket } from '../../components/trading/order-ticket';
import { PositionsTable } from '../../components/trading/positions-table';
import { PriceChartCard } from '../../components/trading/price-chart-card';
import { mockAccount, mockMarkets, mockPositions } from '../../lib/mock-data';

export default function TradePage() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <AccountSummary account={mockAccount} />
      <div className="grid grid-terminal">
        <div className="grid">
          <MarketList markets={mockMarkets} />
          <OrderBookCard />
        </div>
        <div className="grid">
          <PriceChartCard />
          <PositionsTable positions={mockPositions} />
        </div>
        <div className="grid">
          <OrderTicket market={mockMarkets[0]} />
        </div>
      </div>
    </div>
  );
}
