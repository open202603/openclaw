# PRD — Liquid Ops v0 (Simulated Trading First)

## 1. Product Summary
Liquid Ops is a high-performance crypto derivatives trading platform inspired by the speed, clarity, and depth of Hyperliquid-style products, but launched first as a simulated trading experience. The goal is to validate product-market fit, trading workflows, retention loops, and system ergonomics before integrating real funds, exchange custody, and production-grade execution rails.

## 2. Vision
Build the fastest-feeling and most trustworthy browser-based trading product for active traders, starting with paper trading and progressing toward a full-stack exchange or broker layer.

## 3. Strategic Goals
- Deliver a premium, low-latency-feeling trading UX.
- Prove repeated user engagement via simulated trading competitions, journaling, and PnL tracking.
- Establish a technical foundation that can later support real trading, custody, compliance, and exchange connectivity.
- Make risk, event logging, and data lineage first-class from day one.

## 4. Target Users
### Primary
- Active crypto traders testing discretionary or systematic strategies.
- Newer traders who want realistic practice without capital risk.
- Creators/communities that run competitions and strategy challenges.

### Secondary
- Internal ops/support/risk staff.
- Future liquidity/execution partners.

## 5. Phase 1 Scope
### In Scope
- Email/social auth placeholder and guest mode.
- Market list and instrument detail pages.
- Trading screen with chart area, order ticket, order book placeholder, recent trades, positions, and account summary.
- Simulated account balance and margin engine.
- Market/limit/stop order placement in sandbox mode.
- Open orders, order history, fills, positions, realized/unrealized PnL.
- Websocket-style streaming architecture for market and account updates.
- Leaderboards/competitions scaffolding.
- Admin/risk readiness in data model and event logs.

### Out of Scope (Phase 1)
- Real money deposits/withdrawals.
- Onchain settlement.
- Production custody.
- Full matching engine implementation.
- KYC/compliance flows.
- Mobile native apps.

## 6. Core User Stories
- As a trader, I can open a simulated account and receive a starting balance instantly.
- As a trader, I can browse markets, inspect prices, and open the main trade interface quickly.
- As a trader, I can place market and limit orders and immediately see changes to orders, fills, and positions.
- As a trader, I can monitor leverage, margin usage, liquidation price, and PnL.
- As a trader, I can review historical trades and journal my performance later.
- As an operator, I can inspect account events, anomalies, and risk actions.

## 7. UX Principles
- Dense, pro-grade information layout.
- Keyboard-friendly workflows.
- Dark-first visual design.
- Sharp latency perception: optimistic updates, streams, tight interactions.
- Never hide risk state.

## 8. Functional Requirements
### Market Experience
- Show instrument metadata: symbol, mark price, index price, 24h change, volume, open interest placeholder.
- Enable sorting/filtering/watchlists later.

### Trading
- Support order types: market, limit, stop-market placeholder.
- Support long/short toggles.
- Support leverage slider/input placeholder.
- Pre-trade validation for size, leverage, balance, and simulated margin.
- Post-trade state updates across positions, balances, and activity feed.

### Portfolio
- Display account equity, free collateral, used margin, realized PnL, unrealized PnL.
- Show open positions and open orders.
- Show fills and trade history.

### Account / Growth
- Create sandbox accounts automatically.
- Seed configurable play-money balance.
- Support competition season scaffolding and referral/creator campaigns later.

### Platform / Admin Readiness
- Event-sourced audit log for orders and balance changes.
- Feature flags for rollout.
- Role model for user/admin/support.

## 9. Non-Functional Requirements
- Fast initial page load for landing-to-trade path.
- API designed for horizontal scaling.
- Clear domain boundaries for future real execution integration.
- Observability hooks from the start.
- Testable core trading logic isolated from transport layer.

## 10. Success Metrics
### Product
- D1/D7 retention of sandbox traders.
- Trades per active user.
- Avg session duration on trade screen.
- Competition participation rate.

### Technical
- P95 order submit API under 150ms in sandbox mode.
- P95 websocket fanout under 300ms internally.
- Zero unlogged balance or order state transitions.

## 11. Key Risks
- Simulated fills feel fake or inconsistent.
- UX tries to do too much before mastering core trading loop.
- Architecture overfits future exchange ambitions too early.

## 12. Launch Recommendation
Start with a small set of perpetual markets, deterministic simulated fills, visible disclaimers, and a premium desktop web experience. Nail the trader loop before adding social, competitions, or real execution.
