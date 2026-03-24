import type { FastifyInstance } from 'fastify';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_PATH = path.resolve(process.cwd(), '..', 'options-trading-system', 'data', 'account-readiness.json');

export function registerOptionsAccountRoutes(app: FastifyInstance) {
  app.get('/options/account-readiness', async () => {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw) as {
      generatedAt: number;
      readiness: Array<{ venue: string; enabled: boolean }>;
    };
  });
}
