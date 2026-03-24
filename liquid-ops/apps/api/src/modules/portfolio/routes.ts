import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const depositSchema = z.object({
  amount: z.number().positive(),
});

export function registerPortfolioRoutes(app: FastifyInstance) {
  app.get('/portfolio/:accountId', async (request) => {
    const { accountId } = request.params as { accountId: string };
    return app.ctx.portfolioService.getPortfolioSnapshot(accountId);
  });

  app.get('/portfolio/:accountId/history', async (request) => {
    const { accountId } = request.params as { accountId: string };
    return { history: app.ctx.portfolioService.getPortfolioHistory(accountId) };
  });

  app.post('/portfolio/:accountId/deposit', async (request, reply) => {
    try {
      const { accountId } = request.params as { accountId: string };
      const { amount } = depositSchema.parse(request.body);
      return app.ctx.portfolioService.depositFunds(accountId, amount);
    } catch (error) {
      request.log.warn({ error }, 'deposit rejected');
      return reply.code(400).send({ message: error instanceof Error ? error.message : 'Invalid deposit request' });
    }
  });
}
