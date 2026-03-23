import type { OrderBookSnapshot } from '@liquid-ops/types';

export function OrderBookCard({ orderBook }: { orderBook: OrderBookSnapshot | null }) {
  if (!orderBook) {
    return <div className="card"><h3>Order Book</h3><div className="muted">Waiting for market depth…</div></div>;
  }

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 12 }}>
        <h3>Order Book</h3>
        <div className="muted">Spread ${orderBook.spread.toLocaleString()}</div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Bid</th>
            <th>Size</th>
            <th>Ask</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {orderBook.bids.map((bid, index) => (
            <tr key={bid.price}>
              <td style={{ color: '#7ef0b2' }}>{bid.price.toLocaleString()}</td>
              <td>{bid.size}</td>
              <td style={{ color: '#ff9eaa' }}>{orderBook.asks[index]?.price.toLocaleString()}</td>
              <td>{orderBook.asks[index]?.size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
