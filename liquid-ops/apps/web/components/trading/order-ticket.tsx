'use client';

import type { Market } from '@liquid-ops/types';
import { useState } from 'react';

export function OrderTicket({ market }: { market: Market }) {
  const [size, setSize] = useState('0.25');
  const [price, setPrice] = useState(String(market.markPrice));

  return (
    <div className="card">
      <h3>Order Ticket</h3>
      <div className="muted" style={{ marginBottom: 12 }}>{market.symbol} • 10x max leverage placeholder</div>
      <form className="order-form">
        <select defaultValue="limit">
          <option value="market">Market</option>
          <option value="limit">Limit</option>
          <option value="stop-market">Stop Market</option>
        </select>
        <input value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price" />
        <input value={size} onChange={(e) => setSize(e.target.value)} aria-label="Size" />
        <input defaultValue="5" aria-label="Leverage" />
        <div className="muted" style={{ fontSize: 12 }}>
          Est. margin: ${(Number(size) * Number(price) / 5).toFixed(2)}
        </div>
        <div className="button-row">
          <button type="button" className="button buy">Buy / Long</button>
          <button type="button" className="button sell">Sell / Short</button>
        </div>
      </form>
    </div>
  );
}
