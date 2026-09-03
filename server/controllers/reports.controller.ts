import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getPool } from '../config/db';

export async function getExpensesReport(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const location = (req.query.location as string || '').trim();
    const category = (req.query.category as string || '').trim();
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const pool = getPool();

    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params: any[] = [userId];

    if (location && location !== 'All') {
      query += ' AND LOWER(location_name) = LOWER(?)';
      params.push(location);
    }
    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC';
    const [rows]: any = await pool.query(query, params);

    const totalAmount = rows.reduce((sum: number, r: any) => sum + (parseFloat(r.amount) || 0), 0);
    const totalCount = rows.length;

    res.json({
      success: true,
      summary: {
        totalAmount,
        totalCount,
        averageTicket: totalCount > 0 ? Math.round(totalAmount / totalCount) : 0
      },
      data: rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        amount: parseFloat(r.amount) || 0,
        category: r.category,
        location: r.location_name,
        date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).substring(0, 10),
        paymentMethod: r.payment_method,
        description: r.description,
        taxDeductible: Boolean(r.tax_deductible),
        status: r.status
      }))
    });
  } catch (error: any) {
    console.error('[Reports Controller] Expenses report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate expense report from MySQL.' });
  }
}

export async function getLocationComparison(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const pool = getPool();

    const [locations]: any = await pool.query('SELECT * FROM locations WHERE user_id = ? ORDER BY name ASC', [userId]);
    const [expenses]: any = await pool.query('SELECT location_name, amount, category FROM expenses WHERE user_id = ?', [userId]);

    const totalEnterpriseSpend = expenses.reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);

    const comparison = locations.map((loc: any) => {
      const locExps = expenses.filter((e: any) => e.location_name.toLowerCase() === loc.name.toLowerCase());
      const total = locExps.reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);
      const count = locExps.length;
      const budget = parseFloat(loc.budget_limit) || 100000;
      const avg = count > 0 ? Math.round(total / count) : 0;
      const utilization = budget > 0 ? Math.round((total / budget) * 100) : 0;
      const share = totalEnterpriseSpend > 0 ? Math.round((total / totalEnterpriseSpend) * 100) : 0;

      // Find top category
      const catMap: Record<string, number> = {};
      locExps.forEach((e: any) => {
        catMap[e.category] = (catMap[e.category] || 0) + (parseFloat(e.amount) || 0);
      });
      const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

      return {
        id: loc.id,
        name: loc.name,
        code: loc.code,
        state: loc.state,
        budgetLimit: budget,
        actualSpend: total,
        budgetUtilization: utilization,
        sharePercentage: share,
        transactionCount: count,
        averageTicket: avg,
        topCategory: topCat,
        color: loc.color
      };
    }).sort((a: any, b: any) => b.actualSpend - a.actualSpend);

    res.json({ success: true, data: comparison });
  } catch (error: any) {
    console.error('[Reports Controller] Location comparison error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate location comparison from MySQL.' });
  }
}

export async function getCategoryAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const pool = getPool();

    const [totalRows]: any = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = ?',
      [userId]
    );
    const overallTotal = parseFloat(totalRows[0]?.total) || 0;

    const [rows]: any = await pool.query(
      `SELECT category, SUM(amount) AS total, COUNT(*) AS count 
       FROM expenses 
       WHERE user_id = ? 
       GROUP BY category 
       ORDER BY total DESC`,
      [userId]
    );

    const data = rows.map((r: any) => {
      const total = parseFloat(r.total) || 0;
      const count = parseInt(r.count) || 0;
      return {
        name: r.category,
        total,
        count,
        percentage: overallTotal > 0 ? Math.round((total / overallTotal) * 100) : 0,
        average: count > 0 ? Math.round(total / count) : 0
      };
    });

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('[Reports Controller] Category analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate category analysis from MySQL.' });
  }
}
