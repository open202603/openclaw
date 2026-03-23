import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type { OrderRecord, PortfolioHistoryPoint, Position } from '@liquid-ops/types';

type StoredAccount = {
  accountId: string;
  startingEquity: number;
  realizedPnl: number;
};

const seedAccount: StoredAccount = {
  accountId: 'acc_demo_001',
  startingEquity: 100000,
  realizedPnl: 2840,
};

const seedPositions: Position[] = [
  {
    id: 'pos_seed_btc',
    marketSymbol: 'BTC-PERP',
    side: 'long',
    size: 0.85,
    entryPrice: 83120,
    markPrice: 84214,
    unrealizedPnl: 929.9,
    leverage: 5,
    notional: 71581.9,
    liquidationPrice: 66496,
    updatedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
  {
    id: 'pos_seed_eth',
    marketSymbol: 'ETH-PERP',
    side: 'short',
    size: 12,
    entryPrice: 4720,
    markPrice: 4682,
    unrealizedPnl: 456,
    leverage: 3,
    notional: 56184,
    liquidationPrice: 6293.33,
    updatedAt: new Date(Date.now() - 16 * 60_000).toISOString(),
  },
];

const seedOrder: OrderRecord = {
  orderId: 'ord_seed_001',
  accountId: 'acc_demo_001',
  marketSymbol: 'BTC-PERP',
  side: 'buy',
  type: 'market',
  size: 0.15,
  leverage: 5,
  fillPrice: 83980,
  status: 'filled',
  createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
};

const round = (value: number, decimals = 2) => Number(value.toFixed(decimals));

export class PersistenceService {
  private readonly db: Database.Database;

  constructor(filePath?: string) {
    const resolvedPath = filePath ?? path.resolve(process.cwd(), 'data/liquid-ops.sqlite');
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    this.db = new Database(resolvedPath);
    this.db.pragma('journal_mode = WAL');
    this.migrate();
    this.seed();
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        account_id TEXT PRIMARY KEY,
        starting_equity REAL NOT NULL,
        realized_pnl REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS positions (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        market_symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        size REAL NOT NULL,
        entry_price REAL NOT NULL,
        leverage REAL NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(account_id, market_symbol)
      );

      CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        market_symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        type TEXT NOT NULL,
        size REAL NOT NULL,
        leverage REAL NOT NULL,
        requested_price REAL,
        fill_price REAL NOT NULL,
        status TEXT NOT NULL,
        realized_pnl REAL,
        closed_size REAL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS equity_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id TEXT NOT NULL,
        equity REAL NOT NULL,
        free_collateral REAL NOT NULL,
        used_margin REAL NOT NULL,
        realized_pnl REAL NOT NULL,
        unrealized_pnl REAL NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_orders_account_created_at ON orders(account_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_history_account_timestamp ON equity_history(account_id, timestamp DESC);
    `);
  }

  private seed() {
    const accountCount = this.db.prepare('SELECT COUNT(*) as count FROM accounts').get() as { count: number };
    if (accountCount.count > 0) return;

    this.saveAccount(seedAccount);
    this.replacePositions(seedAccount.accountId, seedPositions);
    this.insertOrder(seedOrder);
    this.insertHistoryPoint({
      accountId: seedAccount.accountId,
      timestamp: seedOrder.createdAt,
      equity: 103769.9,
      freeCollateral: 71944.6,
      usedMargin: 31825.3,
      realizedPnl: seedAccount.realizedPnl,
      unrealizedPnl: 929.9,
    });
  }

  getAccount(accountId: string): StoredAccount | null {
    const row = this.db.prepare(`SELECT account_id as accountId, starting_equity as startingEquity, realized_pnl as realizedPnl FROM accounts WHERE account_id = ?`).get(accountId) as StoredAccount | undefined;
    return row ?? null;
  }

  saveAccount(account: StoredAccount) {
    this.db.prepare(`
      INSERT INTO accounts (account_id, starting_equity, realized_pnl, updated_at)
      VALUES (@accountId, @startingEquity, @realizedPnl, @updatedAt)
      ON CONFLICT(account_id) DO UPDATE SET
        starting_equity = excluded.starting_equity,
        realized_pnl = excluded.realized_pnl,
        updated_at = excluded.updated_at
    `).run({ ...account, updatedAt: new Date().toISOString() });
  }

  listAccountIds(): string[] {
    return (this.db.prepare('SELECT account_id as accountId FROM accounts ORDER BY account_id').all() as Array<{ accountId: string }>).map((row) => row.accountId);
  }

  getPositions(accountId: string): Position[] {
    return this.db.prepare(`
      SELECT
        id,
        market_symbol as marketSymbol,
        side,
        size,
        entry_price as entryPrice,
        leverage,
        updated_at as updatedAt
      FROM positions
      WHERE account_id = ?
      ORDER BY updated_at DESC
    `).all(accountId).map((row: any) => ({
      ...row,
      markPrice: row.entryPrice,
      unrealizedPnl: 0,
      notional: round(row.entryPrice * row.size),
      liquidationPrice: row.side === 'long' ? round(row.entryPrice - row.entryPrice / Math.max(row.leverage, 1)) : round(row.entryPrice + row.entryPrice / Math.max(row.leverage, 1)),
    })) as Position[];
  }

  replacePositions(accountId: string, positions: Position[]) {
    const deleteStmt = this.db.prepare('DELETE FROM positions WHERE account_id = ?');
    const insertStmt = this.db.prepare(`
      INSERT INTO positions (id, account_id, market_symbol, side, size, entry_price, leverage, updated_at)
      VALUES (@id, @accountId, @marketSymbol, @side, @size, @entryPrice, @leverage, @updatedAt)
    `);

    const transaction = this.db.transaction((items: Position[]) => {
      deleteStmt.run(accountId);
      for (const position of items) {
        insertStmt.run({
          id: position.id,
          accountId,
          marketSymbol: position.marketSymbol,
          side: position.side,
          size: position.size,
          entryPrice: position.entryPrice,
          leverage: position.leverage,
          updatedAt: position.updatedAt,
        });
      }
    });

    transaction(positions);
  }

  getRecentOrders(accountId: string, limit = 20): OrderRecord[] {
    return this.db.prepare(`
      SELECT
        order_id as orderId,
        account_id as accountId,
        market_symbol as marketSymbol,
        side,
        type,
        size,
        leverage,
        requested_price as requestedPrice,
        fill_price as fillPrice,
        status,
        realized_pnl as realizedPnl,
        closed_size as closedSize,
        created_at as createdAt
      FROM orders
      WHERE account_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(accountId, limit) as OrderRecord[];
  }

  insertOrder(order: OrderRecord) {
    this.db.prepare(`
      INSERT OR REPLACE INTO orders (
        order_id, account_id, market_symbol, side, type, size, leverage, requested_price, fill_price, status, realized_pnl, closed_size, created_at
      ) VALUES (
        @orderId, @accountId, @marketSymbol, @side, @type, @size, @leverage, @requestedPrice, @fillPrice, @status, @realizedPnl, @closedSize, @createdAt
      )
    `).run(order);
  }

  getHistory(accountId: string, limit = 40): PortfolioHistoryPoint[] {
    return this.db.prepare(`
      SELECT
        timestamp,
        equity,
        free_collateral as freeCollateral,
        used_margin as usedMargin,
        realized_pnl as realizedPnl,
        unrealized_pnl as unrealizedPnl
      FROM equity_history
      WHERE account_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(accountId, limit).reverse() as PortfolioHistoryPoint[];
  }

  insertHistoryPoint(point: PortfolioHistoryPoint & { accountId: string }) {
    this.db.prepare(`
      INSERT INTO equity_history (account_id, equity, free_collateral, used_margin, realized_pnl, unrealized_pnl, timestamp)
      VALUES (@accountId, @equity, @freeCollateral, @usedMargin, @realizedPnl, @unrealizedPnl, @timestamp)
    `).run(point);
  }
}
