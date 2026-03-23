import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const PlaceOrderSchema = z.object({
  accountId: z.string(),
  marketSymbol: z.string(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop-market']),
  size: z.number().positive(),
  price: z.number().positive().optional(),
  leverage: z.number().min(1).max(20),
});

export function registerOrderRoutes(app: FastifyInstance) {
  app.post('/orders', async (request, reply) => {
    const payload = PlaceOrderSchema.parse(request.body);
    const result = app.ctx.orderService.placeSimulatedOrder(payload);
    reply.code(201);
    return { data: result };
  });
}
