# Roadmap — Liquid Ops

## Phase 0 — Foundation (this scaffold)
- Monorepo setup
- Product docs
- Shared types
- Frontend terminal shell
- Backend modular skeleton
- Mock/simulated domain services

## Phase 1 — Simulated Trading Alpha (2-4 weeks)
- Guest account provisioning
- Market catalog + snapshots
- Order entry with validation
- Simulated fills and position updates
- Portfolio dashboard
- Account/activity websocket streams
- Local persistence and test coverage for core domain logic

## Phase 2 — Private Beta (4-8 weeks)
- Auth + user accounts
- Persistent ledger and order history
- Competitions / leaderboard MVP
- Watchlists and trader journal
- Admin diagnostics page
- Better charting and execution UX polish

## Phase 3 — Growth + Reliability (6-10 weeks)
- Referral/invite mechanics
- Email/push/event campaigns
- Risk monitoring dashboards
- Replayable event streams
- Stress tests and production SLOs

## Phase 4 — Real Trading Readiness
- Broker/exchange connectivity
- Compliance/KYC architecture
- Reconciliation system
- Wallet/custody layer
- Legal/regional rollout planning

## Recommended Next 10 Tasks
1. Wire pnpm install and verify local build.
2. Add Tailwind + design tokens.
3. Implement real frontend state stores.
4. Add Zod schemas and request validation to API.
5. Build simulated matching and risk tests.
6. Add SQLite/Postgres persistence.
7. Add websocket event emitter and client subscription hooks.
8. Add auth/session bootstrap.
9. Add leaderboard and journal schema.
10. Add CI, lint, typecheck, and test pipelines.
