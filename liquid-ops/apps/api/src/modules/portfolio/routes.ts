import type { FastifyInstance } from 'fastify';

export function registerPortfolioRoutes(app: FastifyInstance) {
  app.get('/portfolio/:accountId', async (request) => {
    const { accountId } = request.params as { accountId: string };
    return app.ctx.portfolioService.getPortfolioSnapshot(accountId);
  });

  app.get('/portfolio/:accountId/history', async (request) => {
    const { accountId } = request.params as { accountId: string };
    return { history: app.ctx.portfolioService.getPortfolioHistory(accountId) };
  });
}
