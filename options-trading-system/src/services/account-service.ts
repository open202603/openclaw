import type { VenueAdapter } from '../core/venue-adapter.js';
import type { VenueBalance, VenuePosition } from '../core/types.js';

export class AccountService {
  private balances: VenueBalance[] = [];
  private positions: VenuePosition[] = [];

  constructor(private readonly adapters: VenueAdapter[]) {}

  async start() {
    for (const adapter of this.adapters) {
      const balances = await adapter.syncBalances();
      const positions = await adapter.syncPositions();
      this.balances.push(...balances);
      this.positions.push(...positions);
    }

    console.log('[accounts] synced balances:', this.balances.length, 'positions:', this.positions.length);
  }

  getBalances() {
    return this.balances;
  }

  getPositions() {
    return this.positions;
  }
}
