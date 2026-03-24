export class RiskEngine {
  constructor(
    private readonly config: {
      maxDelta: number;
      maxVega: number;
      maxOpenOrders: number;
      maxOrderNotional: number;
      maxDailyLoss: number;
      killSwitchEnabled: boolean;
    },
  ) {}

  canPlaceOrder(input?: { currentOpenOrders?: number; orderNotional?: number }) {
    if (this.config.killSwitchEnabled) return false;
    if ((input?.currentOpenOrders ?? 0) >= this.config.maxOpenOrders) return false;
    if ((input?.orderNotional ?? 0) > this.config.maxOrderNotional) return false;
    return true;
  }

  getLimits() {
    return this.config;
  }
}
