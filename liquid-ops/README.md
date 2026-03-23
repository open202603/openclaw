# Liquid Ops

Hyperliquid-style trading platform foundation, starting with simulated trading and designed to evolve into a full product.

## What works in this pass

- local monorepo install via Corepack-managed pnpm
- Fastify API with working routes for health, markets, candles, order book, portfolio, and order placement
- lightweight websocket streams for market/account snapshots
- Next.js terminal UI wired to the local API instead of static-only mock panels
- upgraded terminal UX with richer order entry, live market context, exposure/risk readouts, recent fills, and equity-curve views
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
- account state persists locally in SQLite for the demo account and resets only if the DB is removed
- demo account id: `acc_demo_001`

## Demo-oriented UX improvements in this pass

- buy/sell side toggle with leverage slider and quick size presets
- better order preview: estimated notional, margin impact, approximate liquidation, and current market position context
- more explicit account state: gross exposure, approximate buying power, margin ratio, and risk status
- upgraded positions table with notional, ROE, and clearer mark-to-market display
- richer order book with cumulative depth and bid/ask imbalance
- cleaner charting and equity-history panels that feel closer to a real terminal
- recent fills panel with realized PnL context for closing trades

## Product Direction

Phase 1 focuses on:
- simulated perpetual/futures trading
- live-ish market data abstraction
- order entry and portfolio flows
- risk controls, auditability, and internal admin readiness

## Next sensible steps

- add resting orders / open-order lifecycle instead of immediate-fill only
- stream candles and account state more granularly over websockets
- expand position and history analytics into dedicated pages with filters/export
- add auth/session handling and multi-account support
- replace handcrafted charts with a full charting package when the product surface stabilizes
