import type { PortfolioHistoryPoint } from '@liquid-ops/types';

export function PortfolioHistoryCard({ history }: { history: PortfolioHistoryPoint[] }) {
  const latest = history.at(-1) ?? null;
  const first = history.at(0) ?? latest;
  const delta = latest && first ? Number((latest.equity - first.equity).toFixed(2)) : 0;
  const deltaPct = latest && first && first.equity !== 0 ? Number((((latest.equity - first.equity) / first.equity) * 100).toFixed(2)) : 0;

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 12 }}>
        <div>
          <h3>Equity History</h3>
          <div className="muted" style={{ fontSize: 12 }}>Recent persisted account snapshots</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: delta >= 0 ? '#7ef0b2' : '#ff9eaa' }}>{delta >= 0 ? '+' : ''}${delta.toLocaleString()}</div>
          <div className="muted" style={{ fontSize: 12 }}>{deltaPct >= 0 ? '+' : ''}{deltaPct}%</div>
        </div>
      </div>

      <div className="history-list">
        {history.slice(-8).reverse().map((point) => (
          <div className="history-row" key={point.timestamp}>
            <div>
              <strong>${point.equity.toLocaleString()}</strong>
              <div className="muted" style={{ fontSize: 12 }}>{new Date(point.timestamp).toLocaleTimeString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: point.unrealizedPnl >= 0 ? '#7ef0b2' : '#ff9eaa' }}>
                {point.unrealizedPnl >= 0 ? '+' : ''}${point.unrealizedPnl.toLocaleString()}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>Margin ${point.usedMargin.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
