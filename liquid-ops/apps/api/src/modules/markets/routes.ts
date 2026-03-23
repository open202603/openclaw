import type { FastifyInstance } from 'fastify';

export function registerMarketRoutes(app: FastifyInstance) {
  app.get('/markets', async () => ({ markets: app.ctx.marketData.listMarkets() }));

  app.get('/markets/:symbol', async (request, reply) => {
    const { symbol } = request.params as { symbol: string };
    const market = app.ctx.marketData.getMarket(symbol);
    if (!market) return reply.code(404).send({ message: 'Market not found' });
    return { market };
  });

  app.get('/markets/:symbol/order-book', async (request, reply) => {
    const { symbol } = request.params as { symbol: string };
    const orderBook = app.ctx.marketData.getOrderBook(symbol);
    if (!orderBook) return reply.code(404).send({ message: 'Market not found' });
    return { orderBook };
  });

  app.get('/markets/:symbol/candles', async (request) => {
    const { symbol } = request.params as { symbol: string };
    const { points } = request.query as { points?: string };
    return { candles: app.ctx.marketData.getCandles(symbol, Number(points ?? 24)) };
  });
}
