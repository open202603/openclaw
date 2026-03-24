import { loadConfig } from '../dist/config/load-config.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const config = loadConfig();

const readiness = [
  { venue: 'binance-options', enabled: config.credentials.binance.enabled },
  { venue: 'deribit', enabled: config.credentials.deribit.enabled },
  { venue: 'okx-options', enabled: config.credentials.okx.enabled },
  { venue: 'bybit-options', enabled: config.credentials.bybit.enabled },
];

const outDir = path.resolve(process.cwd(), 'data');
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(
  path.join(outDir, 'account-readiness.json'),
  JSON.stringify({ generatedAt: Date.now(), readiness }, null, 2),
);

console.log('wrote account readiness');
