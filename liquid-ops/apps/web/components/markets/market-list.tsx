import type { Market } from '@liquid-ops/types';

export function MarketList({ markets }: { markets: Market[] }) {
  return (
    <div className="card">
      <h3>Markets</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Mark</th>
            <th>24h</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((market) => (
            <tr key={market.symbol}>
              <td>{market.symbol}</td>
              <td>${market.markPrice.toLocaleString()}</td>
              <td style={{ color: market.change24h >= 0 ? '#7ef0b2' : '#ff9eaa' }}>
                {market.change24h >= 0 ? '+' : ''}{market.change24h}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
