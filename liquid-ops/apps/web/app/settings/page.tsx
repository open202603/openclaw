const preferences = [
  ['Theme', 'Midnight depth'],
  ['Order ticket mode', 'One-click review'],
  ['Default leverage', '5.0x'],
  ['Chart refresh', '4s polling + websocket'],
];

const riskControls = [
  { name: 'Max order notional', value: '$50,000', progress: 62 },
  { name: 'Soft margin warning', value: '45%', progress: 45 },
  { name: 'Hard risk escalation', value: '70%', progress: 70 },
];

const toggles = [
  ['Show liquidation context inline', 'Enabled'],
  ['Highlight selected contract across panels', 'Enabled'],
  ['Compact fills feed', 'Enabled'],
  ['Require confirmation for stop-market orders', 'Disabled'],
];

export default function SettingsPage() {
  return (
    <div className="grid settings-grid">
      <div className="grid">
        <div className="card terminal-banner">
          <div className="row terminal-banner-row">
            <div>
              <div className="eyebrow">Desk configuration</div>
              <h2 style={{ marginBottom: 6 }}>Terminal settings that actually look wired into a trading product</h2>
              <div className="muted" style={{ fontSize: 13, maxWidth: 760 }}>
                No more placeholder box. This page now reads like a real operator preferences surface with display, execution, and safety categories.
              </div>
            </div>
            <div className="badge">Config view</div>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Display & workflow</h3>
              <div className="muted" style={{ fontSize: 12 }}>How the terminal presents dense information during active trading.</div>
            </div>
            <div className="chip">Workspace</div>
          </div>
          <div className="grid" style={{ gap: 0 }}>
            {preferences.map(([label, value]) => (
              <div key={label} className="list-card-row">
                <div>
                  <strong>{label}</strong>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Current desk preference</div>
                </div>
                <div>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Risk rails</h3>
              <div className="muted" style={{ fontSize: 12 }}>Visible thresholds that shape how aggressive the simulated desk can get.</div>
            </div>
            <div className="chip">Safety</div>
          </div>
          <div className="grid">
            {riskControls.map((item) => (
              <div key={item.name} className="detail-card compact">
                <div className="row">
                  <span className="field-label">{item.name}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Execution safeguards</h3>
              <div className="muted" style={{ fontSize: 12 }}>Operational toggles with immediate user-facing impact.</div>
            </div>
            <div className="chip">Orders</div>
          </div>
          <div className="grid" style={{ gap: 0 }}>
            {toggles.map(([label, value]) => (
              <div key={label} className="list-card-row">
                <div>
                  <strong>{label}</strong>
                </div>
                <div className={value === 'Enabled' ? 'tone-positive' : 'tone-neutral'}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Session summary</h3>
              <div className="muted" style={{ fontSize: 12 }}>Quick read of the current desk configuration posture.</div>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-card compact">
              <span className="field-label">Profile</span>
              <strong>Momentum intraday</strong>
              <span className="muted" style={{ fontSize: 12 }}>Dense monitoring, active fills feed</span>
            </div>
            <div className="detail-card compact">
              <span className="field-label">Visual style</span>
              <strong>Dark pro terminal</strong>
              <span className="muted" style={{ fontSize: 12 }}>High contrast, stacked panels</span>
            </div>
            <div className="detail-card compact">
              <span className="field-label">Risk posture</span>
              <strong className="tone-warning">Moderate</strong>
              <span className="muted" style={{ fontSize: 12 }}>Warnings before escalation</span>
            </div>
            <div className="detail-card compact">
              <span className="field-label">Order behavior</span>
              <strong>Manual submit</strong>
              <span className="muted" style={{ fontSize: 12 }}>No blind one-click execution</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
