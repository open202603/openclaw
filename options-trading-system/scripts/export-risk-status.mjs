import { loadConfig } from '../dist/config/load-config.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const config = loadConfig();
const payload = {
  generatedAt: Date.now(),
  executionMode: config.executionMode,
  killSwitchEnabled: config.risk.killSwitchEnabled,
  limits: config.risk,
  executionState: {
    openOrderCount: 0,
  },
};

const outDir = path.resolve(process.cwd(), 'data');
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, 'risk-status.json'), JSON.stringify(payload, null, 2));
console.log('wrote risk status');
