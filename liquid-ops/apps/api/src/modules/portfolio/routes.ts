import type { FastifyInstance } from 'fastify';

export function registerPortfolioRoutes(app: FastifyInstance) {
  app.get('/portfolio/:accountId', async (request) => {
    const { accountId } = request.params as { accountId: string };
    return { data: app.ctx.portfolioService.getAccountSnapshot(accountId) };
  });

  app.get('/positions/:accountId', async (request) => {
    const { accountId } = request.params as { accountId: string };
    return { data: app.ctx.portfolioService.getPositions(accountId) };
  });
}
