export class MarketDataService {
    adapters;
    snapshots = new Map();
    constructor(adapters) {
        this.adapters = adapters;
    }
    async start() {
        for (const adapter of this.adapters) {
            await adapter.connectMarketData((snapshot) => {
                this.snapshots.set(`${snapshot.venue}:${snapshot.symbol}`, snapshot);
            });
        }
        console.log('[market-data] adapters connected:', this.adapters.map((adapter) => adapter.venue).join(', '));
    }
    getSnapshot(key) {
        return this.snapshots.get(key);
    }
}
