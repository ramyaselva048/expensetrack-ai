import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getPool } from '../config/db';

export async function getCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const pool = getPool();

    const [rows]: any = await pool.query(
      'SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL ORDER BY name ASC',
      [userId]
    );

    res.json({
      success: true,
      data: rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        budgetLimit: parseFloat(r.budget_limit) || 50000,
        color: r.color || '#10B981'
      }))
    });
  } catch (error: any) {
    console.error('[Categories Controller] Get categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve categories from MySQL.' });
  }
}

export async function createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { name, budgetLimit, color } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required.' });
      return;
    }

    const catId = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const budget = parseFloat(budgetLimit) || 50000;
    const catColor = color || '#10B981';
    const pool = getPool();

    await pool.query(
      'INSERT INTO categories (id, user_id, name, budget_limit, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [catId, userId, name.trim(), budget, catColor]
    );

    res.status(201).json({
      success: true,
      data: {
        id: catId,
        name: name.trim(),
        budgetLimit: budget,
        color: catColor
      }
    });
  } catch (error: any) {
    console.error('[Categories Controller] Create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category in MySQL.' });
  }
}
