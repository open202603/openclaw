# Liquid Ops

Hyperliquid-style trading platform foundation, starting with simulated trading and designed to evolve into a full product.

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

## Quick Start

```bash
pnpm install
pnpm dev
```

## Product Direction

Phase 1 focuses on:
- simulated perpetual/futures trading
- live-ish market data abstraction
- order entry and portfolio flows
- risk controls, auditability, and internal admin readiness

