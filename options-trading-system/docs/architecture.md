# Architecture

## System Intent

A multi-venue options trading core that normalizes data and execution across Binance, Deribit, OKX, and Bybit.

The system should support:

- options instrument discovery
- normalized market data
- account state synchronization
- paper and live execution modes
- pre-trade and post-trade risk controls
- cross-venue arbitrage detection
- inventory-aware options market making

## Domain Model

### Instrument

A normalized options instrument should include:

- venue
- symbol
- underlying
- quote currency
- settlement currency
- expiry timestamp
- strike
- option side (call / put)
- contract multiplier
- tick size
- lot size

### Market Data

Normalized market data should include:

- best bid / ask
- top-of-book sizes
- mark price
- index price
- implied volatility
- greeks when available
- timestamp and venue health metadata

### Account State

- balances
- available margin
- maintenance / initial margin
- open orders
- option positions
- aggregate greeks by venue and portfolio

## Runtime Design

### Venue Adapters

Each venue adapter exposes:

- `loadInstruments()`
- `connectMarketData()`
- `syncBalances()`
- `syncPositions()`
- `placeOrder()`
- `cancelOrder()`

### Internal Services

- `InstrumentRegistry`
- `MarketDataService`
- `AccountService`
- `ExecutionService`
- `RiskEngine`
- `StrategyRunner`

## Safety Model

Phase 1 defaults to paper mode.

Before enabling live execution, the system should require:

- explicit venue-level credentials
- per-venue risk caps
- global exposure caps
- kill-switch support
- health checks for websockets and order acknowledgements

## Strategy Model

### Arbitrage

Initial signal generation targets:

- same strike / same expiry cross-venue premium spreads
- put-call parity deviations
- synthetic forward dislocations
- box spread anomalies

### Market Making

Future market-making engine should be:

- inventory aware
- greek aware
- venue fee aware
- hedge aware
- liquidity aware
