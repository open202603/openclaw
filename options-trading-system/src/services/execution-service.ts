import type { VenueAdapter } from '../core/venue-adapter.js';
import type { PlaceOrderRequest } from '../core/types.js';
import type { ExecutionStateService } from './execution-state-service.js';
import type { KillSwitchService } from './kill-switch-service.js';
import type { RiskEngine } from './risk-engine.js';

export class ExecutionService {
  constructor(
    private readonly deps: {
      mode: 'paper' | 'live';
      adapters: VenueAdapter[];
      riskEngine: RiskEngine;
      killSwitch: KillSwitchService;
      executionState: ExecutionStateService;
    },
  ) {}

  async placeOrder(request: PlaceOrderRequest) {
    const currentOpenOrders = this.deps.executionState.getOpenOrders().length;
    const orderNotional = request.price * request.quantity;

    if (this.deps.killSwitch.isEnabled()) {
      throw new Error('kill switch engaged');
    }

    if (!this.deps.riskEngine.canPlaceOrder({ currentOpenOrders, orderNotional })) {
      throw new Error('risk engine blocked order');
    }

    if (this.deps.mode === 'paper') {
      const orderId = `paper-${Date.now()}`;
      this.deps.executionState.recordPaperOrder(request, orderId);
      console.log('[execution] paper order', request);
      return { orderId };
    }

    const adapter = this.deps.adapters.find((item) => item.venue === request.venue);
    if (!adapter) throw new Error(`adapter not found for venue ${request.venue}`);
    return adapter.placeOrder(request);
  }

  cancelOrder(orderId: string) {
    this.deps.executionState.markCancelled(orderId);
  }
}
