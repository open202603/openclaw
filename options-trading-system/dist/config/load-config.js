import { z } from 'zod';
const envSchema = z.object({
    EXECUTION_MODE: z.enum(['paper', 'live']).default('paper'),
    MAX_DELTA: z.coerce.number().default(5),
    MAX_VEGA: z.coerce.number().default(10000),
    MAX_OPEN_ORDERS: z.coerce.number().default(200),
});
export function loadConfig() {
    const env = envSchema.parse(process.env);
    return {
        executionMode: env.EXECUTION_MODE,
        risk: {
            maxDelta: env.MAX_DELTA,
            maxVega: env.MAX_VEGA,
            maxOpenOrders: env.MAX_OPEN_ORDERS,
        },
    };
}
