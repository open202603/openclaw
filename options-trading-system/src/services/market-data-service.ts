import type { VenueAdapter } from '../core/venue-adapter.js';
import type { MarketSnapshot } from '../core/types.js';

export class MarketDataService {
  private readonly snapshots = new Map<string, MarketSnapshot>();

  constructor(private readonly adapters: VenueAdapter[]) {}

  async start() {
    for (const adapter of this.adapters) {
      await adapter.connectMarketData((snapshot) => {
        this.snapshots.set(`${snapshot.venue}:${snapshot.symbol}`, snapshot);
      });
    }

    console.log('[market-data] adapters connected:', this.adapters.map((adapter) => adapter.venue).join(', '));
    console.log('[market-data] snapshots loaded:', this.snapshots.size);
  }

  getSnapshot(key: string) {
    return this.snapshots.get(key);
  }
}
