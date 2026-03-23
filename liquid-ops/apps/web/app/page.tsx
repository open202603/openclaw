import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Liquid Ops</h2>
        <p className="muted">
          A startup-grade foundation for a Hyperliquid-style product, launching first as a premium simulated trading terminal.
        </p>
        <div className="row" style={{ marginTop: 16 }}>
          <Link className="badge" href="/trade">Open terminal</Link>
          <span className="muted">Phase 1: sandbox trading, market streams, portfolio, auditability</span>
        </div>
      </div>
    </div>
  );
}
