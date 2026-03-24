export class RiskEngine {
    config;
    constructor(config) {
        this.config = config;
    }
    canPlaceOrder() {
        return true;
    }
    getLimits() {
        return this.config;
    }
}
