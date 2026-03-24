import Link from 'next/link';

const workspaceCards = [
  {
    title: 'Execution terminal',
    subtitle: 'Launch straight into the live trading shell with chart, depth, ticket, fills, and account linkage in one surface.',
    href: '/trade?access=demo',
    cta: 'Open trade desk',
  },
  {
    title: 'Portfolio risk board',
    subtitle: 'Review collateral, equity, BTC / ETH / SOL exposure mix, and execution-linked account state.',
    href: '/portfolio?access=demo',
    cta: 'Open portfolio board',
  },
  {
    title: 'Markets monitor',
    subtitle: 'Scan majors leadership, breadth, tape context, and route directly into the active execution lane.',
    href: '/markets?access=demo',
    cta: 'Open scanner',
  },
  {
    title: 'Options core',
    subtitle: 'Enter the multi-venue options dashboard for Binance, Deribit, OKX, and Bybit-backed backend infrastructure.',
    href: '/options',
    cta: 'Open options dashboard',
  },
  {
    title: 'Terminal settings',
    subtitle: 'Refine desk profile, risk rails, density defaults, and workflow framing like a real operator product.',
    href: '/settings',
    cta: 'Open settings',
  },
];

const launchRows = [
  ['Profile', 'Midnight execution'],
  ['Universe', 'BTC / ETH / SOL perpetuals'],
  ['Collateral rail', 'Wallet framing + demo funds'],
  ['Priority', 'Execution realism'],
  ['Density', 'High information'],
  ['Mode', 'Cross-margin operator shell'],
];

const venueStats = [
  {
    label: 'Execution posture',
    value: 'Terminal-first',
    note: 'The product should feel like a desk before it feels like a demo.',
  },
  {
    label: 'Primary market lens',
    value: 'Majors focus',
    note: 'BTC anchors, ETH rotates, SOL adds velocity and visible risk-on / risk-off movement.',
  },
  {
    label: 'Operator workflow',
    value: 'Scan → decide → stage → monitor',
    note: 'The shell is being pushed toward obvious decision rhythm instead of generic app navigation.',
  },
  {
    label: 'Funding rail',
    value: 'Wallet + demo bridge',
    note: 'Enough product framing to sell the idea, enough instant collateral to keep the desk alive.',
  },
];

const platformShifts = [
  'Harder terminal framing with more exchange-like shell structure',
  'Less marketing-card energy, more operator dashboard energy',
  'Sharper hierarchy between scanner, execution, collateral, and settings',
  'More cohesive product identity across trade, portfolio, markets, and control surfaces',
];

export default function HomePage() {
  return (
    <div className="platform-grid platform-grid-pro">
      <div className="card overview-hero terminal-banner terminal-hero-pro">
        <div className="hero-grid grid hero-grid-pro">
          <div>
            <div className="eyebrow">Liquid Ops // command board</div>
            <h2 style={{ marginTop: 10, fontSize: 46, lineHeight: 0.98, maxWidth: 860 }}>
              A more professional trading platform shell — heavier, sharper, and much closer to a real derivatives workstation.
            </h2>
            <p className="muted" style={{ maxWidth: 820, fontSize: 15, lineHeight: 1.75 }}>
              Liquid Ops is being pushed away from “crypto demo page” territory and toward an execution-led platform feel: stronger shell hierarchy, tighter operating surfaces, clearer risk posture, and a majors-first trading workflow that reads like an actual desk.
            </p>
            <div className="overview-actions">
              <Link className="primary-link" href="/trade?access=demo">Launch execution workspace</Link>
              <Link className="secondary-link" href="/trade?access=wallet">Enter wallet rail</Link>
              <Link className="secondary-link" href="/portfolio?funding=deposit">Fund collateral</Link>
            </div>
            <div className="terminal-statline terminal-statline-pro">
              <div className="statline-pill">Professional shell</div>
              <div className="statline-pill">Majors-first execution</div>
              <div className="statline-pill">Realtime depth + fills</div>
              <div className="statline-pill">Risk-linked account surface</div>
              <div className="statline-pill">4-venue options dashboard entry</div>
            </div>
          </div>

          <div className="detail-card launch-board-pro" style={{ alignSelf: 'stretch' }}>
            <div className="row" style={{ marginBottom: 12 }}>
              <div>
                <div className="eyebrow">Desk launch board</div>
                <h3 style={{ marginTop: 6 }}>Current venue framing</h3>
              </div>
              <div className="chip">Operator mode</div>
            </div>
            <div className="grid">
              {launchRows.map(([label, value]) => (
                <div key={label} className="list-card-row" style={{ paddingTop: 0 }}>
                  <div>
                    <strong>{label}</strong>
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Current shell posture</div>
                  </div>
                  <div>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="command-strip command-strip-pro">
        {workspaceCards.map((item) => (
          <div key={item.title} className="card command-card command-card-pro">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Workspace</div>
            <h3>{item.title}</h3>
            <div className="muted" style={{ fontSize: 13, lineHeight: 1.75, minHeight: 84 }}>{item.subtitle}</div>
            <div style={{ marginTop: 16 }}>
              <Link className="secondary-link" href={item.href}>{item.cta}</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="data-rack data-rack-pro">
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Platform direction</h3>
              <div className="muted" style={{ fontSize: 12 }}>The redesign is explicitly targeting professional trading platform energy, not lightweight demo polish.</div>
            </div>
            <div className="chip">Pro platform</div>
          </div>
          <div className="panel-grid-2">
            {venueStats.map((item) => (
              <div key={item.label} className="detail-card compact">
                <span className="field-label">{item.label}</span>
                <strong>{item.value}</strong>
                <span className="muted" style={{ fontSize: 12 }}>{item.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Current shift list</h3>
              <div className="muted" style={{ fontSize: 12 }}>What this UI push is trying to accomplish structurally.</div>
            </div>
          </div>
          <div className="grid">
            {platformShifts.map((item) => (
              <div key={item} className="detail-card compact">
                <span className="field-label">Shift</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
