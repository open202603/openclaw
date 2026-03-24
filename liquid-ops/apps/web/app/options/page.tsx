import { fetchOptionsAccountData, fetchOptionsAccountReadiness, fetchOptionsLiveData } from '../../lib/api';

function fmt(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toFixed(digits);
}

function fmtDate(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

function fmtTs(ts: number) {
  return new Date(ts).toISOString().replace('T', ' ').slice(0, 19);
}

type OptionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OptionsDashboardPage(_props: OptionPageProps) {
  let liveData: Awaited<ReturnType<typeof fetchOptionsLiveData>> | null = null;
  let readiness: Awaited<ReturnType<typeof fetchOptionsAccountReadiness>> | null = null;
  let accountData: Awaited<ReturnType<typeof fetchOptionsAccountData>> | null = null;
  let loadError: string | null = null;

  try {
    const [live, ready, account] = await Promise.all([
      fetchOptionsLiveData(),
      fetchOptionsAccountReadiness(),
      fetchOptionsAccountData(),
    ]);
    liveData = live;
    readiness = ready;
    accountData = account;
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Failed to load options dashboard data';
  }

  const instruments = liveData?.instruments.slice(0, 24) ?? [];
  const snapshots = liveData?.snapshots.slice(0, 24) ?? [];
  const venues = liveData ? [...new Set(liveData.instruments.map((item) => item.venue))] : [];
  const balances = accountData?.balances ?? [];
  const positions = accountData?.positions ?? [];
  const openOrders = accountData?.openOrders ?? [];
  const fills = accountData?.fills ?? [];

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
              Liquid Ops is now the operator-facing web entry for the options backend. Public market data is live, private account readiness is surfaced, and the dashboard now has dedicated rails for balances, positions, orders, and fills.
            </p>
            <div className="terminal-statline terminal-statline-pro">
              <div className="statline-pill">{liveData ? `${liveData.instruments.length} instruments` : 'No instrument feed'}</div>
              <div className="statline-pill">{liveData ? `${liveData.snapshots.length} snapshots` : 'No snapshot feed'}</div>
              <div className="statline-pill">{venues.length ? `${venues.length} venues live` : 'Venue feed pending'}</div>
              <div className="statline-pill">{readiness ? `${readiness.readiness.filter((item) => item.enabled).length} private rails ready` : 'No private rails'}</div>
            </div>
          </div>

          <div className="detail-card launch-board-pro" style={{ alignSelf: 'stretch' }}>
            <div className="row" style={{ marginBottom: 12 }}>
              <div>
                <div className="eyebrow">System state</div>
                <h3 style={{ marginTop: 6 }}>Operator board</h3>
              </div>
              <div className="chip">Options core</div>
            </div>
            <div className="grid">
              <div className="list-card-row" style={{ paddingTop: 0 }}>
                <div><strong>Live export</strong><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Public market payload</div></div>
                <div>{liveData ? new Date(liveData.generatedAt).toISOString() : '—'}</div>
              </div>
              <div className="list-card-row" style={{ paddingTop: 0 }}>
                <div><strong>Account export</strong><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Private account payload</div></div>
                <div>{accountData ? new Date(accountData.generatedAt).toISOString() : '—'}</div>
              </div>
              <div className="list-card-row" style={{ paddingTop: 0 }}>
                <div><strong>Credential readiness</strong><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Private rail configuration</div></div>
                <div>{readiness ? `${readiness.readiness.filter((item) => item.enabled).length}/${readiness.readiness.length}` : '—'}</div>
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
            Credential presence is surfaced now. Read-only balances, positions, open orders, and fills are wired into the dashboard structure and will populate when credentials are configured.
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

      <div className="data-rack data-rack-pro">
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Account balances</h3>
              <div className="muted" style={{ fontSize: 12 }}>Read-only private balance export from the options backend.</div>
            </div>
            <div className="chip">{balances.length}</div>
          </div>
          {balances.length ? (
            <div className="options-table">
              <div className="options-table-head">
                <span>Venue</span><span>Currency</span><span>Total</span><span>Available</span><span></span><span></span>
              </div>
              {balances.map((item, idx) => (
                <div key={`${item.venue}:${item.currency}:${idx}`} className="options-table-row">
                  <span>{item.venue}</span><span>{item.currency}</span><span>{fmt(item.total, 6)}</span><span>{fmt(item.available, 6)}</span><span></span><span></span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state">No balances yet — configure Deribit credentials to populate this panel.</div>}
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Open positions</h3>
              <div className="muted" style={{ fontSize: 12 }}>Read-only options positions once private account sync is active.</div>
            </div>
            <div className="chip">{positions.length}</div>
          </div>
          {positions.length ? (
            <div className="options-table">
              <div className="options-table-head options-table-head-wide">
                <span>Venue</span><span>Symbol</span><span>Size</span><span>Avg</span><span>Delta</span><span>Gamma</span><span>Vega</span>
              </div>
              {positions.map((item) => (
                <div key={`${item.venue}:${item.symbol}`} className="options-table-row options-table-row-wide">
                  <span>{item.venue}</span><span>{item.symbol}</span><span>{fmt(item.size, 4)}</span><span>{fmt(item.avgPrice, 4)}</span><span>{fmt(item.delta, 4)}</span><span>{fmt(item.gamma, 4)}</span><span>{fmt(item.vega, 4)}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state">No positions yet — this fills in once read-only private account sync has real credentials.</div>}
        </div>
      </div>

      <div className="data-rack data-rack-pro">
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Open orders</h3>
              <div className="muted" style={{ fontSize: 12 }}>Read-only live order-state rail from the backend.</div>
            </div>
            <div className="chip">{openOrders.length}</div>
          </div>
          {openOrders.length ? (
            <div className="options-table">
              <div className="options-table-head options-table-head-wide">
                <span>Venue</span><span>Symbol</span><span>Side</span><span>Price</span><span>Qty</span><span>Status</span><span>Created</span>
              </div>
              {openOrders.map((item) => (
                <div key={`${item.venue}:${item.orderId}`} className="options-table-row options-table-row-wide">
                  <span>{item.venue}</span><span>{item.symbol}</span><span>{item.side}</span><span>{fmt(item.price, 4)}</span><span>{fmt(item.quantity, 4)}</span><span>{item.status}</span><span>{fmtTs(item.timestamp)}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state">No open orders yet — this panel is waiting for authenticated read-only order sync.</div>}
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <h3>Recent fills</h3>
              <div className="muted" style={{ fontSize: 12 }}>Read-only fill history rail for operator audit and later PnL tracking.</div>
            </div>
            <div className="chip">{fills.length}</div>
          </div>
          {fills.length ? (
            <div className="options-table">
              <div className="options-table-head options-table-head-wide">
                <span>Venue</span><span>Symbol</span><span>Side</span><span>Price</span><span>Qty</span><span>Fee</span><span>Time</span>
              </div>
              {fills.map((item) => (
                <div key={`${item.venue}:${item.fillId}`} className="options-table-row options-table-row-wide">
                  <span>{item.venue}</span><span>{item.symbol}</span><span>{item.side}</span><span>{fmt(item.price, 4)}</span><span>{fmt(item.quantity, 4)}</span><span>{fmt(item.fee, 6)}</span><span>{fmtTs(item.timestamp)}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state">No fills yet — once private account sync is authenticated, recent fills will appear here.</div>}
        </div>
      </div>
    </div>
  );
}
