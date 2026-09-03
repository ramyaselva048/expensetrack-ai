import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getPool } from '../config/db';

export async function getLocations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const search = (req.query.search as string || '').trim().toLowerCase();
    const pool = getPool();

    let query = 'SELECT * FROM locations WHERE user_id = ?';
    const params: any[] = [userId];

    if (search) {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(code) LIKE ? OR LOWER(state) LIKE ?)';
      const likeStr = `%${search}%`;
      params.push(likeStr, likeStr, likeStr);
    }

    query += ' ORDER BY name ASC';
    const [rows]: any = await pool.query(query, params);

    res.json({
      success: true,
      data: rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        name: r.name,
        code: r.code,
        state: r.state,
        budgetLimit: parseFloat(r.budget_limit) || 100000,
        color: r.color || '#3B82F6',
        description: r.description || '',
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }))
    });
  } catch (error: any) {
    console.error('[Locations Controller] Get locations error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve locations from MySQL.' });
  }
}

export async function getLocationById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const pool = getPool();

    const [rows]: any = await pool.query(
      'SELECT * FROM locations WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: 'Location not found.' });
      return;
    }

    const r = rows[0];
    res.json({
      success: true,
      data: {
        id: r.id,
        userId: r.user_id,
        name: r.name,
        code: r.code,
        state: r.state,
        budgetLimit: parseFloat(r.budget_limit) || 100000,
        color: r.color,
        description: r.description,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }
    });
  } catch (error: any) {
    console.error('[Locations Controller] Get location by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve location from MySQL.' });
  }
}

export async function createLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { name, code, state, budgetLimit, color, description } = req.body;

    if (!name || !state) {
      res.status(400).json({ success: false, message: 'City/Location name and State are required.' });
      return;
    }

    const locId = `loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const parsedBudget = parseFloat(budgetLimit) || 100000;
    const locCode = (code || name.substring(0, 3).toUpperCase()).trim();
    const locColor = color || '#3B82F6';
    const locDesc = description || '';
    const pool = getPool();

    await pool.query(
      `INSERT INTO locations (id, user_id, name, code, state, budget_limit, color, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [locId, userId, name.trim(), locCode, state.trim(), parsedBudget, locColor, locDesc]
    );

    res.status(201).json({
      success: true,
      message: 'Location created successfully in MySQL.',
      data: {
        id: locId,
        userId,
        name: name.trim(),
        code: locCode,
        state: state.trim(),
        budgetLimit: parsedBudget,
        color: locColor,
        description: locDesc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('[Locations Controller] Create location error:', error);
    res.status(500).json({ success: false, message: 'Failed to create location in MySQL.' });
  }
}

export async function updateLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, code, state, budgetLimit, color, description } = req.body;
    const pool = getPool();

    const [existing]: any = await pool.query(
      'SELECT * FROM locations WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    if (!existing || existing.length === 0) {
      res.status(404).json({ success: false, message: 'Location not found.' });
      return;
    }

    const prev = existing[0];
    const updatedName = name !== undefined ? name.trim() : prev.name;
    const updatedCode = code !== undefined ? code.trim() : prev.code;
    const updatedState = state !== undefined ? state.trim() : prev.state;
    const updatedBudget = budgetLimit !== undefined ? (parseFloat(budgetLimit) || 100000) : prev.budget_limit;
    const updatedColor = color !== undefined ? color : prev.color;
    const updatedDesc = description !== undefined ? description : prev.description;

    await pool.query(
      `UPDATE locations 
       SET name = ?, code = ?, state = ?, budget_limit = ?, color = ?, description = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [updatedName, updatedCode, updatedState, updatedBudget, updatedColor, updatedDesc, id, userId]
    );

    // If location name changed, cascade update expenses with this location_id for consistency
    if (updatedName !== prev.name) {
      await pool.query(
        'UPDATE expenses SET location_name = ? WHERE location_id = ? AND user_id = ?',
        [updatedName, id, userId]
      );
    }

    res.json({
      success: true,
      message: 'Location updated successfully in MySQL.',
      data: {
        id,
        userId,
        name: updatedName,
        code: updatedCode,
        state: updatedState,
        budgetLimit: updatedBudget,
        color: updatedColor,
        description: updatedDesc
      }
    });
  } catch (error: any) {
    console.error('[Locations Controller] Update location error:', error);
    res.status(500).json({ success: false, message: 'Failed to update location in MySQL.' });
  }
}

export async function deleteLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const pool = getPool();

    const [result]: any = await pool.query(
      'DELETE FROM locations WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Location not found or already deleted.' });
      return;
    }

    res.json({ success: true, message: 'Location deleted successfully from MySQL.' });
  } catch (error: any) {
    console.error('[Locations Controller] Delete location error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete location from MySQL.' });
  }
}
