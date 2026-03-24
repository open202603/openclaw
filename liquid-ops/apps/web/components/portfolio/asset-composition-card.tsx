import type { Position } from '@liquid-ops/types';

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 1000 ? 0 : 2 })}`;
}

const trackedAssets = [
  { asset: 'BTC', symbol: 'BTC-PERP', accent: 'var(--btc)' },
  { asset: 'ETH', symbol: 'ETH-PERP', accent: 'var(--eth)' },
  { asset: 'SOL', symbol: 'SOL-PERP', accent: 'var(--sol)' },
];

export function AssetCompositionCard({ positions, selectedSymbol }: { positions: Position[]; selectedSymbol?: string }) {
  const total = positions.reduce((sum, position) => sum + position.notional, 0);
  const cards = trackedAssets.map((item) => {
    const position = positions.find((entry) => entry.marketSymbol === item.symbol) ?? null;
    const notional = position?.notional ?? 0;
    const share = total > 0 ? (notional / total) * 100 : 0;
    const pnl = position?.unrealizedPnl ?? 0;

    return {
      ...item,
      position,
      notional,
      share,
      pnl,
    };
  });

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
        <div>
          <h3>BTC / ETH / SOL Composition</h3>
          <div className="muted" style={{ fontSize: 12 }}>The desk is explicitly centered on major-asset exposure instead of generic portfolio filler.</div>
        </div>
        <div className="chip">Majors core</div>
      </div>

      <div className="asset-composition-stack">
        {cards.map((card) => (
          <div key={card.symbol} className={`asset-composition-row ${selectedSymbol === card.symbol ? 'selected' : ''}`}>
            <div className="row" style={{ alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="asset-dot" style={{ background: card.accent }} />
                <div>
                  <strong>{card.asset}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>{card.symbol}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>{card.share.toFixed(0)}%</strong>
                <div className={card.pnl >= 0 ? 'tone-positive' : 'tone-negative'} style={{ fontSize: 12 }}>
                  {card.position ? `${card.pnl >= 0 ? '+' : ''}${formatCurrency(card.pnl)}` : 'Flat'}
                </div>
              </div>
            </div>
            <div className="progress-track" style={{ marginTop: 10 }}>
              <div className="progress-fill" style={{ width: `${Math.max(card.share, card.position ? 8 : 0)}%`, background: `linear-gradient(90deg, ${card.accent}, rgba(255,255,255,0.92))` }} />
            </div>
            <div className="row muted" style={{ fontSize: 12, marginTop: 8 }}>
              <span>{card.position ? `${card.position.side} • ${card.position.size} ${card.asset}` : 'No active position'}</span>
              <span>{formatCurrency(card.notional)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
