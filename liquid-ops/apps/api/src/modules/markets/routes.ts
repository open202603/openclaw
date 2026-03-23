import type { FastifyInstance } from 'fastify';

export function registerMarketRoutes(app: FastifyInstance) {
  app.get('/markets', async () => ({ data: app.ctx.marketData.listMarkets() }));
  app.get('/markets/:symbol', async (request) => {
    const { symbol } = request.params as { symbol: string };
    return { data: app.ctx.marketData.getMarket(symbol) };
  });
}
