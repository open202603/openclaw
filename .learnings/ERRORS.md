# Errors

## [ERR-20260323-001] scaffold-write-missing-directory

**Logged**: 2026-03-23T13:03:00Z
**Priority**: medium
**Status**: pending
**Area**: docs

### Summary
Initial monorepo scaffold write failed because `packages/types/src` had not been created before writing `index.ts`.

### Error
```text
/bin/bash: line 1199: liquid-ops/packages/types/src/index.ts: No such file or directory
```

### Context
- Operation attempted: generate full project scaffold with shell heredocs
- Environment: OpenClaw workspace subagent session

### Suggested Fix
Create all nested directories up front or write files in smaller phases with verification.

### Metadata
- Reproducible: yes
- Related Files: liquid-ops/packages/types/src/index.ts

---

## [ERR-20260323-002] liquid-ops-typecheck-phase2

**Logged**: 2026-03-23T13:20:00Z
**Priority**: medium
**Status**: resolved
**Area**: backend

### Summary
Phase 2 typecheck initially failed after adding SQLite persistence because the API package lacked `@types/better-sqlite3` and a portfolio/account property reference used the wrong shape.

### Error
```text
src/services/persistence.service.ts: Could not find a declaration file for module 'better-sqlite3'
src/services/risk-engine.service.ts: Property 'freeCollateral' does not exist on type 'PortfolioSnapshot'
```

### Context
- Command attempted: `corepack pnpm typecheck`
- Repo: `liquid-ops`
- Change set: persistence + net positions + websocket refactor

### Suggested Fix
Install `@types/better-sqlite3` in `apps/api` and reference `snapshot.account.freeCollateral` instead of the top-level portfolio object.

### Metadata
- Reproducible: yes
- Related Files: liquid-ops/apps/api/src/services/persistence.service.ts, liquid-ops/apps/api/src/services/risk-engine.service.ts, liquid-ops/apps/api/package.json

### Resolution
- **Resolved**: 2026-03-23T13:21:00Z
- **Commit/PR**: pending
- **Notes**: Added the missing type package and corrected the account snapshot access path.

---

## [ERR-20260323-003] next-build-missing-suspense-searchparams

**Logged**: 2026-03-23T19:56:00Z
**Priority**: medium
**Status**: pending
**Area**: frontend

### Summary
Next.js production build failed because `useSearchParams()` was used in a client component without a Suspense boundary on the `/trade` route.

### Error
```text
useSearchParams() should be wrapped in a suspense boundary at page "/trade"
Error occurred prerendering page "/trade"
```

### Context
- Command attempted: `corepack pnpm build`
- Repo: `liquid-ops`
- Change set: wallet-mode query params + deposit flow wired into `TradeTerminal`

### Suggested Fix
Move search-param handling into page-level `searchParams` props or wrap the client component in a `Suspense` boundary before prerender.

### Metadata
- Reproducible: yes
- Related Files: liquid-ops/apps/web/components/trading/trade-terminal.tsx, liquid-ops/apps/web/app/trade/page.tsx, liquid-ops/apps/web/app/portfolio/page.tsx, liquid-ops/apps/web/app/markets/page.tsx

---
