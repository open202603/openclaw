import type { FastifyInstance } from 'fastify';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_PATH = path.resolve(process.cwd(), '..', 'options-trading-system', 'data', 'risk-status.json');

export function registerOptionsRiskRoutes(app: FastifyInstance) {
  app.get('/options/risk-status', async () => {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw) as {
      generatedAt: number;
      executionMode: string;
      killSwitchEnabled: boolean;
      limits: Record<string, unknown>;
      executionState: { openOrderCount: number };
    };
  });
}
