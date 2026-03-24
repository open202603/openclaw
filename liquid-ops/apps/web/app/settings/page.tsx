const preferences = [
  ['Theme', 'Midnight depth'],
  ['Order ticket mode', 'One-click review'],
  ['Default leverage', '5.0x'],
  ['Chart refresh', '4s polling + websocket'],
  ['Market list density', 'Compact terminal rows'],
  ['Sidebar behavior', 'Pinned workstation rail'],
];

const riskControls = [
  { name: 'Max order notional', value: '$50,000', progress: 62 },
  { name: 'Soft margin warning', value: '45%', progress: 45 },
  { name: 'Hard risk escalation', value: '70%', progress: 70 },
  { name: 'Stop trigger buffer', value: '0.35%', progress: 35 },
];

const toggles = [
  ['Show liquidation context inline', 'Enabled'],
  ['Highlight selected contract across panels', 'Enabled'],
  ['Compact fills feed', 'Enabled'],
  ['Require confirmation for stop-market orders', 'Disabled'],
  ['Pin majors watch in sidebar', 'Enabled'],
];

const workspaces = [
  {
    title: 'Execution layout',
    body: 'Three-column terminal with scanner, chart stack, and order entry rack visible without tab hopping.',
  },
  {
    title: 'Portfolio layout',
    body: 'Balance sheet and composition stay dense while still linking directly back into active contract execution.',
  },
  {
    title: 'Scanner layout',
    body: 'Markets page emphasizes breadth and leadership so it behaves like a monitor, not a reskinned order page.',
  },
];

export default function SettingsPage() {
  return (
    <div className="grid settings-grid">
      <div className="settings-stack">
        <div className="card terminal-banner">
          <div className="row terminal-banner-row">
            <div>
              <div className="eyebrow">Desk configuration</div>
              <h2 style={{ marginBottom: 6 }}>Terminal settings with a real operator-console feel</h2>
              <div className="muted" style={{ fontSize: 13, maxWidth: 760 }}>
                This page is no longer a placeholder block. It now reads like the configuration layer of the same trading product: appearance, workflow, safeguards, and layout behavior.
              </div>
            </div>
            <div className="toolbar-pills">
              <div className="chip">Theme</div>
              <div className="chip">Risk</div>
              <div className="chip">Workflow</div>
            </div>
          </div>

          <div className="market-strip">
            <div className="mini-stat">
              <div className="field-label">Visual profile</div>
              <strong>Midnight Pro</strong>
              <div className="muted" style={{ fontSize: 12 }}>Higher contrast, stronger panel framing</div>
            </div>
            <div className="mini-stat">
              <div className="field-label">Workspace density</div>
              <strong>High</strong>
              <div className="muted" style={{ fontSize: 12 }}>Designed for immediate terminal feel</div>
            </div>
            <div className="mini-stat">
              <div className="field-label">Execution posture</div>
              <strong>Manual review</strong>
              <div className="muted" style={{ fontSize: 12 }}>No blind one-click firing</div>
            </div>
            <div className="mini-stat">
              <div className="field-label">Risk rail</div>
              <strong className="tone-warning">Moderate</strong>
              <div className="muted" style={{ fontSize: 12 }}>Warnings before escalation</div>
            </div>
            <div className="mini-stat">
              <div className="field-label">Surface state</div>
              <strong>Redesigned</strong>
              <div className="muted" style={{ fontSize: 12 }}>Now coherent with the rest of the desk</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Display & workflow</h3>
              <div className="muted" style={{ fontSize: 12 }}>How the desk behaves while an operator is actively trading.</div>
            </div>
            <div className="chip">Workspace</div>
          </div>
          <div className="panel-grid-2">
            {preferences.map(([label, value]) => (
              <div key={label} className="settings-tile">
                <div className="field-label">{label}</div>
                <strong style={{ display: 'block', marginTop: 6 }}>{value}</strong>
                <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Current desk preference</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Layout presets</h3>
              <div className="muted" style={{ fontSize: 12 }}>Why each major page now feels like its own terminal mode.</div>
            </div>
            <div className="chip">Modes</div>
          </div>
          <div className="panel-grid-3">
            {workspaces.map((workspace) => (
              <div key={workspace.title} className="detail-card compact">
                <span className="field-label">Preset</span>
                <strong>{workspace.title}</strong>
                <span className="muted" style={{ fontSize: 12 }}>{workspace.body}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="settings-stack">
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Risk rails</h3>
              <div className="muted" style={{ fontSize: 12 }}>Visible thresholds that shape how aggressive the desk can get.</div>
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

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Execution safeguards</h3>
              <div className="muted" style={{ fontSize: 12 }}>Operational toggles with immediate user-facing impact.</div>
            </div>
            <div className="chip">Orders</div>
          </div>
          <div>
            {toggles.map(([label, value]) => (
              <div key={label} className="toggle-row">
                <div>
                  <strong>{label}</strong>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Operator-facing behavior control</div>
                </div>
                <div className={`toggle-state ${value === 'Enabled' ? 'enabled' : 'disabled'}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Session summary</h3>
              <div className="muted" style={{ fontSize: 12 }}>Quick read of the desk’s current operating stance.</div>
            </div>
          </div>
          <div className="grid">
            <div className="detail-card compact">
              <span className="field-label">Profile</span>
              <strong>Momentum intraday</strong>
              <span className="muted" style={{ fontSize: 12 }}>Dense monitoring with fills, depth, and majors bias always visible.</span>
            </div>
            <div className="detail-card compact">
              <span className="field-label">Visual style</span>
              <strong>Dark pro terminal</strong>
              <span className="muted" style={{ fontSize: 12 }}>Sharper hierarchy and stronger panel segmentation.</span>
            </div>
            <div className="detail-card compact">
              <span className="field-label">Order behavior</span>
              <strong>Manual submit</strong>
              <span className="muted" style={{ fontSize: 12 }}>Fast to operate, but still controlled.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
