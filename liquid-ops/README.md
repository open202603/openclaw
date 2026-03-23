# Liquid Ops

Hyperliquid-style trading platform foundation, starting with simulated trading and designed to evolve into a full product.

## What works in this pass

- local monorepo install via Corepack-managed pnpm
- Fastify API with working routes for health, markets, candles, order book, portfolio, and order placement
- lightweight websocket streams for market/account snapshots
- Next.js terminal UI wired to the local API instead of static-only mock panels
- simulated market movement, account snapshot refresh, recent orders, and paper-trade fills

## Monorepo Layout

- `apps/web` — Next.js trading frontend
- `apps/api` — Fastify API + websocket skeleton for simulated trading
- `packages/types` — shared domain types
- `packages/config` — shared TypeScript/base config placeholders
- `packages/ui` — shared UI placeholder package
- `infra` — local development infrastructure notes
- `PRD.md` — product requirements
- `ARCHITECTURE.md` — technical architecture
- `ROADMAP.md` — staged delivery plan

## Requirements

- Node.js 22+
- Corepack available (`corepack --version`)

## Exact local run commands

From repo root:

```bash
cd /home/zhoushuoji/.openclaw/workspace/liquid-ops
corepack pnpm install
```

### Run the API

```bash
cd /home/zhoushuoji/.openclaw/workspace/liquid-ops
corepack pnpm --filter @liquid-ops/api dev
```

API base URL: `http://localhost:4000`

Useful checks:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/markets
curl http://localhost:4000/portfolio/acc_demo_001
curl -X POST http://localhost:4000/orders \
  -H 'content-type: application/json' \
  -d '{"accountId":"acc_demo_001","marketSymbol":"BTC-PERP","side":"buy","type":"market","size":0.1,"leverage":5}'
```

### Run the web app

In a second terminal:

```bash
cd /home/zhoushuoji/.openclaw/workspace/liquid-ops
NEXT_PUBLIC_API_URL=http://localhost:4000 corepack pnpm --filter @liquid-ops/web dev
```

Web UI: `http://localhost:3000/trade`

## Workspace commands

```bash
corepack pnpm typecheck
corepack pnpm build
corepack pnpm lint
```

## Notes on the simulation

- prices drift on each refresh to make the terminal feel live
- order book and candles are derived from the current simulated mark price
- orders fill immediately for now
- account state is in-memory and resets on API restart
- demo account id: `acc_demo_001`

## Product Direction

Phase 1 focuses on:
- simulated perpetual/futures trading
- live-ish market data abstraction
- order entry and portfolio flows
- risk controls, auditability, and internal admin readiness

## Next sensible steps

- persist account/order state to SQLite or Postgres
- net positions instead of stacking every fill as a new position
- replace polling in the web client with websocket subscriptions
- add auth/session handling and multi-account support
- add real charts and trade history pages
