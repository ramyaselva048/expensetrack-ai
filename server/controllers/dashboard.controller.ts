import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getPool } from '../config/db';

export async function getDashboardSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
    const pool = getPool();

    // 1. Total expenses and transaction count
    const [totalRows]: any = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total_amount, COUNT(*) AS total_count FROM expenses WHERE user_id = ?',
      [userId]
    );
    const totalExpenses = parseFloat(totalRows[0]?.total_amount) || 0;
    const totalTransactions = parseInt(totalRows[0]?.total_count) || 0;

    // 2. This month's expenses
    const [monthRows]: any = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS month_amount FROM expenses WHERE user_id = ? AND date LIKE ?',
      [userId, `${currentMonthPrefix}%`]
    );
    const thisMonthExpenses = parseFloat(monthRows[0]?.month_amount) || 0;

    // 3. Today's expenses
    const [todayRows]: any = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS today_amount FROM expenses WHERE user_id = ? AND date = ?',
      [userId, todayStr]
    );
    const todayExpenses = parseFloat(todayRows[0]?.today_amount) || 0;

    // 4. Highest spending location
    const [locRows]: any = await pool.query(
      `SELECT location_name, SUM(amount) AS loc_total, COUNT(*) AS loc_count 
       FROM expenses 
       WHERE user_id = ? 
       GROUP BY location_name 
       ORDER BY loc_total DESC 
       LIMIT 1`,
      [userId]
    );
    const highestLocation = locRows.length > 0 ? {
      name: locRows[0].location_name,
      total: parseFloat(locRows[0].loc_total) || 0,
      count: parseInt(locRows[0].loc_count) || 0,
      percentage: totalExpenses > 0 ? Math.round((parseFloat(locRows[0].loc_total) / totalExpenses) * 100) : 0
    } : { name: 'None', total: 0, count: 0, percentage: 0 };

    // 5. Highest spending category
    const [catRows]: any = await pool.query(
      `SELECT category, SUM(amount) AS cat_total, COUNT(*) AS cat_count 
       FROM expenses 
       WHERE user_id = ? 
       GROUP BY category 
       ORDER BY cat_total DESC 
       LIMIT 1`,
      [userId]
    );
    const highestCategory = catRows.length > 0 ? {
      name: catRows[0].category,
      total: parseFloat(catRows[0].cat_total) || 0,
      count: parseInt(catRows[0].cat_count) || 0,
      percentage: totalExpenses > 0 ? Math.round((parseFloat(catRows[0].cat_total) / totalExpenses) * 100) : 0
    } : { name: 'None', total: 0, count: 0, percentage: 0 };

    res.json({
      success: true,
      data: {
        totalExpenses,
        thisMonthExpenses,
        todayExpenses,
        totalTransactions,
        highestSpendingLocation: highestLocation,
        highestSpendingCategory: highestCategory
      }
    });
  } catch (error: any) {
    console.error('[Dashboard Controller] Dashboard summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard summary from MySQL.' });
  }
}

export async function getDashboardMonthly(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const pool = getPool();

    // Generate last 6 months keys (e.g. 2026-03, 2026-04, 2026-05, ...)
    const months: { label: string; key: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      months.push({ label, key: `${year}-${monthNum}` });
    }

    const [rows]: any = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') AS month_key, SUM(amount) AS total 
       FROM expenses 
       WHERE user_id = ? 
       GROUP BY month_key`,
      [userId]
    );

    const dbMap = new Map<string, number>();
    rows.forEach((r: any) => {
      dbMap.set(r.month_key, parseFloat(r.total) || 0);
    });

    const trendData = months.map(m => ({
      month: m.label,
      key: m.key,
      total: dbMap.get(m.key) || 0
    }));

    res.json({ success: true, data: trendData });
  } catch (error: any) {
    console.error('[Dashboard Controller] Dashboard monthly error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve monthly trend from MySQL.' });
  }
}

export async function getDashboardCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const pool = getPool();

    const [totalRows]: any = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = ?',
      [userId]
    );
    const overallTotal = parseFloat(totalRows[0]?.total) || 0;

    const [rows]: any = await pool.query(
      `SELECT category AS name, SUM(amount) AS total, COUNT(*) AS count 
       FROM expenses 
       WHERE user_id = ? 
       GROUP BY category 
       ORDER BY total DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: rows.map((r: any) => {
        const tot = parseFloat(r.total) || 0;
        return {
          name: r.name,
          total: tot,
          count: parseInt(r.count) || 0,
          percentage: overallTotal > 0 ? Math.round((tot / overallTotal) * 100) : 0
        };
      })
    });
  } catch (error: any) {
    console.error('[Dashboard Controller] Dashboard categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve categories from MySQL.' });
  }
}

export async function getDashboardLocations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const pool = getPool();

    // Get all locations for user with budget
    const [locations]: any = await pool.query(
      'SELECT id, name, code, budget_limit, color FROM locations WHERE user_id = ?',
      [userId]
    );

    const [totalRows]: any = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = ?',
      [userId]
    );
    const overallTotal = parseFloat(totalRows[0]?.total) || 0;

    const [expenseAggs]: any = await pool.query(
      `SELECT location_name, SUM(amount) AS total, COUNT(*) AS count 
       FROM expenses 
       WHERE user_id = ? 
       GROUP BY location_name`,
      [userId]
    );

    const aggMap = new Map<string, { total: number; count: number }>();
    expenseAggs.forEach((r: any) => {
      aggMap.set(r.location_name.toLowerCase(), {
        total: parseFloat(r.total) || 0,
        count: parseInt(r.count) || 0
      });
    });

    const locationData = locations.map((loc: any) => {
      const agg = aggMap.get(loc.name.toLowerCase()) || { total: 0, count: 0 };
      const budget = parseFloat(loc.budget_limit) || 100000;
      return {
        id: loc.id,
        name: loc.name,
        code: loc.code,
        color: loc.color,
        budgetLimit: budget,
        total: agg.total,
        count: agg.count,
        percentage: overallTotal > 0 ? Math.round((agg.total / overallTotal) * 100) : 0,
        budgetUtilization: budget > 0 ? Math.round((agg.total / budget) * 100) : 0
      };
    }).sort((a: any, b: any) => b.total - a.total);

    res.json({ success: true, data: locationData });
  } catch (error: any) {
    console.error('[Dashboard Controller] Dashboard locations error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve location breakdown from MySQL.' });
  }
}
