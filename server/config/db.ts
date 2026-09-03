import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createMockPool } from './mockDb';

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

const isLocalHost = DB_HOST === '127.0.0.1' || DB_HOST === 'localhost';
const isRemoteCloudHost = !isLocalHost && !DB_HOST.startsWith('172.') && !DB_HOST.startsWith('10.');

// Determine initial SSL preference:
// If explicit DB_SSL is 'false' or '0', disable.
// If isLocalHost and DB_SSL is not explicitly set to 'true', default to false.
// Otherwise for cloud hosts or explicit DB_SSL='true', default to true.
let useSsl = false;
if (process.env.DB_SSL === 'false' || process.env.DB_SSL === '0') {
  useSsl = false;
} else if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
  useSsl = true;
} else if (process.env.DATABASE_URL?.includes('ssl=') || process.env.DATABASE_URL?.includes('sslmode=')) {
  useSsl = true;
} else if (isRemoteCloudHost) {
  useSsl = true;
}

function getSslObject(enable: boolean) {
  return enable ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined;
}

let activeSsl = getSslObject(useSsl);

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
      execSync('which mysqld || which mariadbd', { stdio: 'ignore' });
      execSync('pgrep -x mysqld || pgrep -x mariadbd', { stdio: 'ignore' });
    } catch {
      try {
        execSync('which mysqld_safe && mysqld_safe --user=mysql >/dev/null 2>&1 &', { stdio: 'ignore' });
      } catch {
        // Not installed or not startable locally
      }
    }
  }
}

// Initialize Primary MySQL Database connection
export async function initializeDatabase(): Promise<boolean> {
  ensureMysqlDaemonRunning();

  console.log(`[Database] Connecting to primary MySQL database at ${DB_HOST}:${DB_PORT}/${DB_NAME}...`);
  
  let currentSsl = activeSsl;

  // Helper to test and create pool with SSL fallback
  async function connectWithAutoSslFallback(): Promise<mysql.Pool> {
    try {
      const pool = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        ssl: currentSsl,
        waitForConnections: true,
        connectionLimit: 15,
        queueLimit: 0,
        decimalNumbers: true,
        connectTimeout: 2000
      });

      const [result] = await pool.query('SELECT 1 + 1 AS solution');
      console.log(`[Database] Verified MySQL connection pool successfully (SSL: ${Boolean(currentSsl)}):`, result);
      return pool;
    } catch (err: any) {
      const msg = err.message || '';
      // If server does not support SSL, retry without SSL
      if (currentSsl && (msg.includes('Server does not support secure connection') || msg.includes('HANDSHAKE_NO_SSL_SUPPORT'))) {
        console.warn('[Database] Target MySQL does not support SSL. Switching to standard non-SSL connection...');
        currentSsl = undefined;
        const pool = mysql.createPool({
          host: DB_HOST,
          port: DB_PORT,
          user: DB_USER,
          password: DB_PASSWORD,
          database: DB_NAME,
          ssl: undefined,
          waitForConnections: true,
          connectionLimit: 15,
          queueLimit: 0,
          decimalNumbers: true,
          connectTimeout: 2000
        });
        const [result] = await pool.query('SELECT 1 + 1 AS solution');
        console.log('[Database] Verified MySQL connection pool successfully without SSL:', result);
        return pool;
      }

      // If server requires SSL transport (e.g. TiDB Cloud Serverless)
      if (!currentSsl && (msg.includes('insecure transport') || msg.includes('secure connection is required') || msg.includes('SSL connection is required'))) {
        console.warn('[Database] Target MySQL requires SSL (e.g. TiDB Cloud). Enabling SSL connection...');
        currentSsl = getSslObject(true);
        const pool = mysql.createPool({
          host: DB_HOST,
          port: DB_PORT,
          user: DB_USER,
          password: DB_PASSWORD,
          database: DB_NAME,
          ssl: currentSsl,
          waitForConnections: true,
          connectionLimit: 15,
          queueLimit: 0,
          decimalNumbers: true,
          connectTimeout: 2000
        });
        const [result] = await pool.query('SELECT 1 + 1 AS solution');
        console.log('[Database] Verified MySQL connection pool successfully with SSL:', result);
        return pool;
      }

      throw err;
    }
  }

  // Attempt database creation if permission allows
  try {
    const tempPool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      ssl: currentSsl,
      waitForConnections: true,
      connectionLimit: 2,
      connectTimeout: 2000
    });
    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tempPool.end();
  } catch (err: any) {
    // Silent note
  }

  try {
    mysqlPool = await connectWithAutoSslFallback();
  } catch (error: any) {
    console.warn(`[Database] MySQL not reachable at ${DB_HOST}:${DB_PORT}/${DB_NAME} (${error.message}). Activating in-memory database mock.`);
    mysqlPool = createMockPool();
    return true;
  }

  // Execute schema synchronization
  try {
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      const statements = schemaSql
        .split(';')
        .map(s => s.replace(/--.*$/gm, '').trim())
        .filter(s => s.length > 0 && !s.toLowerCase().startsWith('use ') && !s.toLowerCase().startsWith('create database'));

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
