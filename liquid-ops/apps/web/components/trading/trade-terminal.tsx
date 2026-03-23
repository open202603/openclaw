'use client';

import type { Candle, Market, OrderBookSnapshot, PortfolioSnapshot, SimulatedOrderRequest } from '@liquid-ops/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCandles, fetchMarkets, fetchOrderBook, fetchPortfolio, placeOrder } from '../../lib/api';
import { AccountSummary } from '../portfolio/account-summary';
import { MarketList } from '../markets/market-list';
import { OrderBookCard } from './order-book-card';
import { OrderTicket } from './order-ticket';
import { PositionsTable } from './positions-table';
import { PriceChartCard } from './price-chart-card';

const accountId = 'acc_demo_001';

export function TradeTerminal({ initialMarketSymbol = 'BTC-PERP' }: { initialMarketSymbol?: string }) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBookSnapshot | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState(initialMarketSymbol);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMarket = useMemo(() => markets.find((market) => market.symbol === selectedSymbol) ?? markets[0] ?? null, [markets, selectedSymbol]);

  const loadSnapshots = useCallback(async () => {
    const [marketResponse, portfolioResponse] = await Promise.all([fetchMarkets(), fetchPortfolio(accountId)]);
    setMarkets(marketResponse.markets);
    setPortfolio(portfolioResponse);

    const symbol = selectedMarket?.symbol ?? selectedSymbol;
    const [orderBookResponse, candleResponse] = await Promise.all([fetchOrderBook(symbol), fetchCandles(symbol)]);
    setOrderBook(orderBookResponse.orderBook);
    setCandles(candleResponse.candles);
  }, [selectedMarket?.symbol, selectedSymbol]);

  useEffect(() => {
    loadSnapshots().catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Failed to load market data'));
    const timer = setInterval(() => {
      loadSnapshots().catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Failed to refresh market data'));
    }, 2500);

    return () => clearInterval(timer);
  }, [loadSnapshots]);

  async function handleOrder(payload: SimulatedOrderRequest) {
    setIsSubmitting(true);
    try {
      const result = await placeOrder(payload);
      setPortfolio(result.portfolio);
      setMessage(`${result.order.side.toUpperCase()} ${result.order.size} ${result.order.marketSymbol} filled at $${result.order.fillPrice.toLocaleString()}`);
      await loadSnapshots();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      {portfolio ? <AccountSummary account={portfolio.account} /> : null}
      {message ? <div className="card success-banner">{message}</div> : null}
      {error ? <div className="card error-banner">{error}</div> : null}
      <div className="grid grid-terminal">
        <div className="grid">
          <MarketList markets={markets} selectedSymbol={selectedMarket?.symbol} onSelect={setSelectedSymbol} />
          <OrderBookCard orderBook={orderBook} />
        </div>
        <div className="grid">
          <PriceChartCard candles={candles} />
          <PositionsTable positions={portfolio?.positions ?? []} />
        </div>
        <div className="grid">
          {selectedMarket ? <OrderTicket market={selectedMarket} onSubmit={handleOrder} isSubmitting={isSubmitting} /> : null}
          <div className="card">
            <h3>Recent Orders</h3>
            <div className="grid" style={{ gap: 10 }}>
              {(portfolio?.recentOrders ?? []).slice(0, 6).map((order) => (
                <div key={order.orderId} className="row order-row">
                  <div>
                    <strong>{order.marketSymbol}</strong>
                    <div className="muted" style={{ fontSize: 12 }}>{order.side.toUpperCase()} • {order.type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>${order.fillPrice.toLocaleString()}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{order.size} contracts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
