'use client';

import { useMemo, useState } from 'react';

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 1000 ? 0 : 2 })}`;
}

const presetDeposits = [2500, 10000, 25000];

export function FundingCard({
  accessMode,
  onAccessModeChange,
  onDeposit,
  isDepositing,
}: {
  accessMode: 'demo' | 'wallet';
  onAccessModeChange: (mode: 'demo' | 'wallet') => void;
  onDeposit: (amount: number) => Promise<void>;
  isDepositing: boolean;
}) {
  const [depositAmount, setDepositAmount] = useState(10000);
  const [error, setError] = useState<string | null>(null);

  const modeMeta = useMemo(() => {
    if (accessMode === 'wallet') {
      return {
        title: 'Wallet mode staged',
        summary: 'UI-first wallet entry is live. Use it to frame the product around a real connect flow while demo collateral keeps the experience instantly usable.',
        badge: 'Wallet view',
      };
    }

    return {
      title: 'Demo mode active',
      summary: 'Seed collateral, flip between BTC / ETH / SOL, and stress the product flow without blocking on custody plumbing.',
      badge: 'Demo view',
    };
  }, [accessMode]);

  async function handleDeposit(amount: number) {
    try {
      setError(null);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Enter a valid deposit amount');
      }
      await onDeposit(amount);
    } catch (depositError) {
      setError(depositError instanceof Error ? depositError.message : 'Deposit failed');
    }
  }

  return (
    <div className="card funding-card-shell">
      <div className="row" style={{ alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div className="eyebrow">Access & funding</div>
          <h3 style={{ marginBottom: 6 }}>{modeMeta.title}</h3>
          <div className="muted" style={{ fontSize: 12, maxWidth: 720 }}>{modeMeta.summary}</div>
        </div>
        <div className="badge">{modeMeta.badge}</div>
      </div>

      <div className="funding-grid">
        <div className="detail-card compact funding-mode-card">
          <div className="row">
            <span className="field-label">Entry mode</span>
            <strong>{accessMode === 'wallet' ? 'Wallet + demo bridge' : 'Instant demo'}</strong>
          </div>
          <div className="segmented-control" style={{ marginTop: 10 }}>
            <button type="button" className={accessMode === 'demo' ? 'active buy' : ''} onClick={() => onAccessModeChange('demo')}>Demo mode</button>
            <button type="button" className={accessMode === 'wallet' ? 'active' : ''} onClick={() => onAccessModeChange('wallet')}>Connect wallet</button>
          </div>
          <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
            {accessMode === 'wallet'
              ? 'Wallet mode is intentionally framed as the premium entry point, but keeps demo collateral attached so the desk still feels alive in product demos.'
              : 'Demo mode is still the fastest way to top up collateral, place orders, and explore the simulated desk end-to-end.'}
          </div>
        </div>

        <div className="detail-card compact funding-mode-card">
          <div className="row">
            <span className="field-label">Demo deposit</span>
            <strong>{formatCurrency(depositAmount)}</strong>
          </div>
          <div className="preset-row" style={{ marginTop: 10 }}>
            {presetDeposits.map((preset) => (
              <button key={preset} type="button" className="ghost-button" onClick={() => setDepositAmount(preset)}>
                {formatCurrency(preset)}
              </button>
            ))}
          </div>
          <label style={{ display: 'grid', gap: 6, marginTop: 12 }}>
            <span className="field-label">Custom amount</span>
            <input type="number" min={1} step="100" value={depositAmount} onChange={(event) => setDepositAmount(Number(event.target.value))} />
          </label>
          <button type="button" className="button buy" onClick={() => handleDeposit(depositAmount)} disabled={isDepositing} style={{ marginTop: 12 }}>
            {isDepositing ? 'Funding demo account…' : accessMode === 'wallet' ? 'Add demo collateral bridge' : 'Deposit demo collateral'}
          </button>
          {error ? <div className="card error-banner" style={{ padding: 12, marginTop: 12 }}>{error}</div> : null}
        </div>
      </div>
    </div>
  );
}
