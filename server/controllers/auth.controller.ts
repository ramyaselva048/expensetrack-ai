import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool, DbUser } from '../config/db';
import { AuthenticatedRequest, AuthUserPayload } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_production_jwt_key_expensetrack_2026';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, companyName, role, currency } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 4) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 4 characters long.'
      });
      return;
    }

    const pool = getPool();

    // Check existing user in MySQL
    const [existing]: any = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [normalizedEmail]
    );

    if (existing && existing.length > 0) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
      return;
    }

    // Hash password with bcrypt (salt rounds 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newUser: DbUser = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'Finance Executive',
      company_name: companyName || 'Enterprise Technologies',
      currency: currency || 'INR',
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert user into MySQL
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, company_name, currency, avatar_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        newUser.id,
        newUser.name,
        newUser.email,
        newUser.password,
        newUser.role,
        newUser.company_name,
        newUser.currency,
        newUser.avatar_url
      ]
    );

    // Seed default locations for new user in MySQL
    const defaultLocations = [
      [ `loc-${userId}-chn`, userId, 'Chennai', 'CHN-HQ', 'Tamil Nadu', 350000, '#3B82F6', 'Corporate Headquarters & Main Hub' ],
      [ `loc-${userId}-blr`, userId, 'Bangalore', 'BLR-01', 'Karnataka', 280000, '#10B981', 'R&D Center & Engineering Hub' ],
      [ `loc-${userId}-cbe`, userId, 'Coimbatore', 'CBE-01', 'Tamil Nadu', 180000, '#8B5CF6', 'Regional Operations & Support' ],
      [ `loc-${userId}-mdu`, userId, 'Madurai', 'MDU-01', 'Tamil Nadu', 140000, '#F59E0B', 'Logistics & Development Office' ],
    ];

    for (const loc of defaultLocations) {
      await pool.query(
        `INSERT INTO locations (id, user_id, name, code, state, budget_limit, color, description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        loc
      );
    }

    const payload: AuthUserPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyName: newUser.company_name,
        currency: newUser.currency,
        avatarUrl: newUser.avatar_url
      }
    });
  } catch (error: any) {
    console.error('[Auth Controller] Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration.'
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const pool = getPool();

    // Query user strictly from MySQL
    const [rows]: any = await pool.query(
      'SELECT id, name, email, password, role, company_name, currency, avatar_url FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'No account found with this email address. Please register.'
      });
      return;
    }

    const user: DbUser = rows[0];

    // Password verification strictly using bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.'
      });
      return;
    }

    const payload: AuthUserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.company_name,
        currency: user.currency || 'INR',
        avatarUrl: user.avatar_url
      }
    });
  } catch (error: any) {
    console.error('[Auth Controller] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const pool = getPool();
    const [rows]: any = await pool.query(
      'SELECT id, name, email, role, company_name, currency, avatar_url FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found in MySQL.' });
      return;
    }

    const user = rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.company_name,
        currency: user.currency || 'INR',
        avatarUrl: user.avatar_url
      }
    });
  } catch (error: any) {
    console.error('[Auth Controller] Me error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
}
