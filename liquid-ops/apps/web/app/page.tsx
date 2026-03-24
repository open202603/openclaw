import Link from 'next/link';

const commandDeck = [
  {
    title: 'Trade terminal',
    subtitle: 'Three-column execution stack with market list, chart, depth, ticket, fills, and exposure linkage.',
    href: '/trade?access=demo',
    cta: 'Open trade desk',
  },
  {
    title: 'Portfolio command',
    subtitle: 'Balance sheet, BTC / ETH / SOL composition, equity curve, and live execution state in one dense view.',
    href: '/portfolio?access=demo',
    cta: 'Open portfolio',
  },
  {
    title: 'Markets monitor',
    subtitle: 'Cross-market scan with breadth, leadership, and scanner-first context rather than a duplicate trade page.',
    href: '/markets?access=demo',
    cta: 'Open scanner',
  },
  {
    title: 'Desk settings',
    subtitle: 'Terminal appearance, workflow defaults, risk rails, and session layout presets framed like a real pro product.',
    href: '/settings',
    cta: 'Open settings',
  },
];

const racks = [
  ['Session mode', 'Demo + wallet entry'],
  ['Primary venue', 'Perps majors'],
  ['Visual profile', 'Midnight pro'],
  ['Density target', 'High information'],
  ['Risk posture', 'Moderate'],
  ['Refresh rail', 'Polling + websocket'],
];

export default function HomePage() {
  return (
    <div className="platform-grid">
      <div className="card overview-hero terminal-banner">
        <div className="hero-grid grid">
          <div>
            <div className="eyebrow">Liquid Ops Terminal</div>
            <h2 style={{ marginTop: 10, fontSize: 42, lineHeight: 1.01, maxWidth: 760 }}>
              A darker, denser, more obvious pro trading surface — closer to an exchange terminal than a generic demo.
            </h2>
            <p className="muted" style={{ maxWidth: 760, fontSize: 15, lineHeight: 1.7 }}>
              The visible product has been pushed toward a sharper crypto desk feel: tighter panel framing, stronger hierarchy, more scanner-like navigation, and majors-first execution across trade, portfolio, markets, and settings.
            </p>
            <div className="overview-actions">
              <Link className="primary-link" href="/trade?access=demo">Launch demo terminal</Link>
              <Link className="secondary-link" href="/trade?access=wallet">Enter wallet mode</Link>
              <Link className="secondary-link" href="/portfolio?funding=deposit">Top up collateral</Link>
            </div>
            <div className="terminal-statline">
              <div className="statline-pill">Majors-focused contract universe</div>
              <div className="statline-pill">Contrast-heavy panel system</div>
              <div className="statline-pill">Execution + account linkage</div>
              <div className="statline-pill">Product-feel settings surface</div>
            </div>
          </div>

          <div className="detail-card" style={{ alignSelf: 'stretch' }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Launch board</div>
            <div className="grid">
              {racks.map(([label, value]) => (
                <div key={label} className="list-card-row" style={{ paddingTop: 0 }}>
                  <div>
                    <strong>{label}</strong>
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Current desk framing</div>
                  </div>
                  <div>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="command-strip">
        {commandDeck.map((item) => (
          <div key={item.title} className="card command-card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Workspace</div>
            <h3>{item.title}</h3>
            <div className="muted" style={{ fontSize: 13, lineHeight: 1.7, minHeight: 72 }}>{item.subtitle}</div>
            <div style={{ marginTop: 14 }}>
              <Link className="secondary-link" href={item.href}>{item.cta}</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="data-rack">
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>What changed visually</h3>
              <div className="muted" style={{ fontSize: 12 }}>The redesign is intentionally more forceful, not a subtle restyle.</div>
            </div>
            <div className="chip">UI overhaul</div>
          </div>
          <div className="panel-grid-2">
            <div className="detail-card compact">
              <span className="field-label">Density</span>
              <strong>More information per viewport</strong>
              <span className="muted" style={{ fontSize: 12 }}>Panels now stack like a trading workstation instead of open marketing cards.</span>
            </div>
            <div className="detail-card compact">
              <span className="field-label">Contrast</span>
              <strong>Sharper separation between shells</strong>
              <span className="muted" style={{ fontSize: 12 }}>Darker foundations, stronger borders, and brighter highlights make the layout feel more premium.</span>
            </div>
            <div className="detail-card compact">
              <span className="field-label">Hierarchy</span>
              <strong>Scanner / ticket / account rhythm</strong>
              <span className="muted" style={{ fontSize: 12 }}>Major workflows are now split into more obvious left-center-right decision areas.</span>
            </div>
            <div className="detail-card compact">
              <span className="field-label">Product feel</span>
              <strong>Settings and overview finally belong</strong>
              <span className="muted" style={{ fontSize: 12 }}>Even the non-trading pages now read like parts of the same terminal product.</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Operator summary</h3>
              <div className="muted" style={{ fontSize: 12 }}>Quick read before dropping into the live desk.</div>
            </div>
          </div>
          <div className="grid">
            <div className="detail-card compact">
              <span className="field-label">Primary objective</span>
              <strong>Execution-first realism</strong>
              <span className="muted" style={{ fontSize: 12 }}>Feels more like a crypto terminal without needing backend scope creep.</span>
            </div>
            <div className="detail-card compact">
              <span className="field-label">Asset lens</span>
              <strong>BTC / ETH / SOL</strong>
              <span className="muted" style={{ fontSize: 12 }}>Majors stay visible across navigation, portfolio, and scanner views.</span>
            </div>
            <div className="detail-card compact">
              <span className="field-label">Entry rail</span>
              <strong>Wallet framing + demo funding</strong>
              <span className="muted" style={{ fontSize: 12 }}>Still product-friendly for demos while looking more serious.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
