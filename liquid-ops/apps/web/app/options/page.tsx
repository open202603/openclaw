import { fetchOptionsAccountReadiness, fetchOptionsLiveData } from '../../lib/api';

function fmt(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toFixed(digits);
}

function fmtDate(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

type OptionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OptionsDashboardPage(_props: OptionPageProps) {
  let data: Awaited<ReturnType<typeof fetchOptionsLiveData>> | null = null;
  let readiness: Awaited<ReturnType<typeof fetchOptionsAccountReadiness>> | null = null;
  let loadError: string | null = null;

  try {
    const [liveData, readinessData] = await Promise.all([
      fetchOptionsLiveData(),
      fetchOptionsAccountReadiness(),
    ]);
    data = liveData;
    readiness = readinessData;
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Failed to load options live data';
  }

  const instruments = data?.instruments.slice(0, 24) ?? [];
  const snapshots = data?.snapshots.slice(0, 24) ?? [];
  const venues = data ? [...new Set(data.instruments.map((item) => item.venue))] : [];

  return (
    <div className="platform-grid platform-grid-pro">
      <div className="card overview-hero terminal-banner terminal-hero-pro">
        <div className="hero-grid grid hero-grid-pro">
          <div>
            <div className="eyebrow">Options Trading System // live dashboard</div>
            <h2 style={{ marginTop: 10, fontSize: 44, lineHeight: 0.98, maxWidth: 860 }}>
              Live multi-venue crypto options dashboard across Binance, Deribit, OKX, and Bybit.
            </h2>
            <p className="muted" style={{ maxWidth: 820, fontSize: 15, lineHeight: 1.75 }}>
              Liquid Ops is now acting as the web entry for the real options backend. The next stage is private-account visibility: credential readiness first, then read-only balances, positions, open orders, and fills.
            </p>
            <div className="terminal-statline terminal-statline-pro">
              <div className="statline-pill">{data ? `${data.instruments.length} instruments` : 'No instrument feed'}</div>
              <div className="statline-pill">{data ? `${data.snapshots.length} snapshots` : 'No snapshot feed'}</div>
              <div className="statline-pill">{venues.length ? `${venues.length} venues live` : 'Venue feed pending'}</div>
              <div className="statline-pill">{readiness ? `${readiness.readiness.filter((item) => item.enabled).length} private rails ready` : 'No private rails'}</div>
            </div>
          </div>

          <div className="detail-card launch-board-pro" style={{ alignSelf: 'stretch' }}>
            <div className="row" style={{ marginBottom: 12 }}>
              <div>
                <div className="eyebrow">Feed status</div>
                <h3 style={{ marginTop: 6 }}>Dashboard state</h3>
              </div>
              <div className="chip">Live read</div>
            </div>
            <div className="grid">
              <div className="list-card-row" style={{ paddingTop: 0 }}>
                <div><strong>Generated at</strong><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Backend export timestamp</div></div>
                <div>{data ? new Date(data.generatedAt).toISOString() : '—'}</div>
              </div>
              <div className="list-card-row" style={{ paddingTop: 0 }}>
                <div><strong>Account readiness</strong><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Credential scaffold status</div></div>
                <div>{readiness ? `${readiness.readiness.filter((item) => item.enabled).length}/${readiness.readiness.length}` : '—'}</div>
              </div>
              <div className="list-card-row" style={{ paddingTop: 0 }}>
                <div><strong>Snapshot rail</strong><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Cross-venue market reads</div></div>
                <div>{data ? data.snapshots.length : 0}</div>
              </div>
              <div className="list-card-row" style={{ paddingTop: 0 }}>
                <div><strong>Load state</strong><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Front-end read from API</div></div>
                <div>{loadError ? 'Error' : 'Healthy'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loadError ? (
        <div className="card">
          <h3>Options feed unavailable</h3>
          <div className="muted" style={{ fontSize: 13 }}>{loadError}</div>
        </div>
      ) : null}

      <div className="command-strip command-strip-pro">
        <div className="card command-card command-card-pro">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Execution posture</div>
          <h3>Paper-first, real-market-backed</h3>
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.75 }}>
            Live public market data is already flowing. The next real-trading step is private account connectivity, then execution, then kill-switch and risk gating.
          </div>
        </div>
        <div className="card command-card command-card-pro">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Account readiness</div>
          <h3>Private venue rails scaffolded</h3>
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.75 }}>
            Credential presence is now surfaced. Read-only balances, positions, open orders, and fills are the next layer to wire in.
          </div>
        </div>
        <div className="card command-card command-card-pro">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Risk rail</div>
          <h3>Kill-switch path planned</h3>
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.75 }}>
            Real trading will not be enabled before venue health gating, order-state discipline, and explicit risk controls are in the loop.
          </div>
        </div>
      </div>

      {readiness ? (
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Venue credential readiness</h3>
              <div className="muted" style={{ fontSize: 12 }}>This is the first private-account layer before balances and positions come online.</div>
            </div>
            <div className="chip">Read-only path</div>
          </div>
          <div className="options-table">
            <div className="options-table-head">
              <span>Venue</span>
              <span>Status</span>
              <span>Mode</span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            {readiness.readiness.map((item) => (
              <div key={item.venue} className="options-table-row">
                <span>{item.venue}</span>
                <span>{item.enabled ? 'configured' : 'missing'}</span>
                <span>{item.enabled ? 'private rail possible' : 'public only'}</span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="data-rack data-rack-pro">
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Normalized instruments</h3>
              <div className="muted" style={{ fontSize: 12 }}>BTC options contracts already flowing through the shared model.</div>
            </div>
            <div className="chip">Top 24</div>
          </div>
          <div className="options-table">
            <div className="options-table-head">
              <span>Venue</span><span>Symbol</span><span>Expiry</span><span>Strike</span><span>Side</span><span>Settle</span>
            </div>
            {instruments.map((item) => (
              <div key={`${item.venue}:${item.symbol}`} className="options-table-row">
                <span>{item.venue}</span><span>{item.symbol}</span><span>{fmtDate(item.expiryTs)}</span><span>{fmt(item.strike, 0)}</span><span>{item.optionSide}</span><span>{item.settlementCurrency}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Market snapshots</h3>
              <div className="muted" style={{ fontSize: 12 }}>Normalized top-of-book / mark / IV reads from the backend core.</div>
            </div>
            <div className="chip">Top 24</div>
          </div>
          <div className="options-table">
            <div className="options-table-head options-table-head-wide">
              <span>Venue</span><span>Symbol</span><span>Bid</span><span>Ask</span><span>Mark</span><span>Index</span><span>IV</span>
            </div>
            {snapshots.map((item) => (
              <div key={`${item.venue}:${item.symbol}`} className="options-table-row options-table-row-wide">
                <span>{item.venue}</span><span>{item.symbol}</span><span>{fmt(item.bidPrice, 4)}</span><span>{fmt(item.askPrice, 4)}</span><span>{fmt(item.markPrice, 4)}</span><span>{fmt(item.indexPrice, 2)}</span><span>{fmt(item.impliedVol, 4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
