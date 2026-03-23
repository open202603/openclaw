'use client';

import type { Market, SimulatedOrderRequest } from '@liquid-ops/types';
import { useMemo, useState } from 'react';

const defaultLeverage = 5;

type OrderDraft = Omit<SimulatedOrderRequest, 'accountId' | 'marketSymbol'>;

export function OrderTicket({
  market,
  onSubmit,
  isSubmitting,
}: {
  market: Market;
  onSubmit: (payload: SimulatedOrderRequest) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [draft, setDraft] = useState<OrderDraft>({
    side: 'buy',
    type: 'market',
    size: 0.25,
    price: market.markPrice,
    leverage: defaultLeverage,
  });
  const [error, setError] = useState<string | null>(null);

  const estimatedMargin = useMemo(() => {
    const referencePrice = draft.type === 'market' ? market.markPrice : draft.price ?? market.markPrice;
    return (draft.size * referencePrice) / draft.leverage;
  }, [draft, market.markPrice]);

  async function submit(side: 'buy' | 'sell') {
    try {
      setError(null);
      await onSubmit({
        accountId: 'acc_demo_001',
        marketSymbol: market.symbol,
        side,
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
      <h3>Order Ticket</h3>
      <div className="muted" style={{ marginBottom: 12 }}>{market.symbol} • 10x max leverage</div>
      <form className="order-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span className="field-label">Order Type</span>
          <select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as OrderDraft['type'] }))}>
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop-market">Stop Market</option>
          </select>
        </label>
        <label>
          <span className="field-label">Price</span>
          <input
            value={draft.type === 'market' ? market.markPrice : draft.price}
            onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) }))}
            aria-label="Price"
            disabled={draft.type === 'market'}
          />
        </label>
        <label>
          <span className="field-label">Size</span>
          <input value={draft.size} onChange={(event) => setDraft((current) => ({ ...current, size: Number(event.target.value) }))} aria-label="Size" />
        </label>
        <label>
          <span className="field-label">Leverage</span>
          <input value={draft.leverage} onChange={(event) => setDraft((current) => ({ ...current, leverage: Number(event.target.value) }))} aria-label="Leverage" />
        </label>
        <div className="muted" style={{ fontSize: 12 }}>
          Est. margin: ${estimatedMargin.toFixed(2)}
        </div>
        {error ? <div className="error-banner">{error}</div> : null}
        <div className="button-row">
          <button type="button" className="button buy" onClick={() => submit('buy')} disabled={isSubmitting}>Buy / Long</button>
          <button type="button" className="button sell" onClick={() => submit('sell')} disabled={isSubmitting}>Sell / Short</button>
        </div>
      </form>
    </div>
  );
}
