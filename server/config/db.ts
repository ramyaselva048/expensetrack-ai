import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

let DB_HOST = process.env.DB_HOST || '127.0.0.1';
let DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
let DB_USER = process.env.DB_USER || 'root';
let DB_PASSWORD = process.env.DB_PASSWORD || '';
let DB_NAME = process.env.DB_NAME || 'expensetrack_db';

if (process.env.DATABASE_URL) {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    DB_HOST = dbUrl.hostname || DB_HOST;
    DB_PORT = dbUrl.port ? parseInt(dbUrl.port, 10) : DB_PORT;
    DB_USER = decodeURIComponent(dbUrl.username) || DB_USER;
    DB_PASSWORD = decodeURIComponent(dbUrl.password) || DB_PASSWORD;
    if (dbUrl.pathname && dbUrl.pathname.length > 1) {
      DB_NAME = decodeURIComponent(dbUrl.pathname.slice(1));
    }
  } catch (err: any) {
    console.warn('[Database] Failed to parse DATABASE_URL, using individual parameters:', err.message);
  }
}

const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' || process.env.DATABASE_URL?.includes('ssl=') || process.env.DATABASE_URL?.includes('sslmode=');
const sslConfig = useSsl ? { rejectUnauthorized: false } : undefined;

let mysqlPool: mysql.Pool | null = null;

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  company_name: string;
  avatar_url?: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface DbLocation {
  id: string;
  user_id: string;
  name: string;
  code: string;
  state: string;
  budget_limit: number;
  color: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  user_id?: string;
  name: string;
  budget_limit: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface DbExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  location_id: string | null;
  location_name: string;
  date: string;
  payment_method: string;
  description: string;
  tax_deductible: boolean;
  status: 'approved' | 'pending' | 'rejected';
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

function ensureMysqlDaemonRunning() {
  // If we are connecting to localhost / 127.0.0.1 and mysqld is installed locally, ensure it is running
  if (DB_HOST === '127.0.0.1' || DB_HOST === 'localhost') {
    try {
      execSync('pgrep -x mysqld || pgrep -x mariadbd', { stdio: 'ignore' });
    } catch {
      try {
        console.log('[Database] Local MySQL daemon not running, initiating service...');
        execSync('which mysqld_safe && mysqld_safe --user=mysql >/dev/null 2>&1 &', { stdio: 'ignore' });
        execSync('sleep 2', { stdio: 'ignore' });
      } catch (err: any) {
        console.warn('[Database] Could not auto-start local mysqld daemon:', err.message);
      }
    }
  }
}

// Initialize Primary MySQL Database connection
export async function initializeDatabase(): Promise<boolean> {
  ensureMysqlDaemonRunning();

  console.log(`[Database] Connecting to primary MySQL database at ${DB_HOST}:${DB_PORT}/${DB_NAME}...`);
  
  // First, verify server availability and create database if not exists
  const tempPool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    ssl: sslConfig,
    waitForConnections: true,
    connectionLimit: 2,
    connectTimeout: 5000
  });

  try {
    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tempPool.end();
  } catch (err: any) {
    console.warn(`[Database] Initial database check note: ${err.message}`);
  }

  mysqlPool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: sslConfig,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    decimalNumbers: true,
    connectTimeout: 6000
  });

  // Verify connection
  try {
    const [result] = await mysqlPool.query('SELECT 1 + 1 AS solution');
    console.log('[Database] Verified MySQL connection pool successfully:', result);
  } catch (error: any) {
    console.error(`[Database] FATAL: Unable to connect to MySQL database at ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    console.error(`[Database] Reason: ${error.message}`);
    throw new Error(`MySQL connection failed: ${error.message}`);
  }

  // Execute schema synchronization
  try {
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      const statements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('use ') && !s.toLowerCase().startsWith('create database'));

      for (const statement of statements) {
        try {
          await mysqlPool.query(statement);
        } catch (e: any) {
          if (!e.message?.includes('already exists') && !e.message?.includes('Duplicate entry')) {
            console.warn('[Database] Schema execution warning:', e.message);
          }
        }
      }
      console.log('[Database] MySQL tables, indexes, constraints, and seed data synchronized.');
    }
  } catch (schemaErr: any) {
    console.error('[Database] Schema initialization error:', schemaErr.message);
  }

  return true;
}

export function getPool(): mysql.Pool {
  if (!mysqlPool) {
    throw new Error('Database connection pool is not initialized. Ensure initializeDatabase() has run.');
  }
  return mysqlPool;
}
