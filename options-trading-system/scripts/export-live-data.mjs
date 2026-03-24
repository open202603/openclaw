import { BinanceOptionsAdapter } from '../dist/venues/binance-options-adapter.js';
import { BybitOptionsAdapter } from '../dist/venues/bybit-options-adapter.js';
import { DeribitOptionsAdapter } from '../dist/venues/deribit-options-adapter.js';
import { OkxOptionsAdapter } from '../dist/venues/okx-options-adapter.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const adapters = [
  new BinanceOptionsAdapter(),
  new DeribitOptionsAdapter(),
  new OkxOptionsAdapter(),
  new BybitOptionsAdapter(),
];

const snapshots = [];
const instruments = [];

for (const adapter of adapters) {
  instruments.push(...await adapter.loadInstruments());
  await adapter.connectMarketData((snapshot) => snapshots.push(snapshot));
}

const outDir = path.resolve(process.cwd(), 'data');
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(
  path.join(outDir, 'live-data.json'),
  JSON.stringify(
    {
      generatedAt: Date.now(),
      instruments,
      snapshots,
    },
    null,
    2,
  ),
);

console.log(`wrote ${instruments.length} instruments and ${snapshots.length} snapshots`);
