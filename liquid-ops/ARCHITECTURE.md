# Architecture — Liquid Ops

## 1. System Overview
Liquid Ops uses a TypeScript monorepo with a frontend trading client, a backend API/streaming service, shared domain packages, and infrastructure modules ready for local and cloud deployment.

## 2. Top-Level Components
- **Web App (`apps/web`)**: Next.js App Router frontend for trade UI, portfolio, and markets.
- **API (`apps/api`)**: Fastify service exposing REST endpoints and websocket channels.
- **Shared Types (`packages/types`)**: Domain models for markets, orders, positions, balances, and events.
- **Shared Config (`packages/config`)**: Base TypeScript and lint config placeholders.
- **UI Package (`packages/ui`)**: Reusable design-system shell for future extraction.

## 3. Backend Domain Design
### Modules
- `health` — service readiness/liveness.
- `auth` — guest/auth session placeholder.
- `markets` — market catalog, ticker snapshots, candle adapter abstraction.
- `orders` — command validation and simulated placement.
- `positions` — derived position views.
- `portfolio` — balances, equity, history.
- `ws` — stream namespaces for market/account feeds.

### Service Layer
- `market-data.service.ts` — adapter for seeded market snapshots and future vendor feeds.
- `matching-sim.service.ts` — simulated fill logic.
- `risk-engine.service.ts` — leverage/margin checks.
- `portfolio.service.ts` — derived balances/positions.
- `event-bus.service.ts` — internal event dispatch abstraction.

## 4. Data Model (Phase 1)
### Core Entities
- User
- Account
- Market
- Order
- Fill
- Position
- Balance Ledger Entry
- Competition
- Audit Event

### Recommended Storage Evolution
- Phase 1 local/dev: in-memory repositories or SQLite/Postgres dev mode.
- Phase 2: Postgres for relational/account state + Redis for ephemeral streams/cache.
- Phase 3: separate write/read paths, event log, dedicated market data ingestion service.

## 5. Request/Stream Flow
1. Trader opens trade page.
2. Web app loads market catalog + account snapshot via REST.
3. Web app subscribes to market/account streams.
4. User submits order.
5. API validates auth/account/risk.
6. Simulated execution service produces order + fill events.
7. Portfolio service recalculates balances and positions.
8. Websocket pushes fresh account state and market impact placeholder.
9. Audit event emitted for observability/compliance trail.

## 6. Frontend Architecture
### App Structure
- `app/page.tsx` — dashboard / landing redirect.
- `app/trade/page.tsx` — main terminal.
- `components/layout` — shell, sidebar, topbar.
- `components/trading` — order ticket, chart shell, order book, positions.
- `components/portfolio` — balance cards, positions table.
- `components/markets` — market list and ticker cards.
- `lib/api.ts` — typed API client.
- `lib/mock-data.ts` — fallback seed data.

### UI Principles
- Use server-rendered shell where useful, but keep terminal widgets client-side.
- Build composable primitives that can later migrate into `packages/ui`.
- Separate market state from account state.

## 7. Security / Reliability Foundations
- Input schema validation at every boundary.
- Rate limiting and auth middleware ready, even if guest mode is default initially.
- Structured logs with request IDs.
- Immutable audit records for order lifecycle events.
- Feature flags around risky product changes.

## 8. Future Real-Trading Evolution
When moving beyond simulation:
- replace simulated matching with broker/exchange routing adapter
- add wallet/custody service
- add compliance profile/KYC service
- introduce risk admin console and liquidation service
- build reconciliation jobs and ledger integrity checks

## 9. Recommended Near-Term Stack
- **Frontend**: Next.js, TypeScript, Tailwind, Zustand, TanStack Query, lightweight charting lib.
- **Backend**: Fastify, TypeScript, Zod, websocket plugin, Prisma/Drizzle later.
- **Infra**: Docker Compose for Postgres/Redis, Vercel/Fly/Render or k8s later.
- **Observability**: OpenTelemetry, Sentry, structured logs.
