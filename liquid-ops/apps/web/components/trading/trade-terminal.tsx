'use client';

import type { Candle, Market, OrderBookSnapshot, PortfolioSnapshot, SimulatedOrderRequest } from '@liquid-ops/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCandles, fetchMarkets, fetchPortfolio, getWsUrl, placeOrder } from '../../lib/api';
import { MarketList } from '../markets/market-list';
import { AccountSummary } from '../portfolio/account-summary';
import { PortfolioHistoryCard } from '../portfolio/portfolio-history-card';
import { OrderBookCard } from './order-book-card';
import { OrderTicket } from './order-ticket';
import { PositionsTable } from './positions-table';
import { PriceChartCard } from './price-chart-card';

const accountId = 'acc_demo_001';

type MarketSocketPayload = {
  type: 'market.snapshot';
  market: Market | null;
  orderBook: OrderBookSnapshot | null;
};

type AccountSocketPayload = {
  type: 'account.snapshot';
  portfolio: PortfolioSnapshot;
};

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

  const loadBaseData = useCallback(async () => {
    const [marketResponse, portfolioResponse, candleResponse] = await Promise.all([
      fetchMarkets(),
      fetchPortfolio(accountId),
      fetchCandles(selectedSymbol),
    ]);

    setMarkets(marketResponse.markets);
    setPortfolio(portfolioResponse);
    setCandles(candleResponse.candles);
  }, [selectedSymbol]);

  useEffect(() => {
    loadBaseData().catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Failed to load market data'));
  }, [loadBaseData]);

  useEffect(() => {
    fetchCandles(selectedSymbol)
      .then((response) => setCandles(response.candles))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Failed to refresh candles'));
  }, [selectedSymbol]);

  useEffect(() => {
    const socket = new WebSocket(getWsUrl(`/ws/markets/${selectedSymbol}`));

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as MarketSocketPayload;
      if (payload.type !== 'market.snapshot') return;
      if (payload.market) {
        const nextMarket = payload.market;
        setMarkets((current) => {
          const next = current.filter((market) => market.symbol !== nextMarket.symbol);
          return [...next, nextMarket].sort((a, b) => b.volume24h - a.volume24h);
        });
      }
      setOrderBook(payload.orderBook);
    };

    socket.onerror = () => setError('Market websocket disconnected');
    return () => socket.close();
  }, [selectedSymbol]);

  useEffect(() => {
    const socket = new WebSocket(getWsUrl(`/ws/account/${accountId}`));

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as AccountSocketPayload;
      if (payload.type === 'account.snapshot') {
        setPortfolio(payload.portfolio);
      }
    };

    socket.onerror = () => setError('Account websocket disconnected');
    return () => socket.close();
  }, []);

  async function handleOrder(payload: SimulatedOrderRequest) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await placeOrder(payload);
      setPortfolio(result.portfolio);
      setMessage(`${result.order.side.toUpperCase()} ${result.order.size} ${result.order.marketSymbol} filled at $${result.order.fillPrice.toLocaleString()}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Order request failed');
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
          <PortfolioHistoryCard history={portfolio?.history ?? []} />
        </div>
        <div className="grid">
          {selectedMarket ? <OrderTicket market={selectedMarket} onSubmit={handleOrder} isSubmitting={isSubmitting} /> : null}
          <div className="card">
            <h3>Recent Orders</h3>
            <div className="grid" style={{ gap: 10 }}>
              {(portfolio?.recentOrders ?? []).slice(0, 8).map((order) => (
                <div key={order.orderId} className="row order-row">
                  <div>
                    <strong>{order.marketSymbol}</strong>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {order.side.toUpperCase()} • {order.type}
                      {order.closedSize ? ` • closed ${order.closedSize}` : ''}
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>{new Date(order.createdAt).toLocaleTimeString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>${order.fillPrice.toLocaleString()}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{order.size} contracts</div>
                    {order.realizedPnl ? (
                      <div style={{ color: order.realizedPnl >= 0 ? '#7ef0b2' : '#ff9eaa', fontSize: 12 }}>
                        {order.realizedPnl >= 0 ? '+' : ''}${order.realizedPnl.toLocaleString()} realized
                      </div>
                    ) : null}
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
