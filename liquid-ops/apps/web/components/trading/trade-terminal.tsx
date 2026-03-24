'use client';

import type { Candle, Market, OrderBookSnapshot, PortfolioSnapshot, Position, SimulatedOrderRequest } from '@liquid-ops/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cancelOrder, depositFunds, fetchCandles, fetchMarkets, fetchPortfolio, getWsUrl, placeOrder } from '../../lib/api';
import { mockCandles, mockMarkets, mockOrderBooks, mockPortfolio } from '../../lib/mock-data';
import { FundingCard } from '../account/funding-card';
import { TopbarWalletCta } from '../layout/topbar-wallet-cta';
import { MarketList } from '../markets/market-list';
import { AccountSummary } from '../portfolio/account-summary';
import { AssetCompositionCard } from '../portfolio/asset-composition-card';
import { PortfolioHistoryCard } from '../portfolio/portfolio-history-card';
import { OpenOrdersCard } from './open-orders-card';
import { OrderBookCard } from './order-book-card';
import { OrderTicket } from './order-ticket';
import { PositionsTable } from './positions-table';
import { PriceChartCard } from './price-chart-card';

const accountId = 'acc_demo_001';

type ViewMode = 'trade' | 'portfolio' | 'markets';

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

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: value >= 1_000_000 ? 2 : 1,
  }).format(value);
}

