# ExpenseTrack — Enterprise Multi-Location Expense Management System

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%20%7C%20MariaDB-orange.svg)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A high-performance, full-stack enterprise expense management platform designed for multi-branch organizations. ExpenseTrack provides granular expense tracking across branch locations, automated budget utilization monitoring, category breakdowns, visual financial reporting, and secure multi-tenant access control backed by a real **MySQL/MariaDB** relational database.

---

## Architecture Overview

ExpenseTrack is built as a production-grade full-stack TypeScript application:

- **Frontend**: React 19, Tailwind CSS 4, Lucide React, Recharts, Framer Motion animations.
- **Backend API**: Node.js, Express, TypeScript, RESTful JSON endpoints.
- **Database**: MySQL 8.0+ / MariaDB 10.5+ with parameterized SQL queries, foreign key cascading, composite indexes, and strict multi-tenant data isolation.
- **Security**: Password hashing with `bcryptjs` (salt rounds: 10), stateless JSON Web Tokens (`jsonwebtoken`), and strict authorization middleware.
- **Unified Deployment**: In production, the compiled Node.js backend serves both the `/api/*` REST endpoints and the optimized static client assets with SPA fallback routing from a single container or server.

---

## Production Readiness & Security Standards

- **Zero Mock / Fallback Storage**: All transactions, locations, categories, and users are stored strictly in MySQL.
- **Parameterized Queries**: All database operations use prepared statements to prevent SQL injection vulnerabilities.
- **Multi-Tenant Isolation**: Every database query scopes access strictly to the authenticated `user_id`.
- **Environment Isolation**: Sensitive credentials are never committed to version control.

---

## Repository Structure

```
├── .env.example              # Environment variables template (safe to commit)
├── .gitignore                # Git exclusions (ensures .env & dist are never committed)
├── index.html                # Application entry HTML
├── package.json              # Project dependencies and build scripts
├── schema.sql                # Complete MySQL DDL schema and initial seeds
├── server.ts                 # Express production server & Vite integration entry
├── metadata.json             # Application metadata configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite bundler configuration
├── server/                   # Backend architecture
│   ├── config/
│   │   └── db.ts             # MySQL pool initialization, connection handling & SSL
│   ├── controllers/          # API route controllers (auth, expenses, locations, etc.)
│   ├── middleware/           # JWT authentication & request validation
│   └── routes/               # Express route definitions
├── src/                      # Frontend architecture
│   ├── components/           # UI components (modals, charts, nav, filters)
│   ├── context/              # React Context (AuthContext, ExpenseContext)
│   ├── pages/                # Main views (Dashboard, Expenses, Locations, Reports)
│   ├── services/             # Unified API client with automatic JWT handling
│   ├── types.ts              # Shared TypeScript data models
│   └── main.tsx              # React client mount
└── scripts/                  # Production test and verification utilities
    └── verify_production.ts  # Automated 19-step MySQL verification suite
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Optional | `3000` | Port on which the HTTP server listens |
| `NODE_ENV` | Recommended | `production` | Environment mode (`development` or `production`) |
| `DB_HOST` | Required* | `127.0.0.1` | MySQL server host or IP address |
| `DB_PORT` | Optional | `3306` | MySQL server port |
| `DB_USER` | Required* | `root` | Database username |
| `DB_PASSWORD` | Required* | `""` | Database password |
| `DB_NAME` | Required* | `expensetrack_db` | Name of the database |
| `DATABASE_URL` | Optional | `""` | Complete MySQL connection URI (alternative to `DB_*` vars) |
| `DB_SSL` | Optional | `false` | Set to `true` if your cloud DB requires SSL/TLS (e.g. AWS RDS, PlanetScale) |
| `JWT_SECRET` | **Required** | — | Strong secret string used to sign and verify JWT authentication tokens |
| `VITE_API_URL` | Optional | `""` | Set only if the frontend is hosted on a separate domain from the backend |

*\* Note: If `DATABASE_URL` is set (e.g., on Railway, Render, or Heroku), it will be automatically parsed to configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.*

---

## Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MySQL** or **MariaDB**: v8.0+ / v10.5+ running locally or in Docker

### 2. Installation
```bash
# Clone repository
git clone https://github.com/<your-username>/expensetrack.git
cd expensetrack

