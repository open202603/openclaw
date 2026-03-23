import type { Market } from '@liquid-ops/types';

export function MarketList({
  markets,
  selectedSymbol,
  onSelect,
}: {
  markets: Market[];
  selectedSymbol?: string;
  onSelect?: (symbol: string) => void;
}) {
  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 12 }}>
        <h3>Markets</h3>
        <div className="muted">Live simulated feed</div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Mark</th>
            <th>24h</th>
            <th>Funding</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((market) => (
            <tr
              key={market.symbol}
              className={selectedSymbol === market.symbol ? 'selected-row' : undefined}
              onClick={() => onSelect?.(market.symbol)}
              style={{ cursor: onSelect ? 'pointer' : 'default' }}
            >
              <td>
                <strong>{market.symbol}</strong>
                <div className="muted" style={{ fontSize: 12 }}>{market.baseAsset}/{market.quoteAsset}</div>
              </td>
              <td>${market.markPrice.toLocaleString()}</td>
              <td style={{ color: market.change24h >= 0 ? '#7ef0b2' : '#ff9eaa' }}>
                {market.change24h >= 0 ? '+' : ''}{market.change24h}%
              </td>
              <td>{(market.fundingRate * 100).toFixed(3)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
