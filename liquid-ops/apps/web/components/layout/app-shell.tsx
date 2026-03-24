import Link from 'next/link';
import { TopbarWalletCta } from './topbar-wallet-cta';

const nav = [
  { href: '/', label: 'Overview', subtitle: 'Desk launchpad, product narrative, operator snapshot' },
  { href: '/trade', label: 'Trade', subtitle: 'Chart, depth, execution, fills, position control' },
  { href: '/portfolio', label: 'Portfolio', subtitle: 'Equity, majors mix, balance sheet, funding posture' },
  { href: '/markets', label: 'Markets', subtitle: 'Scanner, leadership, momentum, contract rotation' },
  { href: '/settings', label: 'Settings', subtitle: 'Theme, risk rails, workflow toggles, desk presets' },
];

const watchlist = [
  { symbol: 'BTC-PERP', mark: '$104,280', change: '+3.2%', note: 'Depth leader' },
  { symbol: 'ETH-PERP', mark: '$5,980', change: '+2.1%', note: 'High beta' },
  { symbol: 'SOL-PERP', mark: '$185.40', change: '-1.4%', note: 'Momentum lane' },
];

const rails = [
  ['Margin mode', 'Cross'],
  ['Routing', 'Internal sim'],
  ['Latency', '38 ms'],
  ['Session', 'Asia / UTC'],
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-panel">
          <div className="brand-row">
            <div className="brand-mark">LO</div>
            <div>
              <div className="brand-title">Liquid Ops</div>
              <div className="brand-subtitle">Pro-mode simulated derivatives desk</div>
            </div>
          </div>
        </div>

        <div className="sidebar-panel compact-card">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Terminal state</div>
          <div className="mini-stat-row">
            <span className="muted">Venue</span>
            <strong>Perps Demo</strong>
          </div>
          <div className="mini-stat-row">
            <span className="muted">Account rail</span>
            <span className="badge">Wallet + demo</span>
          </div>
          <div className="mini-stat-row">
            <span className="muted">Risk engine</span>
            <strong className="tone-positive">Nominal</strong>
          </div>
        </div>

        <div className="sidebar-panel">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Navigation</div>
          <nav>
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="nav-link-title">{item.label}</div>
                <div className="nav-link-subtitle">{item.subtitle}</div>
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-panel">
          <div className="row" style={{ marginBottom: 10 }}>
            <div className="eyebrow">Majors tape</div>
            <div className="chip">24h</div>
          </div>
          <div className="watch-grid">
            {watchlist.map((item) => (
              <div key={item.symbol} className="watch-card">
                <div className="row">
                  <strong>{item.symbol}</strong>
                  <span className={item.change.startsWith('-') ? 'tone-negative' : 'tone-positive'}>{item.change}</span>
                </div>
                <div className="row" style={{ marginTop: 6, fontSize: 12 }}>
                  <span className="muted">{item.mark}</span>
                  <span className="muted">{item.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-panel compact-card">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Ops rails</div>
          {rails.map(([label, value]) => (
            <div key={label} className="mini-stat-row">
              <span className="muted">{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <div className="topbar-subtitle">Simulated crypto derivatives terminal</div>
            <div className="topbar-title">Dense execution workspace</div>
          </div>
          <div className="topbar-actions">
            <div className="chip">Cross Margin</div>
            <div className="chip">Majors Only</div>
            <div className="chip">Realtime Feed</div>
            <TopbarWalletCta />
            <div className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span className="status-dot" /> Desk online
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
