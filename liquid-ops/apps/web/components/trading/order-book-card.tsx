import type { OrderBookSnapshot } from '@liquid-ops/types';

function formatPrice(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: value >= 1000 ? 0 : 2 });
}

export function OrderBookCard({ orderBook }: { orderBook: OrderBookSnapshot | null }) {
  if (!orderBook) {
    return <div className="card"><h3>Order Book</h3><div className="muted">Waiting for market depth…</div></div>;
  }

  const bidTotal = orderBook.bids.reduce((sum, level) => sum + level.size, 0);
  const askTotal = orderBook.asks.reduce((sum, level) => sum + level.size, 0);
  const imbalance = bidTotal + askTotal > 0 ? (bidTotal / (bidTotal + askTotal)) * 100 : 50;
  let bidRunning = 0;
  let askRunning = 0;

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 12 }}>
        <div>
          <h3>Order Book</h3>
          <div className="muted" style={{ fontSize: 12 }}>Spread {formatPrice(orderBook.spread)} • updated {new Date(orderBook.timestamp).toLocaleTimeString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="muted" style={{ fontSize: 12 }}>Bid / Ask imbalance</div>
          <strong>{imbalance.toFixed(0)}% bid</strong>
        </div>
      </div>

      <div className="depth-meter" aria-hidden>
        <div className="depth-meter-bid" style={{ width: `${imbalance}%` }} />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Bid</th>
            <th>Size</th>
            <th>Total</th>
            <th>Ask</th>
            <th>Size</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orderBook.bids.map((bid, index) => {
            const ask = orderBook.asks[index];
            bidRunning += bid.size;
            askRunning += ask?.size ?? 0;
            return (
              <tr key={bid.price}>
                <td className="tone-positive">{formatPrice(bid.price)}</td>
                <td>{bid.size}</td>
                <td className="muted">{bidRunning.toFixed(3)}</td>
                <td className="tone-negative">{ask ? formatPrice(ask.price) : '—'}</td>
                <td>{ask?.size ?? '—'}</td>
                <td className="muted">{ask ? askRunning.toFixed(3) : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
