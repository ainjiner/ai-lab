import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const DB_DIR = process.env.XDG_DATA_HOME || join(process.env.HOME!, ".local/share/ml-engine");
const DB_PATH = join(DB_DIR, "engine.db");

export class Store {
  private db: Database;

  constructor(dbPath?: string) {
    const path = dbPath || DB_PATH;
    if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });
    this.db = new Database(path);
    this.db.exec("PRAGMA journal_mode=WAL");
    this.db.exec("PRAGMA foreign_keys=ON");
    this.migrate();
  }

  private migrate(): void {
    this.db.exec("CREATE TABLE IF NOT EXISTS _migrations (version INTEGER PRIMARY KEY, applied_at TEXT DEFAULT (datetime('now')))");

    const version = this.db.query<{ version: number }, []>(
      "SELECT COALESCE(MAX(version), 0) as version FROM _migrations"
    ).get()?.version || 0;

    const migrations = [
      `CREATE TABLE IF NOT EXISTS provider_instances (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL,
        name TEXT NOT NULL,
        api_key TEXT NOT NULL,
        base_url TEXT,
        min_chunk_size INTEGER DEFAULT 80,
        enabled INTEGER DEFAULT 1,
        priority INTEGER DEFAULT 0,
        labels TEXT DEFAULT '[]',
        models_count INTEGER DEFAULT 0,
        last_scan TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS models (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        context_window INTEGER DEFAULT 4096,
        max_output INTEGER DEFAULT 4096,
        capabilities_vision INTEGER DEFAULT 0,
        capabilities_tools INTEGER DEFAULT 0,
        capabilities_reasoning INTEGER DEFAULT 0,
        capabilities_json_mode INTEGER DEFAULT 0,
        capabilities_streaming INTEGER DEFAULT 1,
        capabilities_prompt_caching INTEGER DEFAULT 0,
        price_prompt REAL DEFAULT 0,
        price_completion REAL DEFAULT 0,
        price_cached REAL,
        availability_status TEXT DEFAULT 'available',
        metadata TEXT DEFAULT '{}',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS model_aliases (
        alias TEXT PRIMARY KEY,
        model_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        fallback_alias TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (model_id) REFERENCES models(id),
        FOREIGN KEY (provider_id) REFERENCES provider_instances(id)
      );

      CREATE TABLE IF NOT EXISTS experiments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        system_prompt TEXT,
        user_prompt TEXT NOT NULL,
        variables TEXT DEFAULT '{}',
        provider_id TEXT NOT NULL,
        model_id TEXT NOT NULL,
        params TEXT DEFAULT '{}',
        output TEXT,
        tokens_prompt INTEGER,
        tokens_completion INTEGER,
        tokens_total INTEGER,
        latency_ms INTEGER,
        cost_usd REAL,
        reasoning TEXT,
        tags TEXT DEFAULT '[]',
        rating INTEGER,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (provider_id) REFERENCES provider_instances(id),
        FOREIGN KEY (model_id) REFERENCES models(id)
      );

      CREATE TABLE IF NOT EXISTS usage_records (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        tokens_prompt INTEGER DEFAULT 0,
        tokens_completion INTEGER DEFAULT 0,
        tokens_cached INTEGER DEFAULT 0,
        cost_prompt REAL DEFAULT 0,
        cost_completion REAL DEFAULT 0,
        cost_total REAL DEFAULT 0,
        latency_ms INTEGER DEFAULT 0,
        experiment_id TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        limit_amount REAL NOT NULL,
        period TEXT DEFAULT 'monthly',
        alerts TEXT DEFAULT '[]',
        scope_providers TEXT,
        scope_models TEXT,
        scope_projects TEXT,
        enabled INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_models_provider ON models(provider);
      CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
      CREATE INDEX IF NOT EXISTS idx_usage_timestamp ON usage_records(timestamp);
      CREATE INDEX IF NOT EXISTS idx_usage_provider ON usage_records(provider);`,

      // v2: prompt_templates table (future migrations go here)
      `CREATE TABLE IF NOT EXISTS prompt_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        template TEXT NOT NULL,
        variables TEXT DEFAULT '[]',
        tags TEXT DEFAULT '[]',
        version INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );`,
    ];

    for (let i = version; i < migrations.length; i++) {
      this.db.exec(migrations[i]);
      this.db.query("INSERT INTO _migrations (version) VALUES (?)").run(i + 1);
    }
  }

  close(): void {
    this.db.close();
  }

  getDB(): Database {
    return this.db;
  }

  query<T, P extends unknown[]>(sql: string): {
    all(...params: P): T[];
    get(...params: P): T | undefined;
    run(...params: P): { changes: number; lastInsertRowid: number | bigint };
  } {
    const stmt = this.db.query<T, P>(sql);
    return {
      all: (...params: P) => stmt.all(...params),
      get: (...params: P) => stmt.get(...params),
      run: (...params: P) => stmt.run(...params),
    };
  }
}

let _store: Store | undefined;

export function getStore(dbPath?: string): Store {
  if (!_store) _store = new Store(dbPath);
  return _store;
}

export function resetStore(): void {
  if (_store) {
    _store.close();
    _store = undefined;
  }
}
