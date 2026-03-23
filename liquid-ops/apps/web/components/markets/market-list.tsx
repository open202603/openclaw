import type { Market } from '@liquid-ops/types';

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 1000 ? 0 : 2 })}`;
}

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
        <div>
          <h3>Markets</h3>
          <div className="muted" style={{ fontSize: 12 }}>Live simulated feed • perpetual majors</div>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>{markets.length} instruments</div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Mark / Index</th>
            <th>24h</th>
            <th>Funding</th>
            <th>OI</th>
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
              <td>
                <div>{formatCurrency(market.markPrice)}</div>
                <div className="muted" style={{ fontSize: 12 }}>Idx {formatCurrency(market.indexPrice)}</div>
              </td>
              <td className={market.change24h >= 0 ? 'tone-positive' : 'tone-negative'}>
                {market.change24h >= 0 ? '+' : ''}{market.change24h}%
              </td>
              <td>{(market.fundingRate * 100).toFixed(3)}%</td>
              <td>{formatCurrency(market.openInterest)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
