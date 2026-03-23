import type { PortfolioHistoryPoint } from '@liquid-ops/types';

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 1000 ? 0 : 2 })}`;
}

export function PortfolioHistoryCard({ history }: { history: PortfolioHistoryPoint[] }) {
  const latest = history.at(-1) ?? null;
  const first = history.at(0) ?? latest;
  const delta = latest && first ? Number((latest.equity - first.equity).toFixed(2)) : 0;
  const deltaPct = latest && first && first.equity !== 0 ? Number((((latest.equity - first.equity) / first.equity) * 100).toFixed(2)) : 0;
  const high = history.length ? Math.max(...history.map((point) => point.equity)) : 0;
  const low = history.length ? Math.min(...history.map((point) => point.equity)) : 0;
  const range = Math.max(high - low, 1);

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 12 }}>
        <div>
          <h3>Equity Curve</h3>
          <div className="muted" style={{ fontSize: 12 }}>Recent persisted account snapshots</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className={delta >= 0 ? 'tone-positive' : 'tone-negative'}>{delta >= 0 ? '+' : ''}{formatCurrency(delta)}</div>
          <div className="muted" style={{ fontSize: 12 }}>{deltaPct >= 0 ? '+' : ''}{deltaPct}% window change</div>
        </div>
      </div>

      {history.length ? (
        <>
          <div className="history-sparkline">
            {history.map((point) => {
              const height = Math.max(12, ((point.equity - low) / range) * 100);
              return <div key={point.timestamp} className="history-bar" style={{ height: `${height}%` }} title={`${new Date(point.timestamp).toLocaleTimeString()} • ${formatCurrency(point.equity)}`} />;
            })}
          </div>
          <div className="row muted" style={{ marginTop: 10, fontSize: 12 }}>
            <span>Low {formatCurrency(low)}</span>
            <span>High {formatCurrency(high)}</span>
          </div>
        </>
      ) : (
        <div className="muted">Waiting for history…</div>
      )}

      <div className="history-list" style={{ marginTop: 14 }}>
        {history.slice(-6).reverse().map((point, index) => {
          const previous = history[history.length - 2 - index];
          const move = previous ? point.equity - previous.equity : 0;
          return (
            <div className="history-row" key={point.timestamp}>
              <div>
                <strong>{formatCurrency(point.equity)}</strong>
                <div className="muted" style={{ fontSize: 12 }}>{new Date(point.timestamp).toLocaleTimeString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={point.unrealizedPnl >= 0 ? 'tone-positive' : 'tone-negative'}>
                  {point.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(point.unrealizedPnl)} uPnL
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {move >= 0 ? '+' : ''}{formatCurrency(move)} • Margin {formatCurrency(point.usedMargin)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
