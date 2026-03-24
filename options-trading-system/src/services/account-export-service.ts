import fs from 'node:fs/promises';
import path from 'node:path';
import type { VenueBalance, VenueFill, VenueOrder, VenuePosition } from '../core/types.js';

export async function writeAccountExport(payload: {
  generatedAt: number;
  balances: VenueBalance[];
  positions: VenuePosition[];
  openOrders: VenueOrder[];
  fills: VenueFill[];
}) {
  const outDir = path.resolve(process.cwd(), 'data');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'account-data.json'), JSON.stringify(payload, null, 2));
}
