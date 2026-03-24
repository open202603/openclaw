import type { FastifyInstance } from 'fastify';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_PATH = path.resolve(process.cwd(), '..', 'options-trading-system', 'data', 'account-data.json');

export function registerOptionsAccountDataRoutes(app: FastifyInstance) {
  app.get('/options/account-data', async () => {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw) as {
      generatedAt: number;
      balances: Array<Record<string, unknown>>;
      positions: Array<Record<string, unknown>>;
      openOrders: Array<Record<string, unknown>>;
      fills: Array<Record<string, unknown>>;
    };
  });
}
