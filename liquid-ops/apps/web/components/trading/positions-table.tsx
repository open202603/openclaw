import type { Position } from '@liquid-ops/types';

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 1000 ? 0 : 2 })}`;
}

export function PositionsTable({ positions }: { positions: Position[] }) {
  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 12 }}>
        <div>
          <h3>Net Positions</h3>
          <div className="muted" style={{ fontSize: 12 }}>Cross-market exposure, mark-to-market PnL, and liquidation context</div>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>{positions.length} open</div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Market</th>
            <th>Side</th>
            <th>Size</th>
            <th>Notional</th>
            <th>Entry / Mark</th>
            <th>PnL</th>
            <th>ROE</th>
            <th>Lev</th>
            <th>Liq.</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => {
            const marginUsed = position.notional / Math.max(position.leverage, 1);
            const roe = marginUsed > 0 ? (position.unrealizedPnl / marginUsed) * 100 : 0;
            return (
              <tr key={position.id}>
                <td>
                  <strong>{position.marketSymbol}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>{new Date(position.updatedAt).toLocaleTimeString()}</div>
                </td>
                <td><span className={`pill ${position.side === 'long' ? 'buy' : 'sell'}`}>{position.side}</span></td>
                <td>{position.size}</td>
                <td>{formatCurrency(position.notional)}</td>
                <td>
                  <div>{formatCurrency(position.entryPrice)}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{formatCurrency(position.markPrice)}</div>
                </td>
                <td className={position.unrealizedPnl >= 0 ? 'tone-positive' : 'tone-negative'}>
                  {position.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPnl)}
                </td>
                <td className={roe >= 0 ? 'tone-positive' : 'tone-negative'}>
                  {roe >= 0 ? '+' : ''}{roe.toFixed(2)}%
                </td>
                <td>{position.leverage.toFixed(1)}x</td>
                <td>{formatCurrency(position.liquidationPrice)}</td>
              </tr>
            );
          })}
          {positions.length === 0 ? (
            <tr>
              <td colSpan={9} className="muted">No open positions.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
