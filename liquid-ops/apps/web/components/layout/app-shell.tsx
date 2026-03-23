import Link from 'next/link';

const nav = [
  { href: '/', label: 'Overview' },
  { href: '/trade', label: 'Trade' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/markets', label: 'Markets' },
  { href: '/settings', label: 'Settings' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>Liquid Ops</h1>
        <nav>
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>SIMULATED TRADING</div>
            <h2 style={{ margin: '4px 0 0' }}>BTC-PERP Terminal</h2>
          </div>
          <div className="badge">Sandbox Mode</div>
        </div>
        {children}
      </main>
    </div>
  );
}
