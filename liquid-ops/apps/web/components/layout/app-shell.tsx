import Link from 'next/link';

const nav = [
  { href: '/', label: 'Overview', subtitle: 'Desk summary and launchpad' },
  { href: '/trade', label: 'Trade', subtitle: 'Execution, chart, depth, orders' },
  { href: '/portfolio', label: 'Portfolio', subtitle: 'Exposure, PnL, account state' },
  { href: '/markets', label: 'Markets', subtitle: 'Watchlist and cross-market scan' },
  { href: '/settings', label: 'Settings', subtitle: 'Terminal preferences and risk rails' },
];

const watchlist = [
  ['BTC-PERP', '+3.2%'],
  ['ETH-PERP', '+2.1%'],
  ['SOL-PERP', '-1.4%'],
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
              <div className="brand-subtitle">Simulated multi-asset terminal</div>
            </div>
          </div>
        </div>

        <div className="sidebar-panel">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Workspace</div>
          <div className="mini-stat-row">
            <span className="muted">Mode</span>
            <span className="badge">Sandbox</span>
          </div>
          <div className="mini-stat-row">
            <span className="muted">Venue</span>
            <strong>Perps Demo</strong>
          </div>
          <div className="mini-stat-row">
            <span className="muted">Latency</span>
            <strong className="tone-positive">Realtime-ish</strong>
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
          <div className="eyebrow" style={{ marginBottom: 10 }}>Watchlist</div>
          {watchlist.map(([symbol, change]) => (
            <div key={symbol} className="watch-row">
              <div>
                <strong>{symbol}</strong>
              </div>
              <span className={change.startsWith('-') ? 'tone-negative' : 'tone-positive'}>{change}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-panel">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Desk notes</div>
          <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
            Built to feel like a serious trading screen on first load: tighter hierarchy, denser panels, faster scanning.
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <div className="topbar-subtitle">SIMULATED CRYPTO DERIVATIVES DESK</div>
            <div className="topbar-title">Professional trading terminal</div>
          </div>
          <div className="topbar-actions">
            <div className="chip">Cross Margin</div>
            <div className="chip">1m Stream</div>
            <div className="chip">3 Markets</div>
            <div className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span className="status-dot" /> Live demo feed
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