# Install project dependencies
npm install
```

### 3. Database Initialization
Create the database and apply the schema:
```bash
# Log into MySQL and create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS expensetrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Apply table schema and seed data
mysql -u root -p expensetrack_db < schema.sql
```

### 4. Configure Environment
Create a `.env` file from the provided template:
```bash
cp .env.example .env
```
Edit `.env` and provide your database credentials:
```ini
PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_mysql_password
DB_NAME=expensetrack_db

JWT_SECRET=dev_secret_replace_with_strong_random_key_in_production
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Run

### 1. Build Client and Server Bundles
```bash
npm run build
```
This performs:
1. `vite build`: Compiles the React client application into optimized static assets in `/dist`.
2. `esbuild server.ts`: Bundles the Express TypeScript backend into a standalone CommonJS file at `/dist/server.cjs`.

### 2. Run in Production
```bash
npm run start
```
The server will start on the port defined by `PORT` (defaults to `3000`), serving both API endpoints and the frontend application.

### 3. Verify Health
```bash
curl http://localhost:3000/api/health
```
Expected JSON response:
```json
{
  "status": "ok",
  "service": "ExpenseTrack Enterprise API",
  "database": "MySQL",
  "mysqlConnected": true,
  "databaseName": "expensetrack_db",
  "serverVersion": "...",
  "timestamp": "..."
}
```

---

## GitHub Setup & Push Instructions

### Files That Must NEVER Be Committed
- **`.env`** or any file containing real passwords, private keys, or API tokens.
- **`node_modules/`**
- **`dist/`** or **`build/`** artifacts.
- System logs (`*.log`).

*(These are already excluded in `.gitignore`)*

### Files To Commit
- All source code in `src/` and `server/`
- Configuration files: `package.json`, `package-lock.json` (or `bun.lock`), `tsconfig.json`, `vite.config.ts`
- Database schema: `schema.sql`
- Documentation & templates: `README.md`, `.gitignore`, `.env.example`, `metadata.json`
- Verification scripts: `scripts/verify_production.ts`

### Exact Git Commands
```bash
# 1. Initialize Git repository (if not already initialized)
git init

# 2. Verify git ignore rules (make sure .env does NOT appear in the status)
git status

# 3. Stage all approved files
git add .

# 4. Commit files
git commit -m "feat: initial release of ExpenseTrack Multi-Location Expense System"

# 5. Set default branch to main
git branch -M main

# 6. Add your GitHub remote repository
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 7. Push to GitHub
git push -u origin main
```

---

## Online Deployment Options

### Option 1: Railway (Recommended — Monolithic Full-Stack + MySQL)
1. Sign in to [Railway.app](https://railway.app/).
2. Create a **New Project** and add a **MySQL Database**.
3. In the MySQL service settings, copy the `DATABASE_URL` (or note the `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`).
4. Connect the database to a MySQL client and run `schema.sql` to initialize tables.
5. In the same Railway project, click **New** -> **GitHub Repo** and select your repository.
6. In **Variables**, add:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `${{MySQL.DATABASE_URL}}` *(Railway variable reference)*
   - `JWT_SECRET`: *(Generate a 64-char random string via `openssl rand -base64 32`)*
7. Build & start commands are detected automatically from `package.json`:
   - Build Command: `npm run build`
   - Start Command: `npm run start`

### Option 2: Render
1. Create a **Web Service** pointing to your GitHub repository.
2. Select **Node** environment.
3. Configure:
   - Build Command: `npm run build`
   - Start Command: `npm run start`
4. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `DB_HOST`: `<your-remote-mysql-host>`
   - `DB_PORT`: `3306`
   - `DB_USER`: `<your-db-user>`
   - `DB_PASSWORD`: `<your-db-password>`
   - `DB_NAME`: `<your-db-name>`
   - `DB_SSL`: `true` *(if using a cloud MySQL service requiring SSL)*
   - `JWT_SECRET`: `<your-production-jwt-secret>`
5. Deploy the service.

### Option 3: Docker / VPS (Ubuntu / Debian)
A simple `Dockerfile` can be used:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/schema.sql ./schema.sql
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

---

## Verification Suite

To run the automated 19-step production readiness and security verification test:
```bash
npx tsx scripts/verify_production.ts
```
This suite validates:
1. Direct MySQL connectivity & table integrity.
2. Password bcrypt hashing & verification.
3. Multi-tenant data segregation.
4. CRUD operations on locations and expenses.
5. SQL aggregation queries for dashboard & reports.
6. SQL injection resistance on search and filter parameters.
7. JWT authentication & unauthorized access rejection.

---

## License
MIT License. Free for commercial and non-commercial enterprise use.
