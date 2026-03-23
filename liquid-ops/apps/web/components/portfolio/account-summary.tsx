import type { AccountSnapshot, Position } from '@liquid-ops/types';

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 1000 ? 0 : 2 })}`;
}

export function AccountSummary({ account, positions }: { account: AccountSnapshot; positions: Position[] }) {
  const grossExposure = positions.reduce((sum, position) => sum + position.notional, 0);
  const largestPosition = positions.reduce((largest, position) => (!largest || position.notional > largest.notional ? position : largest), positions[0]);
  const marginRatio = account.equity > 0 ? (account.usedMargin / account.equity) * 100 : 0;
  const buyingPower = account.freeCollateral * 5;
  const riskTone = marginRatio < 30 ? 'tone-positive' : marginRatio < 60 ? 'tone-warning' : 'tone-negative';
  const riskLabel = marginRatio < 30 ? 'Healthy' : marginRatio < 60 ? 'Elevated' : 'High';

  const metrics = [
    ['Equity', formatCurrency(account.equity)],
    ['Free Collateral', formatCurrency(account.freeCollateral)],
    ['Used Margin', formatCurrency(account.usedMargin)],
    ['Realized PnL', `${account.realizedPnl >= 0 ? '+' : ''}${formatCurrency(account.realizedPnl)}`],
    ['Unrealized PnL', `${account.unrealizedPnl >= 0 ? '+' : ''}${formatCurrency(account.unrealizedPnl)}`],
    ['Gross Exposure', formatCurrency(grossExposure)],
  ];

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 14, alignItems: 'flex-start' }}>
        <div>
          <div className="muted" style={{ fontSize: 12 }}>DEMO ACCOUNT</div>
          <h3 style={{ marginBottom: 4 }}>Portfolio Snapshot</h3>
          <div className="muted" style={{ fontSize: 12 }}>{account.accountId} • {positions.length} open market{positions.length === 1 ? '' : 's'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className={riskTone} style={{ fontWeight: 700 }}>{riskLabel} risk</div>
          <div className="muted" style={{ fontSize: 12 }}>Margin ratio {marginRatio.toFixed(1)}%</div>
        </div>
      </div>

      <div className="subgrid summary-grid summary-grid-wide">
        {metrics.map(([label, value]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="detail-card" style={{ marginTop: 14 }}>
        <div className="detail-grid detail-grid-3">
          <div>
            <span className="field-label">Buying power (approx.)</span>
            <strong>{formatCurrency(buyingPower)}</strong>
          </div>
          <div>
            <span className="field-label">Largest position</span>
            <strong>{largestPosition ? `${largestPosition.marketSymbol} ${formatCurrency(largestPosition.notional)}` : '—'}</strong>
          </div>
          <div>
            <span className="field-label">Net open PnL</span>
            <strong className={account.unrealizedPnl >= 0 ? 'tone-positive' : 'tone-negative'}>
              {account.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(account.unrealizedPnl)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
