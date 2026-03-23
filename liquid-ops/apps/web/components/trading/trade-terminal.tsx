'use client';

import type { Candle, Market, OrderBookSnapshot, PortfolioSnapshot, Position, SimulatedOrderRequest } from '@liquid-ops/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cancelOrder, fetchCandles, fetchMarkets, fetchPortfolio, getWsUrl, placeOrder } from '../../lib/api';
import { MarketList } from '../markets/market-list';
import { AccountSummary } from '../portfolio/account-summary';
import { PortfolioHistoryCard } from '../portfolio/portfolio-history-card';
import { OpenOrdersCard } from './open-orders-card';
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

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 1000 ? 0 : 2 })}`;
}

export function TradeTerminal({ initialMarketSymbol = 'BTC-PERP' }: { initialMarketSymbol?: string }) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBookSnapshot | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState(initialMarketSymbol);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);

  const selectedMarket = useMemo(() => markets.find((market) => market.symbol === selectedSymbol) ?? markets[0] ?? null, [markets, selectedSymbol]);
  const selectedPosition = useMemo<Position | null>(() => portfolio?.positions.find((position) => position.marketSymbol === selectedSymbol) ?? null, [portfolio?.positions, selectedSymbol]);
  const orderFlow = useMemo(() => (portfolio?.recentOrders ?? []).slice(0, 8), [portfolio?.recentOrders]);
  const selectedOpenOrders = useMemo(() => (portfolio?.openOrders ?? []).filter((order) => order.marketSymbol === selectedSymbol), [portfolio?.openOrders, selectedSymbol]);

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
    const interval = setInterval(() => {
      fetchCandles(selectedSymbol)
        .then((response) => setCandles(response.candles))
        .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Failed to refresh candles'));
    }, 4000);

    return () => clearInterval(interval);
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
          return [...next, nextMarket].sort((a, b) => {
            if (a.symbol === 'BTC-PERP') return -1;
            if (b.symbol === 'BTC-PERP') return 1;
            return b.volume24h - a.volume24h;
          });
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
      setMessage(
        result.order.status === 'open'
          ? `${result.order.type} ${result.order.side.toUpperCase()} ${result.order.size} ${result.order.marketSymbol} armed at ${formatCurrency(result.order.requestedPrice ?? 0)}`
          : `${result.order.side.toUpperCase()} ${result.order.size} ${result.order.marketSymbol} filled at ${formatCurrency(result.order.fillPrice)}${result.order.realizedPnl ? ` • realized ${result.order.realizedPnl >= 0 ? '+' : ''}${formatCurrency(result.order.realizedPnl)}` : ''}`,
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Order request failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelOrder(orderId: string) {
    setCancelingOrderId(orderId);
    setError(null);
    try {
      const result = await cancelOrder(accountId, orderId);
      setPortfolio(result.portfolio);
      setMessage(`Canceled ${result.order.type} ${result.order.side.toUpperCase()} ${result.order.marketSymbol}`);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Cancel request failed');
    } finally {
      setCancelingOrderId(null);
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      {portfolio ? <AccountSummary account={portfolio.account} positions={portfolio.positions} openOrders={portfolio.openOrders} /> : null}
      {selectedMarket ? (
        <div className="card terminal-banner">
          <div className="row terminal-banner-row">
            <div>
              <div className="muted terminal-label">ACTIVE MARKET</div>
              <h3 style={{ marginBottom: 4 }}>{selectedMarket.symbol}</h3>
              <div className="muted" style={{ fontSize: 12 }}>
                {selectedMarket.baseAsset}/{selectedMarket.quoteAsset} • funding {(selectedMarket.fundingRate * 100).toFixed(3)}% • 24h volume {formatCurrency(selectedMarket.volume24h)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{formatCurrency(selectedMarket.markPrice)}</div>
              <div className={selectedMarket.change24h >= 0 ? 'tone-positive' : 'tone-negative'} style={{ fontSize: 13 }}>
                {selectedMarket.change24h >= 0 ? '+' : ''}{selectedMarket.change24h}% today
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
          {selectedMarket ? (
            <OrderTicket
              market={selectedMarket}
              position={selectedPosition}
              freeCollateral={portfolio?.account.freeCollateral ?? 0}
              onSubmit={handleOrder}
              isSubmitting={isSubmitting}
            />
          ) : null}
          <OpenOrdersCard orders={selectedOpenOrders} onCancel={handleCancelOrder} cancelingOrderId={cancelingOrderId} />
          <div className="card">
            <div className="row" style={{ marginBottom: 12 }}>
              <div>
                <h3>Recent Fills</h3>
                <div className="muted" style={{ fontSize: 12 }}>Latest trading activity with realized PnL context</div>
              </div>
              <div className="muted" style={{ fontSize: 12 }}>{orderFlow.length} entries</div>
            </div>
            <div className="grid" style={{ gap: 10 }}>
              {orderFlow.map((order) => (
                <div key={order.orderId} className="row order-row">
                  <div>
                    <div className="row" style={{ justifyContent: 'flex-start', gap: 8 }}>
                      <strong>{order.marketSymbol}</strong>
                      <span className={`pill ${order.side === 'buy' ? 'buy' : 'sell'}`}>{order.side}</span>
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {order.type} • {order.size} contracts • {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                    {order.closedSize ? <div className="muted" style={{ fontSize: 12 }}>Closed {order.closedSize} contracts</div> : null}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>{formatCurrency(order.fillPrice)}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{order.leverage.toFixed(1)}x leverage</div>
                    {typeof order.realizedPnl === 'number' ? (
                      <div className={order.realizedPnl >= 0 ? 'tone-positive' : 'tone-negative'} style={{ fontSize: 12 }}>
                        {order.realizedPnl >= 0 ? '+' : ''}{formatCurrency(order.realizedPnl)} realized
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {orderFlow.length === 0 ? <div className="muted">No recent filled activity yet.</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
