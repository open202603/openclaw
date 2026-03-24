import type { Candle } from '@liquid-ops/types';

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 1000 ? 0 : 2 })}`;
}

export function PriceChartCard({ candles }: { candles: Candle[] }) {
  if (!candles.length) {
    return <div className="card"><h3>Price Chart</h3><div className="muted">Waiting for candle data…</div></div>;
  }

  const high = Math.max(...candles.map((candle) => candle.high));
  const low = Math.min(...candles.map((candle) => candle.low));
  const range = Math.max(high - low, 1);
  const latest = candles.at(-1) ?? candles[candles.length - 1];
  const previous = candles.at(-2) ?? latest;
  const move = latest.close - previous.close;
  const movePct = previous.close !== 0 ? (move / previous.close) * 100 : 0;
  const volume = candles.slice(-6).reduce((sum, candle) => sum + candle.volume, 0);

  return (
    <div className="card chart-card-pro">
      <div className="row" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow">Primary battle zone</div>
          <h3 style={{ marginTop: 6 }}>Price Chart</h3>
          <div className="muted" style={{ fontSize: 12 }}>{candles.length} x 1m candles • last close {formatCurrency(latest.close)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className={move >= 0 ? 'tone-positive' : 'tone-negative'}>
            {move >= 0 ? '+' : ''}{formatCurrency(move)}
          </div>
          <div className="muted" style={{ fontSize: 12 }}>{movePct >= 0 ? '+' : ''}{movePct.toFixed(2)}% vs prior bar</div>
        </div>
      </div>

      <div className="candle-chart">
        {candles.map((candle) => {
          const highPct = ((high - candle.high) / range) * 100;
          const lowPct = ((high - candle.low) / range) * 100;
          const top = ((high - Math.max(candle.open, candle.close)) / range) * 100;
          const bottom = ((high - Math.min(candle.open, candle.close)) / range) * 100;
          const bodyHeight = Math.max(2, bottom - top);

          return (
            <div key={candle.time} className="candle-slot" title={`${new Date(candle.time).toLocaleTimeString()} • O ${candle.open} H ${candle.high} L ${candle.low} C ${candle.close}`}>
              <div className="candle-wick" style={{ top: `${highPct}%`, height: `${Math.max(2, lowPct - highPct)}%` }} />
              <div className={`candle-body ${candle.close >= candle.open ? 'up' : 'down'}`} style={{ top: `${top}%`, height: `${bodyHeight}%` }} />
            </div>
          );
        })}
      </div>

      <div className="detail-grid detail-grid-4" style={{ marginTop: 12 }}>
        <div>
          <span className="field-label">24m high</span>
          <strong>{formatCurrency(high)}</strong>
        </div>
        <div>
          <span className="field-label">24m low</span>
          <strong>{formatCurrency(low)}</strong>
        </div>
        <div>
          <span className="field-label">Last candle volume</span>
          <strong>{latest.volume.toLocaleString()}</strong>
        </div>
        <div>
          <span className="field-label">6m volume</span>
          <strong>{volume.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}
