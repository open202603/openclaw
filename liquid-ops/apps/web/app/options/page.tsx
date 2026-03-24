const venueRows = [
  {
    venue: 'Deribit',
    status: 'Live instruments + snapshots',
    note: 'BTC options metadata and market snapshots flowing into the backend core.',
  },
  {
    venue: 'Bybit',
    status: 'Live instruments + snapshots',
    note: 'Option ticker surface, mark, index, IV, and greek fields are normalized.',
  },
  {
    venue: 'OKX',
    status: 'Live instruments + snapshots',
    note: 'BTC-USD options contracts and ticker snapshots are normalized into the shared model.',
  },
  {
    venue: 'Binance Options',
    status: 'Live instruments + mark feed',
    note: 'Mark/IV/greeks route into the same market snapshot abstraction.',
  },
];

const rails = [
  ['Core mode', 'Paper / infrastructure-first'],
  ['Instrument universe', '4 venues / BTC options'],
  ['Snapshot rail', 'Polling refresh active'],
  ['Execution rail', 'Unified abstraction'],
  ['Risk posture', 'Pre-trade skeleton'],
  ['Next target', 'Websocket lane + balances'],
];

const commandDeck = [
  {
    title: 'Market core',
    subtitle: 'Unified options instruments plus cross-venue normalized market snapshots.',
    badge: 'Live now',
  },
  {
    title: 'Execution layer',
    subtitle: 'Paper-first order abstraction with venue-specific adapters behind one interface.',
    badge: 'Scaffolded',
  },
  {
    title: 'Risk engine',
    subtitle: 'Foundational caps for delta, vega, and open-order controls before live routing.',
    badge: 'Foundation',
  },
  {
    title: 'Strategy lane',
    subtitle: 'Arbitrage and market-making hooks ready for real signal logic and hedge routing.',
    badge: 'Next up',
  },
];

export default function OptionsDashboardPage() {
  return (
    <div className="platform-grid platform-grid-pro">
      <div className="card overview-hero terminal-banner terminal-hero-pro">
        <div className="hero-grid grid hero-grid-pro">
          <div>
            <div className="eyebrow">Options Trading System // web entry</div>
            <h2 style={{ marginTop: 10, fontSize: 44, lineHeight: 0.98, maxWidth: 860 }}>
              Multi-venue crypto options command surface for Binance, Deribit, OKX, and Bybit.
            </h2>
            <p className="muted" style={{ maxWidth: 820, fontSize: 15, lineHeight: 1.75 }}>
              This is the web dashboard entry for the real options trading core. The backend now loads live instruments and live market snapshots across four venues, while the front-end becomes the operator surface for monitoring arbitrage, risk, and future market-making workflows.
            </p>
            <div className="terminal-statline terminal-statline-pro">
              <div className="statline-pill">4 venue options core</div>
              <div className="statline-pill">200 normalized instruments</div>
              <div className="statline-pill">200 normalized snapshots</div>
              <div className="statline-pill">Paper execution mode</div>
              <div className="statline-pill">Web dashboard primary entry</div>
            </div>
          </div>

          <div className="detail-card launch-board-pro" style={{ alignSelf: 'stretch' }}>
            <div className="row" style={{ marginBottom: 12 }}>
              <div>
                <div className="eyebrow">System posture</div>
                <h3 style={{ marginTop: 6 }}>Operator launch board</h3>
              </div>
              <div className="chip">Options core</div>
            </div>
            <div className="grid">
              {rails.map(([label, value]) => (
                <div key={label} className="list-card-row" style={{ paddingTop: 0 }}>
                  <div>
                    <strong>{label}</strong>
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Current backend state</div>
                  </div>
                  <div>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="command-strip command-strip-pro">
        {commandDeck.map((item) => (
          <div key={item.title} className="card command-card command-card-pro">
            <div className="row" style={{ marginBottom: 10 }}>
              <div className="eyebrow">System lane</div>
              <div className="chip">{item.badge}</div>
            </div>
            <h3>{item.title}</h3>
            <div className="muted" style={{ fontSize: 13, lineHeight: 1.75, minHeight: 84 }}>{item.subtitle}</div>
          </div>
        ))}
      </div>

      <div className="data-rack data-rack-pro">
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Venue coverage</h3>
              <div className="muted" style={{ fontSize: 12 }}>The backend core is already ingesting live options metadata and normalized market snapshots.</div>
            </div>
            <div className="chip">4 venues</div>
          </div>
          <div className="grid">
            {venueRows.map((item) => (
              <div key={item.venue} className="detail-card compact">
                <span className="field-label">{item.venue}</span>
                <strong>{item.status}</strong>
                <span className="muted" style={{ fontSize: 12 }}>{item.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>What comes next</h3>
              <div className="muted" style={{ fontSize: 12 }}>This dashboard will become the primary human-facing control surface for the options core.</div>
            </div>
          </div>
          <div className="grid">
            <div className="detail-card compact">
              <span className="field-label">Next upgrade</span>
              <strong>Realtime websocket rail</strong>
              <span className="muted" style={{ fontSize: 12 }}>Move from polling-backed snapshots toward live venue streaming.</span>
            </div>
            <div className="detail-card compact">
              <span className="field-label">Soon after</span>
              <strong>Account + risk dashboard</strong>
              <span className="muted" style={{ fontSize: 12 }}>Balances, positions, greeks, margin posture, and venue-level health.</span>
            </div>
            <div className="detail-card compact">
              <span className="field-label">Then</span>
              <strong>Arbitrage opportunity matrix</strong>
              <span className="muted" style={{ fontSize: 12 }}>Cross-venue strike/expiry dislocations surfaced for operator review.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
