import type { Candle } from '@liquid-ops/types';

export function PriceChartCard({ candles }: { candles: Candle[] }) {
  if (!candles.length) {
    return <div className="card"><h3>Price Chart</h3><div className="muted">Waiting for candle data…</div></div>;
  }

  const high = Math.max(...candles.map((candle) => candle.high));
  const low = Math.min(...candles.map((candle) => candle.low));
  const range = Math.max(high - low, 1);

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 12 }}>
        <h3>Price Pulse</h3>
        <div className="muted">{candles.length} x 1m candles</div>
      </div>
      <div className="spark-bars">
        {candles.map((candle) => {
          const closeHeight = ((candle.close - low) / range) * 100;
          const bodyHeight = Math.max(8, ((Math.abs(candle.close - candle.open) || 1) / range) * 100);
          return (
            <div key={candle.time} className="spark-bar-wrap" title={`${candle.time} • O ${candle.open} H ${candle.high} L ${candle.low} C ${candle.close}`}>
              <div className={`spark-bar ${candle.close >= candle.open ? 'up' : 'down'}`} style={{ height: `${bodyHeight}%`, marginTop: `${Math.max(0, 100 - closeHeight)}%` }} />
            </div>
          );
        })}
      </div>
      <div className="row muted" style={{ marginTop: 10, fontSize: 12 }}>
        <span>Low ${low.toLocaleString()}</span>
        <span>High ${high.toLocaleString()}</span>
      </div>
    </div>
  );
}
