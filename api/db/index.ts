import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dataDir, 'warranty.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDatabase(): void {
  const database = getDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS dealers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('dealer', 'admin')),
      dealer_id TEXT REFERENCES dealers(id),
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS service_centers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      service_hours TEXT,
      province TEXT,
      city TEXT,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      serial_number TEXT UNIQUE NOT NULL,
      device_type TEXT NOT NULL CHECK (device_type IN ('fridge', 'washer', 'ac')),
      model TEXT NOT NULL,
      brand TEXT NOT NULL,
      purchase_date DATE,
      invoice_exists BOOLEAN DEFAULT 1,
      dealer_id TEXT NOT NULL REFERENCES dealers(id),
      service_center_id TEXT REFERENCES service_centers(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS warranties (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,整机保修期_months INTEGER NOT NULL DEFAULT 12,
      主要部件保修期_months INTEGER NOT NULL DEFAULT 36,
      warranty_start_date DATE,
      warranty_end_date DATE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'pending')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS extended_warranties (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      plan_name TEXT NOT NULL,
      extended_months INTEGER NOT NULL,
      extended_end_date DATE,
      price DECIMAL(10, 2),
      purchased_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS review_applications (
      id TEXT PRIMARY KEY,
      device_type TEXT NOT NULL CHECK (device_type IN ('fridge', 'washer', 'ac')),
      serial_number TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      purchase_date DATE,
      purchase_channel TEXT,
      description TEXT,
      proof_files TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      admin_id TEXT REFERENCES users(id),
      review_remark TEXT,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_devices_serial ON devices(serial_number);
    CREATE INDEX IF NOT EXISTS idx_devices_dealer ON devices(dealer_id);
    CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(device_type);
    CREATE INDEX IF NOT EXISTS idx_reviews_status ON review_applications(status);
    CREATE INDEX IF NOT EXISTS idx_reviews_serial ON review_applications(serial_number);
  `);
}

export default getDatabase;