export function TradeTerminal({
  initialMarketSymbol = 'BTC-PERP',
  view = 'trade',
  initialAccessMode = 'demo',
  initialShowDepositMessage = false,
}: {
  initialMarketSymbol?: string;
  view?: ViewMode;
  initialAccessMode?: 'demo' | 'wallet';
  initialShowDepositMessage?: boolean;
}) {
  const [markets, setMarkets] = useState<Market[]>(mockMarkets);
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(mockPortfolio);
  const [orderBook, setOrderBook] = useState<OrderBookSnapshot | null>(mockOrderBooks[initialMarketSymbol] ?? mockOrderBooks['BTC-PERP']);
  const [candles, setCandles] = useState<Candle[]>(mockCandles[initialMarketSymbol] ?? mockCandles['BTC-PERP']);
  const [selectedSymbol, setSelectedSymbol] = useState(initialMarketSymbol);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const [isDepositing, setIsDepositing] = useState(false);
  const [accessMode, setAccessMode] = useState<'demo' | 'wallet'>(initialAccessMode);

  const selectedMarket = useMemo(() => markets.find((market) => market.symbol === selectedSymbol) ?? markets[0] ?? null, [markets, selectedSymbol]);
  const selectedPosition = useMemo<Position | null>(() => portfolio?.positions.find((position) => position.marketSymbol === selectedSymbol) ?? null, [portfolio?.positions, selectedSymbol]);
  const orderFlow = useMemo(() => (portfolio?.recentOrders ?? []).slice(0, 8), [portfolio?.recentOrders]);
  const selectedOrderFlow = useMemo(() => orderFlow.filter((order) => order.marketSymbol === selectedSymbol), [orderFlow, selectedSymbol]);
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
    setError(null);
  }, [selectedSymbol]);

  useEffect(() => {
    setOrderBook(mockOrderBooks[selectedSymbol] ?? null);
    setCandles(mockCandles[selectedSymbol] ?? []);
  }, [selectedSymbol]);

  useEffect(() => {
    loadBaseData().catch((loadError) => setError(loadError instanceof Error ? `${loadError.message}. Showing seeded demo market state.` : 'Failed to load live market data'));
  }, [loadBaseData]);

  useEffect(() => {
    if (!initialShowDepositMessage) return;
    setMessage('Deposit rail is open — top up the demo account to immediately increase deployable collateral.');
  }, [initialShowDepositMessage]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCandles(selectedSymbol)
        .then((response) => {
          setCandles(response.candles);
          setError(null);
        })
        .catch((loadError) => setError(loadError instanceof Error ? `${loadError.message}. Keeping demo candles visible.` : 'Failed to refresh candles'));
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
      if (payload.orderBook) {
        setOrderBook(payload.orderBook);
      }
    };

    socket.onerror = () => setError('Market websocket disconnected. Using last known depth.');
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

    socket.onerror = () => setError('Account websocket disconnected. Showing last synced account state.');
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
          ? `${result.order.type} ${result.order.side.toUpperCase()} ${result.order.size} ${result.order.marketSymbol} armed at ${formatCurrency(result.order.requestedPrice ?? result.order.triggerPrice ?? 0)}`
          : `${result.order.side.toUpperCase()} ${result.order.size} ${result.order.marketSymbol} filled at ${formatCurrency(result.order.fillPrice)}${result.order.realizedPnl ? ` • realized ${result.order.realizedPnl >= 0 ? '+' : ''}${formatCurrency(result.order.realizedPnl)}` : ''}`,
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Order request failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeposit(amount: number) {
    setIsDepositing(true);
    setError(null);
    try {
      const result = await depositFunds(accountId, amount);
      setPortfolio(result.portfolio);
      setMessage(`${formatCurrency(result.amount)} added to demo collateral. Free collateral is now ${formatCurrency(result.portfolio.account.freeCollateral)}.`);
    } catch (depositError) {
      setError(depositError instanceof Error ? depositError.message : 'Deposit request failed');
      throw depositError;
    } finally {
      setIsDepositing(false);
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

  const selectedMarketStats = useMemo(() => {
    if (!selectedMarket) return null;

    const spread = orderBook?.spread ?? Math.abs(selectedMarket.markPrice - selectedMarket.indexPrice);
    const spreadBps = selectedMarket.markPrice > 0 ? (spread / selectedMarket.markPrice) * 10_000 : 0;
    const basis = selectedMarket.markPrice - selectedMarket.indexPrice;
    const range = Math.max(selectedMarket.high24h - selectedMarket.low24h, 1);
    const rangeProgress = ((selectedMarket.markPrice - selectedMarket.low24h) / range) * 100;
    const distanceToHigh = selectedMarket.high24h - selectedMarket.markPrice;
    const distanceToLow = selectedMarket.markPrice - selectedMarket.low24h;
    const bidTop = orderBook?.bids[0] ?? null;
    const askTop = orderBook?.asks[0] ?? null;
    const bidDepth = orderBook?.bids.reduce((sum, level) => sum + level.size, 0) ?? 0;
    const askDepth = orderBook?.asks.reduce((sum, level) => sum + level.size, 0) ?? 0;
    const depthSkew = bidDepth + askDepth > 0 ? (bidDepth / (bidDepth + askDepth)) * 100 : 50;
    const marketFillCount = orderFlow.filter((order) => order.marketSymbol === selectedMarket.symbol).length;
    const thesis = selectedMarket.symbol === 'BTC-PERP'
      ? selectedMarket.change24h >= 0
        ? 'BTC is acting like the anchor contract: deepest book, highest volume, and the cleanest path for the desk to feel instantly tradable.'
        : 'BTC is in pullback mode, which makes the terminal read like a real decision surface instead of a permanently bullish demo.'
      : selectedMarket.symbol === 'ETH-PERP'
        ? 'ETH keeps the desk high-beta and rotational, sitting between BTC leadership and faster intraday repositioning.'
        : 'SOL provides the faster lane — more momentum, more velocity, and a clearer “risk-on / risk-off” visual swing.';

    return {
      spread,
      spreadBps,
      basis,
      rangeProgress,
      distanceToHigh,
      distanceToLow,
      bidTop,
      askTop,
      bidDepth,
      askDepth,
      depthSkew,
      marketFillCount,
      thesis,
    };
  }, [selectedMarket, orderBook, orderFlow]);

  const executionSummary = useMemo(() => {
    if (!portfolio || !selectedMarket) return null;

    const selectedReservedMargin = selectedOpenOrders.reduce((sum, order) => sum + (order.reservedMargin ?? 0), 0);
    const recentFill = selectedOrderFlow[0] ?? null;
    const grossExposure = portfolio.positions.reduce((sum, position) => sum + position.notional, 0);
    const selectedExposureShare = grossExposure > 0 && selectedPosition ? (selectedPosition.notional / grossExposure) * 100 : 0;

    return {
      selectedReservedMargin,
      recentFill,
      grossExposure,
      selectedExposureShare,
      liveOrders: selectedOpenOrders.length,
    };
  }, [portfolio, selectedMarket, selectedOpenOrders, selectedOrderFlow, selectedPosition]);

  const pageMeta = useMemo(() => {
    if (view === 'portfolio') {
      return {
        title: 'Portfolio command center',
        subtitle: 'Account-first layout with majors composition, equity, collateral, and linked execution state kept in the same operator flow.',
        badge: 'Risk view',
      };
    }
    if (view === 'markets') {
      return {
        title: 'Markets monitor',
        subtitle: 'Scanner-first layout with majors leadership, breadth, chart context, and order entry still one move away.',
        badge: 'Scanner view',
      };
    }
    return {
      title: 'Trade execution terminal',
      subtitle: 'A denser exchange-style surface with scanner, chart, order book, ticket, fills, and account impact visible together.',
      badge: 'Trade view',
    };
  }, [view]);

  const breadthStats = useMemo(() => {
    const positive = markets.filter((market) => market.change24h >= 0).length;
    const negative = markets.length - positive;
    const leader = [...markets].sort((a, b) => b.volume24h - a.volume24h)[0] ?? null;
    const avgFunding = markets.length ? markets.reduce((sum, market) => sum + market.fundingRate, 0) / markets.length : 0;
    return { positive, negative, leader, avgFunding };
  }, [markets]);

  const marketPanel = (
    <div className="grid">
      <MarketList markets={markets} selectedSymbol={selectedMarket?.symbol} onSelect={setSelectedSymbol} />
      <OrderBookCard orderBook={orderBook} />
    </div>
  );

  const recentFillsCard = (
    <div className="card">
      <div className="row" style={{ marginBottom: 12 }}>
        <div>
          <h3>Recent Fills</h3>
          <div className="muted" style={{ fontSize: 12 }}>Live activity tape with realized PnL context</div>
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
  );

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card terminal-banner">
        <div className="row terminal-banner-row">
          <div>
            <div className="eyebrow">{pageMeta.badge}</div>
            <h2 style={{ marginBottom: 6 }}>{pageMeta.title}</h2>
            <div className="muted" style={{ maxWidth: 860, fontSize: 13 }}>{pageMeta.subtitle}</div>
          </div>
          <div className="toolbar-pills">
            <div className="chip">High-density shell</div>
            <div className="chip">Majors only</div>
            <div className="chip">Wallet bridge</div>
            <TopbarWalletCta />
          </div>
        </div>

        {selectedMarket && selectedMarketStats ? (
          <>
            <div className="row" style={{ marginTop: 18, alignItems: 'flex-end' }}>
              <div>
                <div className="eyebrow">Active contract</div>
                <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-0.05em', marginTop: 4 }}>{selectedMarket.symbol}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  {selectedMarket.baseAsset}/{selectedMarket.quoteAsset} • funding {(selectedMarket.fundingRate * 100).toFixed(3)}% • OI {formatCompactCurrency(selectedMarket.openInterest)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 34, fontWeight: 900 }}>{formatCurrency(selectedMarket.markPrice)}</div>
                <div className={selectedMarket.change24h >= 0 ? 'tone-positive' : 'tone-negative'} style={{ fontSize: 13 }}>
                  {selectedMarket.change24h >= 0 ? '+' : ''}{selectedMarket.change24h}% 24h • basis {selectedMarketStats.basis >= 0 ? '+' : ''}{formatCurrency(selectedMarketStats.basis)}
                </div>
              </div>
            </div>

            <div className="market-strip">
              <div className="mini-stat">
                <div className="field-label">Contract thesis</div>
                <strong>{selectedMarketStats.thesis}</strong>
              </div>
              <div className="mini-stat">
                <div className="field-label">Spread</div>
                <strong>{selectedMarketStats.spread.toFixed(selectedMarket.symbol === 'BTC-PERP' ? 0 : 2)}</strong>
                <div className="muted" style={{ fontSize: 12 }}>{selectedMarketStats.spreadBps.toFixed(2)} bps</div>
              </div>
              <div className="mini-stat">
                <div className="field-label">24h range location</div>
                <strong>{selectedMarketStats.rangeProgress.toFixed(0)}%</strong>
                <div className="muted" style={{ fontSize: 12 }}>{formatCurrency(selectedMarketStats.distanceToHigh)} from high</div>
              </div>
              <div className="mini-stat">
                <div className="field-label">Book skew</div>
                <strong>{selectedMarketStats.depthSkew.toFixed(0)}% bid</strong>
                <div className="muted" style={{ fontSize: 12 }}>{formatCompactCurrency(selectedMarketStats.bidDepth)} bid vs {formatCompactCurrency(selectedMarketStats.askDepth)} ask</div>
              </div>
              <div className="mini-stat">
                <div className="field-label">Top of book</div>
                <strong>{selectedMarketStats.bidTop ? `${formatCurrency(selectedMarketStats.bidTop.price)} / ${formatCurrency(selectedMarketStats.askTop?.price ?? selectedMarket.markPrice)}` : 'Waiting...'}</strong>
                <div className="muted" style={{ fontSize: 12 }}>{selectedMarketStats.marketFillCount} recent fill(s) in this market</div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <FundingCard accessMode={accessMode} onAccessModeChange={setAccessMode} onDeposit={handleDeposit} isDepositing={isDepositing} />
      {portfolio ? <AccountSummary account={portfolio.account} positions={portfolio.positions} openOrders={portfolio.openOrders} /> : null}
      {portfolio ? <AssetCompositionCard positions={portfolio.positions} selectedSymbol={selectedSymbol} /> : null}
      {message ? <div className="card success-banner">{message}</div> : null}
      {error ? <div className="card error-banner">{error}</div> : null}

      {view === 'portfolio' ? (
        <div className="grid page-columns-3">
          <div className="grid">
            <PositionsTable positions={portfolio?.positions ?? []} selectedSymbol={selectedSymbol} />
            <PortfolioHistoryCard history={portfolio?.history ?? []} />
          </div>
          {marketPanel}
          <div className="grid">
            {selectedMarket && portfolio && executionSummary ? (
              <OrderTicket
                market={selectedMarket}
                account={portfolio.account}
                position={selectedPosition}
                marketOpenOrders={selectedOpenOrders}
                recentOrders={selectedOrderFlow}
                freeCollateral={portfolio.account.freeCollateral}
                onSubmit={handleOrder}
                isSubmitting={isSubmitting}
              />
            ) : null}
            <OpenOrdersCard orders={selectedOpenOrders} symbol={selectedSymbol} onCancel={handleCancelOrder} cancelingOrderId={cancelingOrderId} />
            {recentFillsCard}
          </div>
        </div>
      ) : view === 'markets' ? (
        <div className="grid page-columns-2">
          <div className="grid">
            {marketPanel}
            <div className="card">
              <div className="row" style={{ marginBottom: 12 }}>
                <div>
                  <h3>Market Breadth</h3>
                  <div className="muted" style={{ fontSize: 12 }}>Scanner-first context so the page feels like a live monitor, not a clone.</div>
                </div>
                <div className="chip">Scanner</div>
              </div>
              <div className="detail-grid detail-grid-4">
                <div className="detail-card compact">
                  <span className="field-label">Advancers</span>
                  <strong>{breadthStats.positive}</strong>
                  <span className="muted" style={{ fontSize: 12 }}>{breadthStats.negative} declining</span>
                </div>
                <div className="detail-card compact">
                  <span className="field-label">Volume leader</span>
                  <strong>{breadthStats.leader?.symbol ?? '—'}</strong>
                  <span className="muted" style={{ fontSize: 12 }}>{breadthStats.leader ? formatCurrency(breadthStats.leader.volume24h) : 'No data'}</span>
                </div>
                <div className="detail-card compact">
                  <span className="field-label">Average funding</span>
                  <strong>{(breadthStats.avgFunding * 100).toFixed(3)}%</strong>
                  <span className="muted" style={{ fontSize: 12 }}>Majors bias snapshot</span>
                </div>
                <div className="detail-card compact">
                  <span className="field-label">Focused market</span>
                  <strong>{selectedSymbol}</strong>
                  <span className="muted" style={{ fontSize: 12 }}>Linked to chart, depth, and order ticket</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid">
            <PriceChartCard candles={candles} />
            {selectedMarket && portfolio ? (
              <OrderTicket
                market={selectedMarket}
                account={portfolio.account}
                position={selectedPosition}
                marketOpenOrders={selectedOpenOrders}
                recentOrders={selectedOrderFlow}
                freeCollateral={portfolio.account.freeCollateral}
                onSubmit={handleOrder}
                isSubmitting={isSubmitting}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid grid-terminal grid-terminal-pro">
          <div className="terminal-column terminal-column-left">
            <div className="terminal-section-label">Scanner + depth</div>
            {marketPanel}
          </div>
          <div className="terminal-column terminal-column-center">
            <div className="terminal-section-label">Chart + positions</div>
            <PriceChartCard candles={candles} />
            <PositionsTable positions={portfolio?.positions ?? []} selectedSymbol={selectedSymbol} />
            <PortfolioHistoryCard history={portfolio?.history ?? []} />
          </div>
          <div className="terminal-column terminal-column-right">
            <div className="terminal-section-label">Execution + account impact</div>
            {selectedMarket && portfolio && executionSummary ? (
              <OrderTicket
                market={selectedMarket}
                account={portfolio.account}
                position={selectedPosition}
                marketOpenOrders={selectedOpenOrders}
                recentOrders={selectedOrderFlow}
                freeCollateral={portfolio.account.freeCollateral}
                onSubmit={handleOrder}
                isSubmitting={isSubmitting}
              />
            ) : null}
            {selectedMarket && portfolio && executionSummary ? (
              <div className="card execution-link-card">
                <div className="row" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
                  <div>
                    <div className="eyebrow">Execution link</div>
                    <h3 style={{ marginTop: 6 }}>Order state bound to {selectedMarket.symbol}</h3>
                    <div className="muted" style={{ fontSize: 12 }}>Ticket, active orders, recent fills, and collateral drag all stay visible in one lane.</div>
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>{executionSummary.liveOrders} live / {selectedOrderFlow.length} recent</div>
                </div>
                <div className="detail-grid detail-grid-3">
                  <div className="detail-card compact">
                    <span className="field-label">Selected exposure</span>
                    <strong>{selectedPosition ? formatCurrency(selectedPosition.notional) : 'Flat'}</strong>
                    <span className="muted" style={{ fontSize: 12 }}>
                      {selectedPosition ? `${selectedPosition.side} • ${selectedPosition.size} ${selectedMarket.baseAsset}` : `No ${selectedMarket.symbol} position open yet`}
                    </span>
                  </div>
                  <div className="detail-card compact">
                    <span className="field-label">Reserved for resting orders</span>
                    <strong>{formatCurrency(executionSummary.selectedReservedMargin)}</strong>
                    <span className="muted" style={{ fontSize: 12 }}>
                      {executionSummary.liveOrders} staged order{executionSummary.liveOrders === 1 ? '' : 's'} • {formatCurrency(portfolio.account.reservedOrderMargin)} total reserved
                    </span>
                  </div>
                  <div className="detail-card compact">
                    <span className="field-label">Last fill</span>
                    <strong>{executionSummary.recentFill ? `${executionSummary.recentFill.side.toUpperCase()} ${executionSummary.recentFill.size}` : 'No recent fill'}</strong>
                    <span className="muted" style={{ fontSize: 12 }}>
                      {executionSummary.recentFill ? `${formatCurrency(executionSummary.recentFill.fillPrice)} • ${new Date(executionSummary.recentFill.createdAt).toLocaleTimeString()}` : 'Use market or limit orders to seed activity'}
                    </span>
                  </div>
                </div>
                <div className="row detail-card" style={{ marginTop: 12 }}>
                  <div>
                    <div className="field-label">Exposure share</div>
                    <strong>{selectedPosition ? `${executionSummary.selectedExposureShare.toFixed(0)}% of gross exposure sits in ${selectedMarket.symbol}` : `${selectedMarket.symbol} is ready for a first trade`}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="field-label">Gross exposure</div>
                    <strong>{formatCurrency(executionSummary.grossExposure)}</strong>
                  </div>
                </div>
              </div>
            ) : null}
            <OpenOrdersCard orders={selectedOpenOrders} symbol={selectedSymbol} onCancel={handleCancelOrder} cancelingOrderId={cancelingOrderId} />
            {recentFillsCard}
          </div>
        </div>
      )}
    </div>
  );
}
