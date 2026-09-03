-- ====================================================================
-- ExpenseTrack – Multi-Location Expense Management System
-- Relational MySQL Database Schema
-- Compatible with MySQL 5.7+ / 8.0+ / MariaDB
-- ====================================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS expensetrack_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE expensetrack_db;

-- --------------------------------------------------------------------
-- 1. Table: users
-- Stores user accounts, profile details, company, and authentication info
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'Finance Manager',
    company_name VARCHAR(150) NOT NULL DEFAULT 'Enterprise Technologies',
    avatar_url TEXT,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. Table: locations
-- Stores multi-location branches (Chennai, Coimbatore, Bangalore, etc.)
-- Scoped per user for complete multi-tenant tenant isolation
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    state VARCHAR(100) NOT NULL,
    budget_limit DECIMAL(14, 2) NOT NULL DEFAULT 100000.00,
    color VARCHAR(20) NOT NULL DEFAULT '#3B82F6',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_locations_user (user_id),
    INDEX idx_locations_name (name),
    CONSTRAINT fk_locations_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. Table: categories
-- Operational expense categories with budget allocations
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    name VARCHAR(100) NOT NULL,
    budget_limit DECIMAL(14, 2) NOT NULL DEFAULT 50000.00,
    color VARCHAR(20) NOT NULL DEFAULT '#10B981',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categories_user (user_id),
    INDEX idx_categories_name (name),
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. Table: expenses
-- Every expense voucher recorded across branches
-- Fully normalized with user_id, location_id, category, and audit metadata
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(200) NOT NULL,
    amount DECIMAL(14, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    location_id VARCHAR(36) NULL,
    location_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Corporate Card',
    description TEXT,
    tax_deductible BOOLEAN NOT NULL DEFAULT TRUE,
    status ENUM('approved', 'pending', 'rejected') NOT NULL DEFAULT 'approved',
    receipt_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_expenses_user (user_id),
    INDEX idx_expenses_user_date (user_id, date),
    INDEX idx_expenses_user_location (user_id, location_name),
    INDEX idx_expenses_user_category (user_id, category),
    CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_expenses_location FOREIGN KEY (location_id) 
        REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Seed Data: Demo Administrator (Password: 'demo' hashed with bcrypt)
-- Hashed with salt rounds 10: $2b$10$7l7L2fVHIJr6U9zHifUuxewR327mntMyUvejFSAri3xtLGtgrSfuG
-- --------------------------------------------------------------------
INSERT INTO users (id, name, email, password, role, company_name, avatar_url, currency)
VALUES (
    'demo-user-1',
    'Alex Sterling',
    'alex.sterling@expensetrack.io',
    '$2b$10$7l7L2fVHIJr6U9zHifUuxewR327mntMyUvejFSAri3xtLGtgrSfuG',
    'Chief Financial Officer',
    'Apex Enterprise Technologies',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'INR'
), (
    'demo-user-2',
    'Demo Administrator',
    'demo@expensetrack.io',
    '$2b$10$7l7L2fVHIJr6U9zHifUuxewR327mntMyUvejFSAri3xtLGtgrSfuG',
    'Chief Financial Officer',
    'Apex Enterprise Technologies',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'INR'
) ON DUPLICATE KEY UPDATE password='$2b$10$7l7L2fVHIJr6U9zHifUuxewR327mntMyUvejFSAri3xtLGtgrSfuG';

-- --------------------------------------------------------------------
-- Seed Data: Primary Enterprise Locations
-- --------------------------------------------------------------------
INSERT INTO locations (id, user_id, name, code, state, budget_limit, color, description) VALUES
('loc-chn', 'demo-user-1', 'Chennai', 'CHN-HQ', 'Tamil Nadu', 350000.00, '#3B82F6', 'Corporate Headquarters & Primary Technology Hub (Tidel Park)'),
('loc-blr', 'demo-user-1', 'Bangalore', 'BLR-01', 'Karnataka', 280000.00, '#10B981', 'R&D Engineering Center & Product Design Lab (Electronic City)'),
('loc-cbe', 'demo-user-1', 'Coimbatore', 'CBE-01', 'Tamil Nadu', 180000.00, '#8B5CF6', 'Regional Operations & Support Branch (Avinashi Road)'),
('loc-mdu', 'demo-user-1', 'Madurai', 'MDU-01', 'Tamil Nadu', 140000.00, '#F59E0B', 'Tier-2 Development & Client Logistics Hub (Mattuthavani)'),
('loc-hyd', 'demo-user-1', 'Hyderabad', 'HYD-01', 'Telangana', 220000.00, '#06B6D4', 'HITEC City Cyber Tower Operations'),
('loc-koc', 'demo-user-1', 'Kochi', 'KOC-01', 'Kerala', 160000.00, '#EC4899', 'Infopark Tech Center & Maritime Logistics'),
('loc-pun', 'demo-user-1', 'Pune', 'PUN-01', 'Maharashtra', 200000.00, '#6366F1', 'Hinjewadi Tech Park Engineering Hub')
ON DUPLICATE KEY UPDATE id=id;

-- --------------------------------------------------------------------
-- Seed Data: Standard Categories
-- --------------------------------------------------------------------
INSERT INTO categories (id, user_id, name, budget_limit, color) VALUES
('cat-1', 'demo-user-1', 'Cloud & Infrastructure', 180000.00, '#3B82F6'),
('cat-2', 'demo-user-1', 'Travel & Lodging', 120000.00, '#10B981'),
('cat-3', 'demo-user-1', 'Office Supplies', 60000.00, '#8B5CF6'),
('cat-4', 'demo-user-1', 'Meals & Entertainment', 50000.00, '#F59E0B'),
('cat-5', 'demo-user-1', 'Software Subscriptions', 100000.00, '#EC4899'),
('cat-6', 'demo-user-1', 'Marketing & Events', 90000.00, '#06B6D4'),
('cat-7', 'demo-user-1', 'Utilities & Internet', 40000.00, '#EF4444'),
('cat-8', 'demo-user-1', 'Hardware & Equipment', 150000.00, '#6366F1')
ON DUPLICATE KEY UPDATE id=id;

-- --------------------------------------------------------------------
-- Seed Data: Multi-Location Expense Records
-- --------------------------------------------------------------------
INSERT INTO expenses (id, user_id, name, amount, category, location_id, location_name, date, payment_method, description, tax_deductible, status) VALUES
('exp-1', 'demo-user-1', 'AWS Global Cloud Hosting', 42500.00, 'Cloud & Infrastructure', 'loc-chn', 'Chennai', '2026-08-28', 'Corporate Card', 'Monthly production VPC clusters and RDS database hosting', TRUE, 'approved'),
('exp-2', 'demo-user-1', 'Executive Team Strategy Flight', 24500.00, 'Travel & Lodging', 'loc-blr', 'Bangalore', '2026-08-27', 'Corporate Card', 'Direct flights for annual executive quarterly review', TRUE, 'approved'),
('exp-3', 'demo-user-1', 'Ergonomic Office Chairs & Desks', 68000.00, 'Hardware & Equipment', 'loc-cbe', 'Coimbatore', '2026-08-26', 'Bank Transfer', 'Furniture fit-out for 15 newly onboarded support engineers', TRUE, 'approved'),
('exp-4', 'demo-user-1', 'High-Speed Fiber Lease Line', 14200.00, 'Utilities & Internet', 'loc-mdu', 'Madurai', '2026-08-25', 'Net Banking', 'Dedicated 1Gbps enterprise internet connection line', TRUE, 'approved'),
('exp-5', 'demo-user-1', 'Enterprise Figma & GitHub Org', 31000.00, 'Software Subscriptions', 'loc-chn', 'Chennai', '2026-08-24', 'Corporate Card', 'Annual developer and design system team licenses', TRUE, 'approved'),
('exp-6', 'demo-user-1', 'Client Dinner & Partner Hospitality', 12800.00, 'Meals & Entertainment', 'loc-blr', 'Bangalore', '2026-08-22', 'Corporate Card', 'Contract renewal banquet with enterprise retail client', TRUE, 'approved'),
('exp-7', 'demo-user-1', 'Regional Print Media & Promo Ads', 28500.00, 'Marketing & Events', 'loc-cbe', 'Coimbatore', '2026-08-21', 'UPI', 'Regional tech conference sponsorship banner and print kit', TRUE, 'approved'),
('exp-8', 'demo-user-1', 'MacBook Pro M3 Hardware Provision', 198000.00, 'Hardware & Equipment', 'loc-chn', 'Chennai', '2026-08-19', 'Bank Transfer', 'Laptops for senior full-stack and systems architects', TRUE, 'approved'),
('exp-9', 'demo-user-1', 'Branch Electricity & Generator Diesel', 21500.00, 'Utilities & Internet', 'loc-mdu', 'Madurai', '2026-08-18', 'Net Banking', 'Facility utility bill and backup power fuel recharge', TRUE, 'approved'),
('exp-10', 'demo-user-1', 'Hotel Stay & Tech Summit Conference', 18400.00, 'Travel & Lodging', 'loc-blr', 'Bangalore', '2026-08-16', 'Corporate Card', 'Accommodations for Bangalore AI & Cloud symposium delegates', TRUE, 'approved')
ON DUPLICATE KEY UPDATE id=id;
