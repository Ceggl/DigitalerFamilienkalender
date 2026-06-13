import Database from 'better-sqlite3';
import { drizzle, BetterSqlite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to database file (project root/data directory)
const dataDir = join(__dirname, '../../..', 'data');
const dbPath = join(dataDir, 'familycalender.db');

// Ensure data directory exists
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Initialize SQLite connection
const sqliteDb = new Database(dbPath);
sqliteDb.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency

export const db: BetterSqlite3Database<typeof schema> = drizzle(sqliteDb, { schema });

export type DB = BetterSqlite3Database<typeof schema>;
