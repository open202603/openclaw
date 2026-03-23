import type { FastifyInstance } from 'fastify';

export function registerWsRoutes(app: FastifyInstance) {
  app.get('/ws/markets/:symbol', { websocket: true }, (connection, request) => {
    const { symbol } = request.params as { symbol: string };

    const sendSnapshot = () => {
      connection.socket.send(
        JSON.stringify({
          type: 'market.snapshot',
          market: app.ctx.marketData.getMarket(symbol),
          orderBook: app.ctx.marketData.getOrderBook(symbol),
        }),
      );
    };

    sendSnapshot();
    const timer = setInterval(sendSnapshot, 1500);
    connection.socket.on('close', () => clearInterval(timer));
  });

  app.get('/ws/account/:accountId', { websocket: true }, (connection, request) => {
    const { accountId } = request.params as { accountId: string };

    const sendSnapshot = () => {
      connection.socket.send(
        JSON.stringify({
          type: 'account.snapshot',
          portfolio: app.ctx.portfolioService.getPortfolioSnapshot(accountId),
        }),
      );
    };

    sendSnapshot();
    const timer = setInterval(sendSnapshot, 2000);
    connection.socket.on('close', () => clearInterval(timer));
  });
}
