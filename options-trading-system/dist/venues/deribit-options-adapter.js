export class DeribitOptionsAdapter {
    venue = 'deribit';
    async loadInstruments() {
        return [];
    }
    async connectMarketData(onSnapshot) {
        onSnapshot({
            venue: this.venue,
            symbol: 'BTC-TEST',
            bidPrice: null,
            askPrice: null,
            bidSize: null,
            askSize: null,
            markPrice: null,
            indexPrice: null,
            impliedVol: null,
            timestamp: Date.now(),
        });
    }
    async syncBalances() {
        return [];
    }
    async syncPositions() {
        return [];
    }
    async placeOrder(_request) {
        return { orderId: 'deribit-placeholder' };
    }
    async cancelOrder(_request) { }
}
