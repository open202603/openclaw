'use client';

import type { OrderRecord } from '@liquid-ops/types';

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 1000 ? 0 : 2 })}`;
}

export function OpenOrdersCard({
  orders,
  symbol,
  onCancel,
  cancelingOrderId,
}: {
  orders: OrderRecord[];
  symbol: string;
  onCancel: (orderId: string) => Promise<void>;
  cancelingOrderId?: string | null;
}) {
  const reservedMargin = orders.reduce((sum, order) => sum + (order.reservedMargin ?? 0), 0);

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 12 }}>
        <div>
          <h3>Open Orders</h3>
          <div className="muted" style={{ fontSize: 12 }}>Resting limit and stop-market orders waiting for price</div>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>{orders.length} live</div>
      </div>

      {orders.length > 0 ? (
        <div className="detail-card compact" style={{ marginBottom: 12 }}>
          <div className="row"><span className="field-label">{symbol} staging summary</span><strong>{formatCurrency(reservedMargin)} reserved</strong></div>
          <div className="muted" style={{ fontSize: 12 }}>These orders are already tied into the account summary and will free margin immediately when canceled or filled.</div>
        </div>
      ) : null}

      <div className="grid" style={{ gap: 10 }}>
        {orders.map((order) => (
          <div key={order.orderId} className="order-row">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="row" style={{ justifyContent: 'flex-start', gap: 8 }}>
                  <strong>{order.marketSymbol}</strong>
                  <span className={`pill ${order.side === 'buy' ? 'buy' : 'sell'}`}>{order.side}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{order.type}</span>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  {order.size} contracts • trigger {typeof order.requestedPrice === 'number' ? formatCurrency(order.requestedPrice) : 'market'} • {order.leverage.toFixed(1)}x
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Submitted {new Date(order.createdAt).toLocaleTimeString()} • reserved {formatCurrency(order.reservedMargin ?? 0)}
                </div>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => onCancel(order.orderId)}
                disabled={cancelingOrderId === order.orderId}
              >
                {cancelingOrderId === order.orderId ? 'Canceling…' : 'Cancel'}
              </button>
            </div>
          </div>
        ))}
        {orders.length === 0 ? (
          <div className="detail-card compact">
            <strong>No resting {symbol} orders yet.</strong>
            <div className="muted" style={{ fontSize: 12 }}>Try one of these to make the book feel alive immediately:</div>
            <ul className="dense-list muted" style={{ fontSize: 12, margin: 0 }}>
              <li>Stage a pullback limit below mark to buy into weakness</li>
              <li>Place a stop-market above local highs to catch breakout continuation</li>
              <li>Use the size presets in Order Entry to ladder risk without typing numbers</li>
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
