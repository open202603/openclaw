import type { VenueAdapter } from '../core/venue-adapter.js';
import type { MarketSnapshot } from '../core/types.js';

export class MarketDataService {
  private readonly snapshots = new Map<string, MarketSnapshot>();

  constructor(
    private readonly adapters: VenueAdapter[],
    private readonly refreshMs: number,
  ) {}

  private acceptSnapshot = (snapshot: MarketSnapshot) => {
    this.snapshots.set(`${snapshot.venue}:${snapshot.symbol}`, snapshot);
  };

  async start() {
    for (const adapter of this.adapters) {
      await adapter.connectMarketData(this.acceptSnapshot);
    }

    console.log('[market-data] adapters connected:', this.adapters.map((adapter) => adapter.venue).join(', '));
    console.log('[market-data] snapshots loaded:', this.snapshots.size);

    setInterval(() => {
      this.refreshAll().catch((error) => {
        console.error('[market-data] refresh failed', error);
      });
    }, this.refreshMs).unref();
  }

  async refreshAll() {
    for (const adapter of this.adapters) {
      if (!adapter.refreshMarketData) continue;
      await adapter.refreshMarketData(this.acceptSnapshot);
    }

    console.log('[market-data] refresh complete, snapshots:', this.snapshots.size);
  }

  getSnapshot(key: string) {
    return this.snapshots.get(key);
  }
}
