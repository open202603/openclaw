import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const placeOrderSchema = z.object({
  accountId: z.string().min(1),
  marketSymbol: z.string().min(1),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop-market']),
  size: z.number().positive(),
  price: z.number().positive().optional(),
  leverage: z.number().min(1).max(10),
});

const cancelOrderQuerySchema = z.object({
  accountId: z.string().min(1),
});

export function registerOrderRoutes(app: FastifyInstance) {
  app.post('/orders', async (request, reply) => {
    try {
      const payload = placeOrderSchema.parse(request.body);
      return app.ctx.orderService.placeSimulatedOrder(payload);
    } catch (error) {
      request.log.warn({ error }, 'order rejected');
      return reply.code(400).send({ message: error instanceof Error ? error.message : 'Invalid order request' });
    }
  });

  app.delete('/orders/:orderId', async (request, reply) => {
    try {
      const { orderId } = request.params as { orderId: string };
      const { accountId } = cancelOrderQuerySchema.parse(request.query);
      return app.ctx.orderService.cancelOrder(accountId, orderId);
    } catch (error) {
      request.log.warn({ error }, 'cancel rejected');
      return reply.code(400).send({ message: error instanceof Error ? error.message : 'Invalid cancel request' });
    }
  });
}
