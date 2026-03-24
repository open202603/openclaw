export class RiskEngine {
  constructor(private readonly config: { maxDelta: number; maxVega: number; maxOpenOrders: number }) {}

  canPlaceOrder() {
    return true;
  }

  getLimits() {
    return this.config;
  }
}
