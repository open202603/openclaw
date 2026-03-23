'use client';

import type { OrderRecord } from '@liquid-ops/types';

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 1000 ? 0 : 2 })}`;
}

export function OpenOrdersCard({
  orders,
  onCancel,
  cancelingOrderId,
}: {
  orders: OrderRecord[];
  onCancel: (orderId: string) => Promise<void>;
  cancelingOrderId?: string | null;
}) {
  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 12 }}>
        <div>
          <h3>Open Orders</h3>
          <div className="muted" style={{ fontSize: 12 }}>Resting limit and stop-market orders waiting for price</div>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>{orders.length} live</div>
      </div>

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
                  Submitted {new Date(order.createdAt).toLocaleTimeString()}
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
        {orders.length === 0 ? <div className="muted">No resting orders. Limit and stop-market orders will appear here until triggered.</div> : null}
      </div>
    </div>
  );
}
