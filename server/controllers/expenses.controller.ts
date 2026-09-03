import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getPool } from '../config/db';

export async function getExpenses(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const search = (req.query.search as string || '').trim().toLowerCase();
    const category = (req.query.category as string || '').trim();
    const location = (req.query.location as string || '').trim();
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const sortBy = (req.query.sortBy as string || 'date').trim();
    const sortOrder = (req.query.sortOrder as string || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.max(1, Math.min(200, parseInt(req.query.limit as string || '50', 10)));
    const offset = (page - 1) * limit;

    const pool = getPool();
    let whereClause = 'WHERE user_id = ?';
    const params: any[] = [userId];

    if (search) {
      whereClause += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ? OR LOWER(location_name) LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    if (category && category !== 'All') {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (location && location !== 'All') {
      whereClause += ' AND LOWER(location_name) = LOWER(?)';
      params.push(location);
    }

    if (startDate) {
      whereClause += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND date <= ?';
      params.push(endDate);
    }

    // Count query for total
    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM expenses ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    // Safe column sorting
    const allowedSortColumns: Record<string, string> = {
      date: 'date',
      amount: 'amount',
      name: 'name',
      category: 'category',
      location: 'location_name'
    };
    const sortCol = allowedSortColumns[sortBy] || 'date';

    const selectQuery = `SELECT * FROM expenses ${whereClause} ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`;
    const queryParams = [...params, limit, offset];

    const [rows]: any = await pool.query(selectQuery, queryParams);

    res.json({
      success: true,
      data: rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        name: r.name,
        amount: parseFloat(r.amount) || 0,
        category: r.category,
        locationId: r.location_id,
        location: r.location_name,
        date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).substring(0, 10),
        paymentMethod: r.payment_method,
        description: r.description || '',
        taxDeductible: Boolean(r.tax_deductible),
        status: r.status,
        receiptUrl: r.receipt_url,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('[Expenses Controller] Get expenses error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve expenses from MySQL.' });
  }
}

export async function getExpenseById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const pool = getPool();

    const [rows]: any = await pool.query(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: 'Expense record not found in MySQL.' });
      return;
    }

    const r = rows[0];
    res.json({
      success: true,
      data: {
        id: r.id,
        userId: r.user_id,
        name: r.name,
        amount: parseFloat(r.amount) || 0,
        category: r.category,
        locationId: r.location_id,
        location: r.location_name,
        date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).substring(0, 10),
        paymentMethod: r.payment_method,
        description: r.description,
        taxDeductible: Boolean(r.tax_deductible),
        status: r.status,
        receiptUrl: r.receipt_url,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }
    });
  } catch (error: any) {
    console.error('[Expenses Controller] Get expense by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve expense from MySQL.' });
  }
}

