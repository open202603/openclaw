'use client';

import type { Market, Position, SimulatedOrderRequest } from '@liquid-ops/types';
import { useEffect, useMemo, useState } from 'react';

const defaultLeverage = 5;
const sizePresets = [10, 25, 50, 100];

type OrderDraft = Omit<SimulatedOrderRequest, 'accountId' | 'marketSymbol'>;

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 1000 ? 0 : 2 })}`;
}

export function OrderTicket({
  market,
  position,
  freeCollateral,
  onSubmit,
  isSubmitting,
}: {
  market: Market;
  position?: Position | null;
  freeCollateral: number;
  onSubmit: (payload: SimulatedOrderRequest) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [draft, setDraft] = useState<OrderDraft>({
    side: 'buy',
    type: 'market',
    size: market.symbol === 'BTC-PERP' ? 0.05 : market.symbol === 'ETH-PERP' ? 0.5 : 10,
    price: market.markPrice,
    leverage: defaultLeverage,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      size: market.symbol === 'BTC-PERP' ? Math.min(current.size, 0.25) || 0.05 : current.size,
      price: market.markPrice,
    }));
  }, [market.markPrice, market.symbol]);

  const referencePrice = draft.type === 'market' ? market.markPrice : draft.price ?? market.markPrice;
  const estimatedNotional = useMemo(() => draft.size * referencePrice, [draft.size, referencePrice]);
  const estimatedMargin = useMemo(() => estimatedNotional / Math.max(draft.leverage, 1), [estimatedNotional, draft.leverage]);
  const liquidationPrice = useMemo(() => {
    const move = referencePrice / Math.max(draft.leverage, 1);
    return draft.side === 'buy' ? referencePrice - move : referencePrice + move;
  }, [draft.side, draft.leverage, referencePrice]);
  const maxSizeApprox = useMemo(() => (freeCollateral * Math.max(draft.leverage, 1)) / Math.max(referencePrice, 1), [draft.leverage, freeCollateral, referencePrice]);
  const marginUsagePct = useMemo(() => (estimatedMargin / Math.max(freeCollateral, 1)) * 100, [estimatedMargin, freeCollateral]);
  const currentExposureSide = position?.side === 'long' ? 'Long' : position?.side === 'short' ? 'Short' : 'Flat';
  const intentLabel = useMemo(() => {
    if (!position) return draft.side === 'buy' ? 'Open / add long' : 'Open / add short';
    if (position.side === 'long') return draft.side === 'buy' ? 'Add to long' : 'Reduce / flip long';
    return draft.side === 'sell' ? 'Add to short' : 'Reduce / flip short';
  }, [draft.side, position]);

  function updateSize(percent: number) {
    const decimals = market.symbol === 'SOL-PERP' ? 1 : 3;
    const sized = Number((maxSizeApprox * (percent / 100)).toFixed(decimals));
    setDraft((current) => ({ ...current, size: Math.max(sized, 0) }));
  }

  async function submit() {
    try {
      setError(null);
      if (!Number.isFinite(draft.size) || draft.size <= 0) {
        throw new Error('Enter a valid size');
      }
      if (draft.type !== 'market' && (!Number.isFinite(draft.price ?? NaN) || Number(draft.price) <= 0)) {
        throw new Error('Enter a valid trigger / limit price');
      }
      if (!Number.isFinite(draft.leverage) || draft.leverage < 1 || draft.leverage > 10) {
        throw new Error('Leverage must be between 1x and 10x');
      }

      await onSubmit({
        accountId: 'acc_demo_001',
        marketSymbol: market.symbol,
        side: draft.side,
        type: draft.type,
        size: Number(draft.size),
        price: draft.type === 'market' ? undefined : Number(draft.price),
        leverage: Number(draft.leverage),
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Order failed');
    }
  }

  return (
    <div className="card">
      <div className="row" style={{ alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <h3>Order Entry</h3>
          <div className="muted" style={{ fontSize: 12 }}>{market.symbol} • market fills now, limit/stop rest until triggered</div>
        </div>
        <div className={`pill ${draft.side === 'buy' ? 'buy' : 'sell'}`}>{intentLabel}</div>
      </div>

      <div className="segmented-control" style={{ marginBottom: 12 }}>
        <button type="button" className={draft.side === 'buy' ? 'active buy' : ''} onClick={() => setDraft((current) => ({ ...current, side: 'buy' }))}>Buy / Long</button>
        <button type="button" className={draft.side === 'sell' ? 'active sell' : ''} onClick={() => setDraft((current) => ({ ...current, side: 'sell' }))}>Sell / Short</button>
      </div>

      <form className="order-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span className="field-label">Order Type</span>
          <select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as OrderDraft['type'] }))}>
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop-market">Stop Market</option>
          </select>
        </label>

        <div className="field-grid-2">
          <label>
            <span className="field-label">{draft.type === 'stop-market' ? 'Trigger Price' : 'Price'}</span>
            <input
              type="number"
              step="any"
              value={draft.type === 'market' ? market.markPrice : draft.price}
              onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) }))}
              aria-label="Price"
              disabled={draft.type === 'market'}
            />
          </label>
          <label>
            <span className="field-label">Size</span>
            <input type="number" step="any" value={draft.size} onChange={(event) => setDraft((current) => ({ ...current, size: Number(event.target.value) }))} aria-label="Size" />
          </label>
        </div>

        <div>
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="field-label">Size presets</span>
            <span className="muted" style={{ fontSize: 12 }}>Approx max {maxSizeApprox.toFixed(market.symbol === 'SOL-PERP' ? 1 : 3)} {market.baseAsset}</span>
          </div>
          <div className="preset-row">
            {sizePresets.map((preset) => (
              <button key={preset} type="button" className="ghost-button" onClick={() => updateSize(preset)}>{preset}%</button>
            ))}
            <button type="button" className="ghost-button" onClick={() => setDraft((current) => ({ ...current, size: Number(Math.max(current.size * 2, 0.001).toFixed(3)) }))}>2x</button>
            <button type="button" className="ghost-button" onClick={() => setDraft((current) => ({ ...current, size: Number(Math.max(current.size / 2, 0.001).toFixed(3)) }))}>½</button>
          </div>
        </div>

        <label>
          <div className="row">
            <span className="field-label">Leverage</span>
            <strong style={{ fontSize: 13 }}>{draft.leverage.toFixed(1)}x</strong>
          </div>
          <input type="range" min={1} max={10} step={0.5} value={draft.leverage} onChange={(event) => setDraft((current) => ({ ...current, leverage: Number(event.target.value) }))} />
        </label>

        <div className="detail-card">
          <div className="detail-grid">
            <div>
              <span className="field-label">Mark</span>
              <strong>{formatCurrency(market.markPrice)}</strong>
            </div>
            <div>
              <span className="field-label">Order Notional</span>
              <strong>{formatCurrency(estimatedNotional)}</strong>
            </div>
            <div>
              <span className="field-label">Est. Margin</span>
              <strong>{formatCurrency(estimatedMargin)}</strong>
            </div>
            <div>
              <span className="field-label">Est. Liq.</span>
              <strong>{formatCurrency(liquidationPrice)}</strong>
            </div>
          </div>
          <div className="row" style={{ marginTop: 10, alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: 12 }}>Free collateral impact</span>
            <span className={marginUsagePct < 35 ? 'tone-positive' : marginUsagePct < 70 ? 'tone-warning' : 'tone-negative'} style={{ fontSize: 12, fontWeight: 600 }}>
              {marginUsagePct.toFixed(1)}% of available balance
            </span>
          </div>
        </div>

        <div className="detail-card compact">
          <div className="row"><span className="field-label">Current position</span><strong>{currentExposureSide}</strong></div>
          {position ? (
            <>
              <div className="row muted" style={{ fontSize: 12 }}><span>{position.size} {market.baseAsset} @ {formatCurrency(position.entryPrice)}</span><span>{position.leverage.toFixed(1)}x</span></div>
              <div className="row" style={{ fontSize: 12 }}>
                <span className={position.unrealizedPnl >= 0 ? 'tone-positive' : 'tone-negative'}>
                  {position.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPnl)} unrealized
                </span>
                <span className="muted">Liq. {formatCurrency(position.liquidationPrice)}</span>
              </div>
            </>
          ) : (
            <div className="muted" style={{ fontSize: 12 }}>No open exposure in this market.</div>
          )}
        </div>

        {error ? <div className="card error-banner" style={{ padding: 12 }}>{error}</div> : null}
        <button type="button" className={`button ${draft.side === 'buy' ? 'buy' : 'sell'}`} onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : `${draft.type === 'market' ? 'Execute' : 'Place'} ${draft.side === 'buy' ? 'Buy / Long' : 'Sell / Short'} ${market.symbol}`}
        </button>
      </form>
    </div>
  );
}
