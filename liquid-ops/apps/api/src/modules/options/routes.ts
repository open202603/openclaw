import type { FastifyInstance } from 'fastify';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_PATH = path.resolve(process.cwd(), '..', 'options-trading-system', 'data', 'live-data.json');

export function registerOptionsRoutes(app: FastifyInstance) {
  app.get('/options/live', async () => {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(raw) as {
      generatedAt: number;
      instruments: Array<Record<string, unknown>>;
      snapshots: Array<Record<string, unknown>>;
    };

    return data;
  });
}
