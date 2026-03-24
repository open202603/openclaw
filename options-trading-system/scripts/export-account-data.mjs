import { loadConfig } from '../dist/config/load-config.js';
import { DeribitOptionsAdapter } from '../dist/venues/deribit-options-adapter.js';
import { writeAccountExport } from '../dist/services/account-export-service.js';

const config = loadConfig();
const deribit = new DeribitOptionsAdapter({
  apiKey: config.credentials.deribit.apiKey,
  apiSecret: config.credentials.deribit.apiSecret,
  enabled: config.credentials.deribit.enabled,
});

const balances = await deribit.syncBalances();
const positions = await deribit.syncPositions();
const openOrders = await deribit.syncOpenOrders?.() ?? [];
const fills = await deribit.syncFills?.() ?? [];

await writeAccountExport({
  generatedAt: Date.now(),
  balances,
  positions,
  openOrders,
  fills,
});

console.log(`wrote account data: ${balances.length} balances, ${positions.length} positions, ${openOrders.length} open orders, ${fills.length} fills`);
