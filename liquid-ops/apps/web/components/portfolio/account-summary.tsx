import type { AccountSnapshot } from '@liquid-ops/types';

export function AccountSummary({ account }: { account: AccountSnapshot }) {
  const metrics = [
    ['Equity', `$${account.equity.toLocaleString()}`],
    ['Free Collateral', `$${account.freeCollateral.toLocaleString()}`],
    ['Used Margin', `$${account.usedMargin.toLocaleString()}`],
    ['Unrealized PnL', `${account.unrealizedPnl >= 0 ? '+' : ''}$${account.unrealizedPnl.toLocaleString()}`],
  ];

  return (
    <div className="card">
      <div className="subgrid">
        {metrics.map(([label, value]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
