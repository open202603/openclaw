import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { registerHealthRoutes } from './modules/health/routes.js';
import { registerMarketRoutes } from './modules/markets/routes.js';
import { registerOptionsAccountDataRoutes } from './modules/options/account-data-routes.js';
import { registerOptionsAccountRoutes } from './modules/options/account-routes.js';
import { registerOptionsRoutes } from './modules/options/routes.js';
import { registerOrderRoutes } from './modules/orders/routes.js';
import { registerPortfolioRoutes } from './modules/portfolio/routes.js';
import { registerWsRoutes } from './modules/ws/routes.js';
import { buildAppContext } from './services/app-context.js';

const app = Fastify({ logger: true });
const context = buildAppContext();

await app.register(cors, { origin: true });
await app.register(websocket);

app.decorate('ctx', context);

declare module 'fastify' {
  interface FastifyInstance {
    ctx: ReturnType<typeof buildAppContext>;
  }
}

registerHealthRoutes(app);
registerMarketRoutes(app);
registerOrderRoutes(app);
registerPortfolioRoutes(app);
registerOptionsRoutes(app);
registerOptionsAccountRoutes(app);
registerOptionsAccountDataRoutes(app);
registerWsRoutes(app);

const port = Number(process.env.PORT ?? 4000);
app.listen({ port, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
