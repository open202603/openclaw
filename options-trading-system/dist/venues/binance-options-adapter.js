export class BinanceOptionsAdapter {
    venue = 'binance-options';
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
        return { orderId: 'binance-placeholder' };
    }
    async cancelOrder(_request) { }
}
