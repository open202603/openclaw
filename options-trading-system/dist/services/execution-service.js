export class ExecutionService {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async placeOrder(request) {
        if (!this.deps.riskEngine.canPlaceOrder()) {
            throw new Error('risk engine blocked order');
        }
        if (this.deps.mode === 'paper') {
            console.log('[execution] paper order', request);
            return { orderId: `paper-${Date.now()}` };
        }
        const adapter = this.deps.adapters.find((item) => item.venue === request.venue);
        if (!adapter)
            throw new Error(`adapter not found for venue ${request.venue}`);
        return adapter.placeOrder(request);
    }
}
