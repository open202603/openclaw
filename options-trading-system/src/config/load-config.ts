import { z } from 'zod';

const envSchema = z.object({
  EXECUTION_MODE: z.enum(['paper', 'live']).default('paper'),
  MAX_DELTA: z.coerce.number().default(5),
  MAX_VEGA: z.coerce.number().default(10000),
  MAX_OPEN_ORDERS: z.coerce.number().default(200),
  MARKET_DATA_REFRESH_MS: z.coerce.number().default(30000),
  BINANCE_API_KEY: z.string().optional(),
  BINANCE_API_SECRET: z.string().optional(),
  DERIBIT_API_KEY: z.string().optional(),
  DERIBIT_API_SECRET: z.string().optional(),
  OKX_API_KEY: z.string().optional(),
  OKX_API_SECRET: z.string().optional(),
  OKX_API_PASSPHRASE: z.string().optional(),
  BYBIT_API_KEY: z.string().optional(),
  BYBIT_API_SECRET: z.string().optional(),
});

export function loadConfig() {
  const env = envSchema.parse(process.env);

  return {
    executionMode: env.EXECUTION_MODE,
    marketDataRefreshMs: env.MARKET_DATA_REFRESH_MS,
    credentials: {
      binance: { enabled: Boolean(env.BINANCE_API_KEY && env.BINANCE_API_SECRET), apiKey: env.BINANCE_API_KEY, apiSecret: env.BINANCE_API_SECRET },
      deribit: { enabled: Boolean(env.DERIBIT_API_KEY && env.DERIBIT_API_SECRET), apiKey: env.DERIBIT_API_KEY, apiSecret: env.DERIBIT_API_SECRET },
      okx: { enabled: Boolean(env.OKX_API_KEY && env.OKX_API_SECRET && env.OKX_API_PASSPHRASE), apiKey: env.OKX_API_KEY, apiSecret: env.OKX_API_SECRET, passphrase: env.OKX_API_PASSPHRASE },
      bybit: { enabled: Boolean(env.BYBIT_API_KEY && env.BYBIT_API_SECRET), apiKey: env.BYBIT_API_KEY, apiSecret: env.BYBIT_API_SECRET },
    },
    risk: {
      maxDelta: env.MAX_DELTA,
      maxVega: env.MAX_VEGA,
      maxOpenOrders: env.MAX_OPEN_ORDERS,
    },
  };
}
