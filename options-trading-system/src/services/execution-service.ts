import type { VenueAdapter } from '../core/venue-adapter.js';
import type { PlaceOrderRequest } from '../core/types.js';
import type { RiskEngine } from './risk-engine.js';

export class ExecutionService {
  constructor(
    private readonly deps: {
      mode: 'paper' | 'live';
      adapters: VenueAdapter[];
      riskEngine: RiskEngine;
    },
  ) {}

  async placeOrder(request: PlaceOrderRequest) {
    if (!this.deps.riskEngine.canPlaceOrder()) {
      throw new Error('risk engine blocked order');
    }

    if (this.deps.mode === 'paper') {
      console.log('[execution] paper order', request);
      return { orderId: `paper-${Date.now()}` };
    }

    const adapter = this.deps.adapters.find((item) => item.venue === request.venue);
    if (!adapter) throw new Error(`adapter not found for venue ${request.venue}`);
    return adapter.placeOrder(request);
  }
}
