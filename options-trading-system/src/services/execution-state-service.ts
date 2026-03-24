import type { PlaceOrderRequest, VenueOrder } from '../core/types.js';

export class ExecutionStateService {
  private readonly orders = new Map<string, VenueOrder>();

  recordPaperOrder(request: PlaceOrderRequest, orderId: string) {
    this.orders.set(orderId, {
      venue: request.venue,
      orderId,
      symbol: request.symbol,
      side: request.side,
      price: request.price,
      quantity: request.quantity,
      status: 'open',
      timestamp: Date.now(),
    });
  }

  markCancelled(orderId: string) {
    const existing = this.orders.get(orderId);
    if (!existing) return;
    this.orders.set(orderId, { ...existing, status: 'cancelled' });
  }

  getOpenOrders() {
    return [...this.orders.values()].filter((item) => item.status === 'open');
  }
}
