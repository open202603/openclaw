import type { FastifyInstance } from 'fastify';
import type { PortfolioSnapshot } from '@liquid-ops/types';

export function registerWsRoutes(app: FastifyInstance) {
  app.get('/ws/markets/:symbol', { websocket: true }, (connection, request) => {
    const { symbol } = request.params as { symbol: string };
    const normalizedSymbol = symbol.toUpperCase();

    const sendSnapshot = () => {
      connection.socket.send(
        JSON.stringify({
          type: 'market.snapshot',
          market: app.ctx.marketData.getMarket(normalizedSymbol),
          orderBook: app.ctx.marketData.getOrderBook(normalizedSymbol),
        }),
      );
    };

    const onTick = (eventSymbol: string) => {
      if (eventSymbol === normalizedSymbol) sendSnapshot();
    };

    app.ctx.marketData.on('market.tick', onTick);
    sendSnapshot();
    connection.socket.on('close', () => app.ctx.marketData.off('market.tick', onTick));
  });

  app.get('/ws/account/:accountId', { websocket: true }, (connection, request) => {
    const { accountId } = request.params as { accountId: string };

    const sendSnapshot = (snapshot?: PortfolioSnapshot) => {
      connection.socket.send(
        JSON.stringify({
          type: 'account.snapshot',
          portfolio: snapshot ?? app.ctx.portfolioService.getPortfolioSnapshot(accountId),
        }),
      );
    };

    const onUpdate = (eventAccountId: string, snapshot: PortfolioSnapshot) => {
      if (eventAccountId === accountId) sendSnapshot(snapshot);
    };

    app.ctx.portfolioService.on('account.updated', onUpdate);
    sendSnapshot();
    connection.socket.on('close', () => app.ctx.portfolioService.off('account.updated', onUpdate));
  });
}
