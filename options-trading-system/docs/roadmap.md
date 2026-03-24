# Roadmap

## Phase 1 - Foundation

- create shared domain model
- implement venue adapter interfaces
- add config and bootstrap
- add market data/account/execution/risk skeletons
- support paper mode
- add placeholder arbitrage and market-making strategies

## Phase 2 - Data Normalization

- Binance options instrument normalization
- Deribit options instrument normalization
- OKX options instrument normalization
- Bybit options instrument normalization
- venue health checks
- normalized greeks model

## Phase 3 - Paper Trading + Signals

- paper order book simulator
- execution simulator
- cross-venue spread detector
- parity / synthetic forward checks
- logging and alerting

## Phase 4 - Live Read-Only

- live websocket ingestion
- live balances / positions sync
- persistent state store
- dashboards / observability

## Phase 5 - Controlled Live Execution

- per-venue throttling
- risk limits
- cancel-all kill switch
- staged enablement by venue

## Phase 6 - Options Market Making

- fair value engine
- inventory-aware quoting
- hedge routing
- dynamic spread management
