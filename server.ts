import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeDatabase, getPool } from './server/config/db';

import authRoutes from './server/routes/auth.routes';
import locationsRoutes from './server/routes/locations.routes';
import expensesRoutes from './server/routes/expenses.routes';
import dashboardRoutes from './server/routes/dashboard.routes';
import reportsRoutes from './server/routes/reports.routes';
import categoriesRoutes from './server/routes/categories.routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB & schema
  await initializeDatabase();

  // Basic Middlewares
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health Check with live MySQL verification
  app.get('/api/health', async (req, res) => {
    try {
      const pool = getPool();
      const [rows]: any = await pool.query('SELECT 1 as alive, DATABASE() as db, VERSION() as version');
      res.json({
        status: 'ok',
        service: 'ExpenseTrack Enterprise API',
        database: 'MySQL',
        mysqlConnected: true,
        databaseName: rows[0]?.db,
        serverVersion: rows[0]?.version,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(503).json({
        status: 'unhealthy',
        service: 'ExpenseTrack Enterprise API',
        database: 'MySQL',
        mysqlConnected: false,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/locations', locationsRoutes);
  app.use('/api/expenses', expensesRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/categories', categoriesRoutes);

  // 404 for unhandled API routes
  app.use('/api', (req, res, next) => {
    res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.originalUrl} not found.`
    });
  });

  // Global API Error Handler
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  });

  // Frontend Serving (Production static dist or Dev Vite)
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || hasDist;

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ExpenseTrack Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
