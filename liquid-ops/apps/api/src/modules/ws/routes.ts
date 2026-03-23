import type { FastifyInstance } from 'fastify';

export function registerWsRoutes(app: FastifyInstance) {
  app.get('/ws', { websocket: true }, (socket) => {
    socket.send(JSON.stringify({ type: 'welcome', message: 'Liquid Ops stream connected' }));

    const ticker = setInterval(() => {
      socket.send(JSON.stringify({
        type: 'market.tick',
        data: app.ctx.marketData.listMarkets(),
        sentAt: new Date().toISOString(),
      }));
    }, 2000);

    socket.on('close', () => clearInterval(ticker));
  });
}
