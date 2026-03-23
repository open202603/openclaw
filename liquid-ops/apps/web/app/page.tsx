import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="platform-grid">
      <div className="card overview-hero">
        <div className="hero-grid grid">
          <div>
            <div className="eyebrow">Liquid Ops Terminal</div>
            <h2 style={{ marginTop: 10, fontSize: 38, lineHeight: 1.02, maxWidth: 720 }}>
              A denser, more credible crypto trading workspace from the first screen.
            </h2>
            <p className="muted" style={{ maxWidth: 700, fontSize: 15, lineHeight: 1.7 }}>
              Trade, monitor portfolio risk, scan majors, and tune desk preferences inside a UI that feels materially closer to a pro derivatives terminal instead of a starter demo.
            </p>
            <div className="overview-actions">
              <Link className="primary-link" href="/trade">Open trade desk</Link>
              <Link className="secondary-link" href="/portfolio">View portfolio</Link>
              <Link className="secondary-link" href="/markets">Scan markets</Link>
            </div>
          </div>

          <div className="detail-card" style={{ alignSelf: 'stretch' }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>What changed</div>
            <div className="list-card-row">
              <div>
                <strong>Stronger panel hierarchy</strong>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>More like a real desk: shell, hero, context strip, execution stack.</div>
              </div>
            </div>
            <div className="list-card-row">
              <div>
                <strong>Higher information density</strong>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Market pulse, book imbalance, exposure, reserved margin, fills, and risk all visible together.</div>
              </div>
            </div>
            <div className="list-card-row">
              <div>
                <strong>Portfolio / markets / settings feel intentional</strong>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>No more thin placeholder screens around the trading experience.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid page-columns-3">
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Trade</h3>
              <div className="muted" style={{ fontSize: 12 }}>Primary execution surface</div>
            </div>
            <div className="pill buy">Flagship</div>
          </div>
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
            Pro-style top banner, denser market context, chart + positions center stack, and order-entry / open-orders / recent-fills on the right for a more immediate terminal feel.
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Portfolio</h3>
              <div className="muted" style={{ fontSize: 12 }}>Risk and equity centric</div>
            </div>
            <div className="chip">Exposure</div>
          </div>
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
            The same terminal primitives are reorganized to foreground account state, net exposure, and equity behaviour instead of just entry widgets.
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Markets & Settings</h3>
              <div className="muted" style={{ fontSize: 12 }}>Scan + configure</div>
            </div>
            <div className="chip">Desk UX</div>
          </div>
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
            Markets leans into cross-market discovery; settings now looks like a real terminal preferences page with execution, display, and safety controls.
          </div>
        </div>
      </div>
    </div>
  );
}
