# Options Trading System

Multi-venue options trading core for Binance, Deribit, OKX, and Bybit.

## Goal

Build a production-oriented options trading system focused on:

- unified options instrument normalization
- multi-venue market data ingestion
- balances / positions synchronization
- paper trading and execution abstraction
- risk engine foundations
- future support for cross-venue arbitrage and options market making

Phase 1 is intentionally infrastructure-first. It does **not** attempt blind live trading.

## Target Venues

- Binance Options
- Deribit Options
- OKX Options
- Bybit Options

## Phase 1 Scope

- normalized instrument model
- venue adapter interfaces
- market data service skeleton
- account sync service skeleton
- paper execution service skeleton
- risk engine skeleton
- strategy interfaces for:
  - cross-venue arbitrage detection
  - options market making
- local app bootstrap and config model

## Proposed Architecture

```text
options-trading-system/
  src/
    app/                # bootstrap / container
    config/             # env parsing and runtime config
    core/               # shared domain models and interfaces
    venues/             # exchange-specific adapters
    services/           # market-data / accounts / execution / risk
    strategies/         # arbitrage and market-making hooks
    utils/              # logging / helpers
  docs/
    architecture.md     # system design
    roadmap.md          # staged plan
```

### Core Modules

1. **Venue Adapters**
   - REST / WebSocket capability wrappers
   - normalize instruments, balances, positions, orders, greeks

2. **Market Data Service**
   - subscribe to books / trades / marks / greeks
   - publish normalized updates internally

3. **Account Service**
   - synchronize balances, positions, margin state

4. **Execution Service**
   - submit / cancel / amend orders through a unified interface
   - paper mode first

5. **Risk Engine**
   - exposure limits
   - venue health gating
   - delta / gamma / vega placeholder controls

6. **Strategy Layer**
   - arbitrage detector
   - market-making quoting engine

## How to Start

```bash
cd options-trading-system
npm install
npm run dev
```

## Current Status

This repository currently contains the initial architecture and runnable TypeScript skeleton.

Next recommended step:

1. implement real instrument normalization for each venue
2. connect market data websockets one venue at a time
3. add persistent state store
4. add paper trading fills simulator
5. add options arbitrage detector
