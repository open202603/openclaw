import Link from 'next/link';
import { TopbarWalletCta } from './topbar-wallet-cta';

const nav = [
  { href: '/', label: 'Command', subtitle: 'Launch board, venue posture, operator brief' },
  { href: '/trade', label: 'Trade', subtitle: 'Order book, chart, ticket, fills, and position control' },
  { href: '/portfolio', label: 'Portfolio', subtitle: 'Collateral, majors mix, equity, and risk posture' },
  { href: '/markets', label: 'Markets', subtitle: 'Scanner, leadership, breadth, and rotation context' },
  { href: '/settings', label: 'Settings', subtitle: 'Workspace defaults, rails, and terminal profile' },
];

const watchlist = [
  { symbol: 'BTC-PERP', mark: '$104,280', change: '+3.2%', note: 'Liquidity leader' },
  { symbol: 'ETH-PERP', mark: '$5,980', change: '+2.1%', note: 'Beta rotation' },
  { symbol: 'SOL-PERP', mark: '$185.40', change: '-1.4%', note: 'Momentum lane' },
];

const healthRows = [
  ['Venue', 'Perps sim'],
  ['Margin', 'Cross'],
  ['Risk', 'Nominal'],
  ['Latency', '38 ms'],
];

const accountRows = [
  ['Collateral rail', 'Wallet + demo'],
  ['Routing', 'Internal matching'],
  ['Universe', 'BTC / ETH / SOL'],
  ['Session', 'Asia / UTC'],
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell shell-pro">
      <aside className="sidebar sidebar-pro">
        <div className="sidebar-panel brand-panel">
          <div className="brand-row brand-row-pro">
            <div className="brand-mark">LO</div>
            <div>
              <div className="brand-title">Liquid Ops</div>
              <div className="brand-subtitle">Professional derivatives workspace</div>
            </div>
          </div>
          <div className="terminal-statline" style={{ marginTop: 14 }}>
            <div className="statline-pill">Operator shell</div>
            <div className="statline-pill">Majors only</div>
            <div className="statline-pill">Realtime sim</div>
          </div>
        </div>

        <div className="sidebar-panel compact-card status-panel">
          <div className="row" style={{ marginBottom: 10 }}>
            <div className="eyebrow">Venue health</div>
            <div className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span className="status-dot" /> Live
            </div>
          </div>
          <div className="panel-stack-tight">
            {healthRows.map(([label, value]) => (
              <div key={label} className="mini-stat-row stat-row-pro">
                <span className="muted">{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-panel nav-panel">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Workspace map</div>
          <nav>
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="nav-link-title">{item.label}</div>
                <div className="nav-link-subtitle">{item.subtitle}</div>
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-panel tape-panel">
          <div className="row" style={{ marginBottom: 10 }}>
            <div className="eyebrow">Majors tape</div>
            <div className="chip">24h</div>
          </div>
          <div className="watch-grid">
            {watchlist.map((item) => (
              <div key={item.symbol} className="watch-card watch-card-pro">
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

        <div className="sidebar-panel compact-card account-panel">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Desk rails</div>
          <div className="panel-stack-tight">
            {accountRows.map(([label, value]) => (
              <div key={label} className="mini-stat-row stat-row-pro">
                <span className="muted">{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="main main-pro">
        <div className="topbar topbar-pro">
          <div>
            <div className="topbar-subtitle">Liquid Ops // derivatives command surface</div>
            <div className="topbar-title">Execution workspace</div>
          </div>
          <div className="topbar-actions">
            <div className="chip">Cross margin</div>
            <div className="chip">Professional density</div>
            <div className="chip">Depth + fills + risk</div>
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
