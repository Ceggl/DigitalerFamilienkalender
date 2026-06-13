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

/**
 * Initialize database schema if needed.
 * Call this once on app startup.
 */
export function initializeDatabase() {
  // Create tables if they don't exist
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS household (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS person (
      id TEXT PRIMARY KEY,
      household_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      avatar_kind TEXT NOT NULL,
      avatar_value TEXT NOT NULL,
      color TEXT NOT NULL,
      role TEXT NOT NULL,
      pin_hash TEXT,
      birthdate TEXT,
      is_non_reader INTEGER NOT NULL DEFAULT 0,
      tts_enabled INTEGER NOT NULL DEFAULT 0,
      account_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(household_id) REFERENCES household(id)
    );

    CREATE TABLE IF NOT EXISTS calendar_event (
      id TEXT PRIMARY KEY,
      household_id TEXT NOT NULL,
      title TEXT NOT NULL,
      icon TEXT,
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      all_day INTEGER NOT NULL DEFAULT 0,
      rrule TEXT,
      location TEXT,
      color TEXT,
      created_by TEXT NOT NULL,
      external_id TEXT,
      external_calendar_id TEXT,
      etag TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(household_id) REFERENCES household(id),
      FOREIGN KEY(created_by) REFERENCES person(id)
    );

    CREATE TABLE IF NOT EXISTS external_calendar (
      id TEXT PRIMARY KEY,
      household_id TEXT NOT NULL,
      label TEXT NOT NULL,
      provider TEXT NOT NULL,
      caldav_url TEXT NOT NULL,
      username TEXT NOT NULL,
      secret_ref TEXT NOT NULL,
      color TEXT,
      sync_direction TEXT NOT NULL DEFAULT 'read',
      last_synced_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(household_id) REFERENCES household(id)
    );

    CREATE TABLE IF NOT EXISTS task (
      id TEXT PRIMARY KEY,
      household_id TEXT NOT NULL,
      title TEXT NOT NULL,
      icon TEXT NOT NULL,
      description TEXT,
      rrule TEXT,
      coins INTEGER NOT NULL DEFAULT 0,
      requires_commitment INTEGER NOT NULL DEFAULT 1,
      requires_verification INTEGER NOT NULL DEFAULT 0,
      default_assignees TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(household_id) REFERENCES household(id),
      FOREIGN KEY(created_by) REFERENCES person(id)
    );

    CREATE TABLE IF NOT EXISTS task_instance (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      assignee_id TEXT,
      completed_at TEXT,
      verified_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(task_id) REFERENCES task(id),
      FOREIGN KEY(assignee_id) REFERENCES person(id),
      FOREIGN KEY(verified_by) REFERENCES person(id)
    );

    CREATE TABLE IF NOT EXISTS commitment (
      id TEXT PRIMARY KEY,
      task_instance_id TEXT NOT NULL,
      person_id TEXT NOT NULL,
      type TEXT NOT NULL,
      witnessed_by TEXT,
      note TEXT,
      created_at TEXT NOT NULL,
      prev_hash TEXT,
      hash TEXT NOT NULL,
      FOREIGN KEY(task_instance_id) REFERENCES task_instance(id),
      FOREIGN KEY(person_id) REFERENCES person(id),
      FOREIGN KEY(witnessed_by) REFERENCES person(id)
    );

    CREATE TABLE IF NOT EXISTS coin_ledger_entry (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      delta INTEGER NOT NULL,
      reason TEXT NOT NULL,
      task_instance_id TEXT,
      reward_redemption_id TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(person_id) REFERENCES person(id),
      FOREIGN KEY(created_by) REFERENCES person(id)
    );

    CREATE TABLE IF NOT EXISTS reward (
      id TEXT PRIMARY KEY,
      household_id TEXT NOT NULL,
      title TEXT NOT NULL,
      icon TEXT NOT NULL,
      cost_coins INTEGER NOT NULL,
      requires_approval INTEGER NOT NULL DEFAULT 0,
      daily_limit INTEGER,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY(household_id) REFERENCES household(id)
    );

    CREATE TABLE IF NOT EXISTS reward_redemption (
      id TEXT PRIMARY KEY,
      reward_id TEXT NOT NULL,
      person_id TEXT NOT NULL,
      coins_spent INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'requested',
      approved_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(reward_id) REFERENCES reward(id),
      FOREIGN KEY(person_id) REFERENCES person(id),
      FOREIGN KEY(approved_by) REFERENCES person(id)
    );

    CREATE TABLE IF NOT EXISTS setting (
      household_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY(household_id, key),
      FOREIGN KEY(household_id) REFERENCES household(id)
    );

    CREATE TABLE IF NOT EXISTS audit_event (
      id TEXT PRIMARY KEY,
      household_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      actor_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL,
      prev_hash TEXT,
      hash TEXT NOT NULL,
      FOREIGN KEY(household_id) REFERENCES household(id),
      FOREIGN KEY(actor_id) REFERENCES person(id)
    );
  `);
}
