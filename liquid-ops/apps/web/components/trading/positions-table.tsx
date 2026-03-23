import type { Position } from '@liquid-ops/types';

export function PositionsTable({ positions }: { positions: Position[] }) {
  return (
    <div className="card">
      <h3>Net Positions</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Market</th>
            <th>Side</th>
            <th>Size</th>
            <th>Entry</th>
            <th>Mark</th>
            <th>PnL</th>
            <th>Lev</th>
            <th>Liq.</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => (
            <tr key={position.id}>
              <td>
                <strong>{position.marketSymbol}</strong>
                <div className="muted" style={{ fontSize: 12 }}>{new Date(position.updatedAt).toLocaleTimeString()}</div>
              </td>
              <td><span className={`pill ${position.side === 'long' ? 'buy' : 'sell'}`}>{position.side}</span></td>
              <td>{position.size}</td>
              <td>${position.entryPrice.toLocaleString()}</td>
              <td>${position.markPrice.toLocaleString()}</td>
              <td style={{ color: position.unrealizedPnl >= 0 ? '#7ef0b2' : '#ff9eaa' }}>
                {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toLocaleString()}
              </td>
              <td>{position.leverage.toFixed(1)}x</td>
              <td>${position.liquidationPrice.toLocaleString()}</td>
            </tr>
          ))}
          {positions.length === 0 ? (
            <tr>
              <td colSpan={8} className="muted">No open positions.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