export async function createExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const {
      name,
      amount,
      category,
      location,
      locationId,
      date,
      paymentMethod,
      description,
      taxDeductible,
      status,
      receiptUrl
    } = req.body;

    if (!name || amount === undefined || !category || !location) {
      res.status(400).json({
        success: false,
        message: 'Name/Merchant, amount, category, and location are required.'
      });
      return;
    }

    const expId = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const parsedAmount = Math.max(0, parseFloat(amount) || 0);
    const expDate = date ? String(date).substring(0, 10) : new Date().toISOString().split('T')[0];
    const expMethod = paymentMethod || 'Corporate Card';
    const expDesc = description || '';
    const expTax = taxDeductible !== undefined ? Boolean(taxDeductible) : true;
    const expStatus = (['approved', 'pending', 'rejected'].includes(status) ? status : 'approved') as 'approved' | 'pending' | 'rejected';

    const pool = getPool();

    // Resolve locationId if not provided
    let resolvedLocId = locationId || null;
    if (!resolvedLocId) {
      const [locRows]: any = await pool.query(
        'SELECT id FROM locations WHERE LOWER(name) = LOWER(?) AND user_id = ? LIMIT 1',
        [location.trim(), userId]
      );
      if (locRows && locRows.length > 0) {
        resolvedLocId = locRows[0].id;
      }
    }

    await pool.query(
      `INSERT INTO expenses 
       (id, user_id, name, amount, category, location_id, location_name, date, payment_method, description, tax_deductible, status, receipt_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        expId,
        userId,
        name.trim(),
        parsedAmount,
        category.trim(),
        resolvedLocId,
        location.trim(),
        expDate,
        expMethod,
        expDesc,
        expTax,
        expStatus,
        receiptUrl || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Expense created successfully in MySQL.',
      data: {
        id: expId,
        userId,
        name: name.trim(),
        amount: parsedAmount,
        category: category.trim(),
        locationId: resolvedLocId,
        location: location.trim(),
        date: expDate,
        paymentMethod: expMethod,
        description: expDesc,
        taxDeductible: expTax,
        status: expStatus,
        receiptUrl: receiptUrl || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('[Expenses Controller] Create expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to create expense in MySQL.' });
  }
}

export async function updateExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const {
      name,
      amount,
      category,
      location,
      locationId,
      date,
      paymentMethod,
      description,
      taxDeductible,
      status,
      receiptUrl
    } = req.body;

    const pool = getPool();
    const [existing]: any = await pool.query(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    if (!existing || existing.length === 0) {
      res.status(404).json({ success: false, message: 'Expense record not found.' });
      return;
    }

    const prev = existing[0];
    const updatedName = name !== undefined ? name.trim() : prev.name;
    const updatedAmount = amount !== undefined ? Math.max(0, parseFloat(amount) || 0) : prev.amount;
    const updatedCategory = category !== undefined ? category.trim() : prev.category;
    const updatedLocation = location !== undefined ? location.trim() : prev.location_name;
    const updatedDate = date !== undefined ? String(date).substring(0, 10) : prev.date;
    const updatedMethod = paymentMethod !== undefined ? paymentMethod : prev.payment_method;
    const updatedDesc = description !== undefined ? description : prev.description;
    const updatedTax = taxDeductible !== undefined ? Boolean(taxDeductible) : prev.tax_deductible;
    const updatedStatus = status !== undefined ? status : prev.status;
    const updatedReceipt = receiptUrl !== undefined ? receiptUrl : prev.receipt_url;

    let resolvedLocId = locationId !== undefined ? locationId : prev.location_id;
    if (location !== undefined && !locationId) {
      const [locRows]: any = await pool.query(
        'SELECT id FROM locations WHERE LOWER(name) = LOWER(?) AND user_id = ? LIMIT 1',
        [updatedLocation, userId]
      );
      if (locRows && locRows.length > 0) resolvedLocId = locRows[0].id;
    }

    await pool.query(
      `UPDATE expenses 
       SET name = ?, amount = ?, category = ?, location_id = ?, location_name = ?, date = ?, 
           payment_method = ?, description = ?, tax_deductible = ?, status = ?, receipt_url = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [
        updatedName,
        updatedAmount,
        updatedCategory,
        resolvedLocId,
        updatedLocation,
        updatedDate,
        updatedMethod,
        updatedDesc,
        updatedTax,
        updatedStatus,
        updatedReceipt,
        id,
        userId
      ]
    );

    res.json({
      success: true,
      message: 'Expense record updated successfully in MySQL.',
      data: {
        id,
        userId,
        name: updatedName,
        amount: parseFloat(updatedAmount),
        category: updatedCategory,
        locationId: resolvedLocId,
        location: updatedLocation,
        date: updatedDate instanceof Date ? updatedDate.toISOString().split('T')[0] : String(updatedDate).substring(0, 10),
        paymentMethod: updatedMethod,
        description: updatedDesc,
        taxDeductible: Boolean(updatedTax),
        status: updatedStatus,
        receiptUrl: updatedReceipt
      }
    });
  } catch (error: any) {
    console.error('[Expenses Controller] Update expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to update expense in MySQL.' });
  }
}

export async function deleteExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const pool = getPool();

    const [result]: any = await pool.query(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Expense not found or already removed.' });
      return;
    }

    res.json({ success: true, message: 'Expense voucher deleted successfully from MySQL.' });
  } catch (error: any) {
    console.error('[Expenses Controller] Delete expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete expense from MySQL.' });
  }
}

export async function bulkDeleteExpenses(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: 'An array of expense IDs is required.' });
      return;
    }

    const pool = getPool();
    const placeholders = ids.map(() => '?').join(',');
    const [result]: any = await pool.query(
      `DELETE FROM expenses WHERE user_id = ? AND id IN (${placeholders})`,
      [userId, ...ids]
    );

    res.json({
      success: true,
      message: `Successfully deleted ${result.affectedRows} expense records from MySQL.`
    });
  } catch (error: any) {
    console.error('[Expenses Controller] Bulk delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to execute bulk deletion in MySQL.' });
  }
}
